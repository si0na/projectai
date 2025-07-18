import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, insertWeeklyStatusReportSchema, 
  insertTechnicalReviewSchema, insertLlmConfigurationSchema 
} from "@shared/schema";
import { z } from "zod";
import { ExcelParser } from "./services/excelParser";
import { OpenAIService } from "./services/openaiService";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication middleware (simplified for demo)
  const requireAuth = (req: any, res: any, next: any) => {
    // In a real app, this would validate JWT tokens
    req.user = { id: 1, role: 'admin' }; // Samiksha as admin user
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };

  // Current user endpoint
  app.get('/api/users/me', requireAuth, async (req: any, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  app.get('/api/users', requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Projects endpoints
  app.get('/api/projects', requireAuth, async (req: any, res) => {
    try {
      let projects;
      if (req.user.role === 'project_manager') {
        projects = await storage.getProjectsByManager(req.user.id);
      } else {
        projects = await storage.getProjects();
      }
      
      // Enrich with project manager details
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          const pm = project.projectManagerId ? await storage.getUser(project.projectManagerId) : null;
          return { ...project, projectManager: pm };
        })
      );
      
      res.json(enrichedProjects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get('/api/projects/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const pm = project.projectManagerId ? await storage.getUser(project.projectManagerId) : null;
      res.json({ ...project, projectManager: pm });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.post('/api/projects', requireAuth, requireRole(['delivery_manager', 'admin']), async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', requireAuth, requireRole(['delivery_manager', 'admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid project data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  // Weekly Status Reports endpoints
  app.get('/api/weekly-reports', requireAuth, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const reports = await storage.getWeeklyStatusReports(projectId);
      
      // Enrich with project and user details
      const enrichedReports = await Promise.all(
        reports.map(async (report) => {
          const project = await storage.getProject(report.projectId);
          const submittedBy = report.submittedBy ? await storage.getUser(report.submittedBy) : null;
          return { ...report, project, submittedBy };
        })
      );
      
      res.json(enrichedReports);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weekly reports' });
    }
  });

  app.post('/api/weekly-reports', requireAuth, async (req: any, res) => {
    try {
      const reportData = insertWeeklyStatusReportSchema.parse(req.body);
      const reportWithUser = { ...reportData, submittedBy: req.user.id };
      
      const report = await storage.createWeeklyStatusReport(reportWithUser);
      
      // TODO: Trigger LLM analysis here
      // For now, we'll simulate it by updating the report with AI assessment
      
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid report data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create weekly report' });
    }
  });

  // Technical Reviews endpoints
  app.get('/api/technical-reviews', requireAuth, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const reviews = await storage.getTechnicalReviews(projectId);
      
      // Enrich with project and conductor details
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const project = await storage.getProject(review.projectId);
          const conductor = review.conductedBy ? await storage.getUser(review.conductedBy) : null;
          return { ...review, project, conductor };
        })
      );
      
      res.json(enrichedReviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch technical reviews' });
    }
  });

  app.post('/api/technical-reviews', requireAuth, async (req: any, res) => {
    try {
      const reviewData = insertTechnicalReviewSchema.parse(req.body);
      const reviewWithUser = { ...reviewData, conductedBy: req.user.id };
      
      const review = await storage.createTechnicalReview(reviewWithUser);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid review data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create technical review' });
    }
  });

  // LLM Configuration endpoints
  app.get('/api/llm-config', requireAuth, requireRole(['delivery_manager', 'admin']), async (req, res) => {
    try {
      const config = await storage.getActiveLlmConfiguration();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch LLM configuration' });
    }
  });

  app.post('/api/llm-config', requireAuth, requireRole(['delivery_manager', 'admin']), async (req: any, res) => {
    try {
      const configData = insertLlmConfigurationSchema.parse(req.body);
      const configWithUser = { ...configData, lastUpdatedBy: req.user.id };
      
      // Deactivate existing configurations
      const existing = await storage.getLlmConfigurations();
      await Promise.all(
        existing.map(config => 
          storage.updateLlmConfiguration(config.id, { isActive: false })
        )
      );
      
      const config = await storage.createLlmConfiguration(configWithUser);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid configuration data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create LLM configuration' });
    }
  });

  // Portfolio Analysis endpoints
  app.get('/api/portfolio-analysis', requireAuth, async (req, res) => {
    try {
      const analysis = await storage.getLatestPortfolioAnalysis();
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch portfolio analysis' });
    }
  });

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const reports = await storage.getWeeklyStatusReports();
      
      // Get latest report per project
      const latestReports = new Map<number, any>();
      reports.forEach(report => {
        if (!latestReports.has(report.projectId) || 
            report.createdAt! > latestReports.get(report.projectId).createdAt) {
          latestReports.set(report.projectId, report);
        }
      });

      const latestReportsArray = Array.from(latestReports.values());
      
      const stats = {
        greenProjects: latestReportsArray.filter(r => r.ragStatus === 'Green').length,
        amberProjects: latestReportsArray.filter(r => r.ragStatus === 'Amber').length,
        redProjects: latestReportsArray.filter(r => r.ragStatus === 'Red').length,
        escalations: latestReportsArray.filter(r => r.clientEscalation).length,
        totalProjects: latestReportsArray.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Trend data endpoint
  app.get('/api/dashboard/trends', requireAuth, async (req, res) => {
    try {
      const reports = await storage.getWeeklyStatusReports();
      
      // Group by reporting date and count RAG statuses
      const trendData = new Map<string, { green: number; amber: number; red: number }>();
      
      reports.forEach(report => {
        const weekKey = report.reportingDate.toISOString().split('T')[0];
        if (!trendData.has(weekKey)) {
          trendData.set(weekKey, { green: 0, amber: 0, red: 0 });
        }
        
        const counts = trendData.get(weekKey)!;
        if (report.ragStatus === 'Green') counts.green++;
        else if (report.ragStatus === 'Amber') counts.amber++;
        else if (report.ragStatus === 'Red') counts.red++;
      });
      
      const sortedTrends = Array.from(trendData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8) // Last 8 weeks
        .map(([date, counts]) => ({ date, ...counts }));
      
      res.json(sortedTrends);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch trend data' });
    }
  });

  // Excel Processing and AI Analysis endpoints
  app.post('/api/excel/parse', requireAuth, async (req, res) => {
    try {
      const excelFiles = ExcelParser.getExcelFiles();
      
      if (excelFiles.length === 0) {
        return res.status(404).json({ message: 'No Excel files found in public/excels directory' });
      }
      
      const allReportsData = [];
      const allSummaries = [];
      
      // Process each Excel file
      for (const filePath of excelFiles) {
        try {
          const reportsData = ExcelParser.parseWeeklyStatusReport(filePath);
          
          // Generate AI summaries for each project
          for (const reportData of reportsData) {
            try {
              const summary = await OpenAIService.generateProjectSummary(reportData);
              allSummaries.push(summary);
              allReportsData.push(reportData);
              
              // Store or update the report in the database
              await storage.createOrUpdateWeeklyReportFromExcel(reportData, summary);
            } catch (aiError) {
              console.error(`AI analysis failed for ${reportData.projectName}:`, aiError);
              // Continue with other projects even if one fails
            }
          }
        } catch (parseError) {
          console.error(`Failed to parse Excel file ${filePath}:`, parseError);
          // Continue with other files
        }
      }
      
      // Generate portfolio-level summary
      const portfolioSummary = await OpenAIService.generatePortfolioSummary(allSummaries);
      
      res.json({
        message: 'Excel files processed successfully',
        projectsProcessed: allSummaries.length,
        portfolioSummary,
        projectSummaries: allSummaries,
        rawData: allReportsData
      });
    } catch (error) {
      console.error('Excel processing error:', error);
      res.status(500).json({ 
        message: 'Failed to process Excel files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/excel/summaries', requireAuth, async (req, res) => {
    try {
      // Get recent AI-analyzed reports
      const reports = await storage.getAIAnalyzedReports();
      
      res.json({
        summaries: reports.map(report => ({
          projectName: report.projectName,
          weekNumber: report.weekNumber,
          overallHealth: report.aiStatus,
          summary: report.aiAssessmentDescription,
          reportingDate: report.reportingDate,
          healthTrend: `${report.healthPreviousWeek} → ${report.healthCurrentWeek}`
        }))
      });
    } catch (error) {
      console.error('Error fetching AI summaries:', error);
      res.status(500).json({ message: 'Failed to fetch AI summaries' });
    }
  });

  app.post('/api/excel/analyze-project/:projectId', requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Get latest report for this project
      const reports = await storage.getWeeklyStatusReports(projectId);
      const latestReport = reports[reports.length - 1];
      
      if (!latestReport) {
        return res.status(404).json({ message: 'No reports found for this project' });
      }
      
      // Convert to Excel format for AI analysis
      const reportData = {
        projectName: project.name,
        weekNumber: latestReport.weekNumber || 1,
        healthPreviousWeek: latestReport.healthPreviousWeek || 'Green',
        healthCurrentWeek: latestReport.healthCurrentWeek,
        updateForCurrentWeek: latestReport.updateForCurrentWeek || '',
        planForNextWeek: latestReport.planForNextWeek || '',
        issuesChallenges: latestReport.issuesChallenges || '',
        pathToGreen: latestReport.pathToGreen || '',
        resourcingStatus: latestReport.resourcingStatus || '',
        clientEscalation: latestReport.clientEscalation || 'None',
        tower: latestReport.tower || '',
        billingModel: latestReport.billingModel || '',
        fte: latestReport.fte || '',
        revenue: latestReport.revenue || ''
      };
      
      const summary = await OpenAIService.generateProjectSummary(reportData);
      
      // Update the report with AI analysis
      await storage.updateWeeklyStatusReport(latestReport.id, {
        aiStatus: summary.overallHealth,
        aiAssessmentDescription: summary.summary
      });
      
      res.json({
        projectName: project.name,
        summary,
        updatedReport: latestReport.id
      });
    } catch (error) {
      console.error('Project analysis error:', error);
      res.status(500).json({ 
        message: 'Failed to analyze project',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
