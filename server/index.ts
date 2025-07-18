import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "127.0.0.1",
  }, async () => {
    log(`serving on port ${port}`);
    
    // Auto-process Excel files on startup
    try {
      log('Checking for Excel files to process...');
      const { ExcelParser } = await import('./services/excelParser.js');
      const { OpenAIService } = await import('./services/openaiService.js');
      const path = await import('path');
      const fs = await import('fs');
      const { storage } = await import('./storage.js');
      
      const excelDir = path.join(process.cwd(), 'public', 'excels');
      
      if (fs.existsSync(excelDir)) {
        const excelFiles = fs.readdirSync(excelDir).filter(file => 
          file.endsWith('.xlsx') || file.endsWith('.xls')
        );
        
        if (excelFiles.length > 0) {
          log(`Auto-processing ${excelFiles.length} Excel files...`);
          
          let allReports: any[] = [];
          
          // Parse all Excel files
          for (const file of excelFiles) {
            try {
              const filePath = path.join(excelDir, file);
              const reports = await ExcelParser.parseWeeklyStatusReport(filePath);
              allReports = allReports.concat(reports);
              log(`Auto-parsed ${reports.length} reports from ${file}`);
            } catch (fileError) {
              log(`Auto-parse failed for ${file}: ${fileError.message}`);
            }
          }
          
          if (allReports.length > 0) {
            log(`Auto-processed ${allReports.length} total reports`);
            
            // Generate AI summaries  
            try {
              const projectSummaries = await OpenAIService.generatePortfolioAnalysis(allReports);
              const portfolioSummary = {
                overallHealth: 'Green',
                totalProjects: allReports.length,
                riskDistribution: {},
                keyRecommendations: [],
                criticalAlerts: []
              };
              
              // Store AI summaries
              storage.setAISummaries(projectSummaries, portfolioSummary);
              log(`AI analysis completed for ${projectSummaries.length} projects`);
            } catch (aiError) {
              log(`AI analysis skipped: ${aiError.message}`);
            }
          }
        } else {
          log('No Excel files found for auto-processing');
        }
      } else {
        log('Excel directory not found, creating...');
        fs.mkdirSync(excelDir, { recursive: true });
      }
    } catch (error) {
      log(`Auto-processing Excel files failed: ${error.message}`);
    }
  });
})();
