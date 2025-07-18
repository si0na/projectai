import { 
  users, projects, weeklyStatusReports, technicalReviews, llmConfigurations, portfolioAnalysis,
  type User, type InsertUser, type Project, type InsertProject, 
  type WeeklyStatusReport, type InsertWeeklyStatusReport,
  type TechnicalReview, type InsertTechnicalReview,
  type LlmConfiguration, type InsertLlmConfiguration,
  type PortfolioAnalysis, type InsertPortfolioAnalysis
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByManager(managerId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Weekly Status Reports
  getWeeklyStatusReports(projectId?: number): Promise<WeeklyStatusReport[]>;
  getWeeklyStatusReport(id: number): Promise<WeeklyStatusReport | undefined>;
  createWeeklyStatusReport(report: InsertWeeklyStatusReport): Promise<WeeklyStatusReport>;
  updateWeeklyStatusReport(id: number, report: Partial<WeeklyStatusReport>): Promise<WeeklyStatusReport | undefined>;
  
  // Technical Reviews
  getTechnicalReviews(projectId?: number): Promise<TechnicalReview[]>;
  getTechnicalReview(id: number): Promise<TechnicalReview | undefined>;
  createTechnicalReview(review: InsertTechnicalReview): Promise<TechnicalReview>;
  updateTechnicalReview(id: number, review: Partial<TechnicalReview>): Promise<TechnicalReview | undefined>;
  
  // LLM Configuration
  getLlmConfigurations(): Promise<LlmConfiguration[]>;
  getActiveLlmConfiguration(): Promise<LlmConfiguration | undefined>;
  createLlmConfiguration(config: InsertLlmConfiguration): Promise<LlmConfiguration>;
  updateLlmConfiguration(id: number, config: Partial<LlmConfiguration>): Promise<LlmConfiguration | undefined>;
  
  // Portfolio Analysis
  getLatestPortfolioAnalysis(): Promise<PortfolioAnalysis | undefined>;
  createPortfolioAnalysis(analysis: InsertPortfolioAnalysis): Promise<PortfolioAnalysis>;
  getPortfolioAnalysisHistory(limit?: number): Promise<PortfolioAnalysis[]>;
  
  // Excel Integration
  createOrUpdateWeeklyReportFromExcel(reportData: any, summary: any): Promise<WeeklyStatusReport>;
  getAIAnalyzedReports(): Promise<WeeklyStatusReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private weeklyStatusReports: Map<number, WeeklyStatusReport>;
  private technicalReviews: Map<number, TechnicalReview>;
  private llmConfigurations: Map<number, LlmConfiguration>;
  private portfolioAnalyses: Map<number, PortfolioAnalysis>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.weeklyStatusReports = new Map();
    this.technicalReviews = new Map();
    this.llmConfigurations = new Map();
    this.portfolioAnalyses = new Map();
    this.currentId = 1;
    
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create test users
    const testUsers = [
      { username: "samiksha", email: "samiksha@company.com", role: "admin", name: "Samiksha" },
      { username: "sarah.chen", email: "sarah.chen@company.com", role: "project_manager", name: "Sarah Chen" },
      { username: "david.miller", email: "david.miller@company.com", role: "delivery_manager", name: "David Miller" },
      { username: "mike.rodriguez", email: "mike.rodriguez@company.com", role: "project_manager", name: "Mike Rodriguez" },
      { username: "lisa.park", email: "lisa.park@company.com", role: "project_manager", name: "Lisa Park" },
    ];

    testUsers.forEach(user => {
      const id = this.currentId++;
      this.users.set(id, { ...user, id });
    });

    // Create test projects - 100 projects with varied data
    const engagementTypes = ["Development", "Migration", "Analytics", "Integration", "Modernization", "Maintenance", "Consulting", "Support"];
    const customerTypes = ["TechCorp", "RetailCo", "DataFlow", "CloudSys", "FinTech", "HealthPlus", "EduTech", "LogiFlow"];
    const projectTypes = ["Portal", "Mobile App", "Analytics Platform", "API Gateway", "Database", "Dashboard", "CRM", "ERP", "E-commerce", "CMS"];
    const versions = ["v1.0", "v2.0", "v3.0", "2025", "Next Gen", "Pro", "Enterprise", "Advanced"];
    
    const testProjects = [];
    
    for (let i = 1; i <= 100; i++) {
      const customerType = customerTypes[i % customerTypes.length];
      const projectType = projectTypes[i % projectTypes.length];
      const version = versions[i % versions.length];
      const engagementType = engagementTypes[i % engagementTypes.length];
      const pmId = (i % 3) + 1; // Rotate between PM IDs 1, 2, 3 (but we only have 1, 4, 5, so let's fix this)
      const actualPmId = i % 3 === 0 ? 1 : i % 3 === 1 ? 4 : 5;
      
      testProjects.push({
        name: `${projectType} ${version}`,
        codeId: `${projectType.replace(/\s+/g, '').substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
        customer: `${customerType} ${i <= 50 ? 'Inc' : i <= 75 ? 'Ltd' : 'Corp'}`,
        engagementType,
        deliveryModel: ["Fixed Price", "Time & Material", "Agile"][i % 3],
        projectImportance: ["High", "Medium", "Low"][i % 3],
        ragStatus: ["Green", "Amber", "Red"][i % 3],
        scopeDescription: `${projectType} project for ${customerType} involving ${engagementType.toLowerCase()} work.`,
        projectManagerId: actualPmId,
        deliveryManagerId: 2,
        teamSquad: [`Alpha Squad`, `Beta Team`, `Gamma Unit`][i % 3],
        startDate: new Date(2024, 0, 1 + (i % 365)),
        plannedEndDate: new Date(2024, 0, 1 + (i % 365) + 180),
        clientEscalation: i % 10 === 0, // 10% escalated
        isActive: i <= 95, // Make 95 projects active, 5 inactive
        aiMonitoringEnabled: true,
        projectTags: [`tag-${i % 5}`, `${engagementType.toLowerCase()}`],
        slaKpiMetrics: `99.${90 + (i % 10)}% uptime`,
        documentationUrl: i % 4 === 0 ? `https://docs.${customerType.toLowerCase()}.com/project-${i}` : "",
      });
    }
    
    // Add realistic projects based on Excel data
    const realProjects = [
      { 
        name: "CALX Compass", 
        codeId: "CALX-001", 
        account: "CALX",
        customer: "CALX", 
        engagementType: "Development",
        deliveryModel: "Managed",
        billingModel: "Fixed Bid",
        projectImportance: "Strategic",
        ragStatus: "Red",
        scopeDescription: "Critical compass application with pending showstopper items related to UI component library, CMS and Maps affecting overall schedule.",
        projectManagerId: 1,
        deliveryManagerId: 2,
        teamSquad: "Alpha Squad",
        tower: "Tower 2",
        fte: "",
        revenue: "",
        startDate: new Date("2024-01-15"),
        plannedEndDate: new Date("2024-08-30"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["compass", "ui-components", "strategic"],
        slaKpiMetrics: "",
        documentationUrl: "",
      },
      { 
        name: "Snowflake Data Team", 
        codeId: "NEC-002", 
        account: "New Era Cap",
        customer: "New Era Cap", 
        engagementType: "Data Analytics",
        deliveryModel: "Managed",
        billingModel: "T&M",
        projectImportance: "Critical",
        ragStatus: "Amber",
        scopeDescription: "June deliverables completed with crystal reports moved to Production. Focusing on OLAP reports and Sales Analysis reports.",
        projectManagerId: 4,
        deliveryManagerId: 2,
        teamSquad: "Analytics Team",
        tower: "Tower 1",
        fte: "",
        revenue: "",
        startDate: new Date("2024-02-01"),
        plannedEndDate: new Date("2024-07-15"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["snowflake", "olap", "analytics"],
        slaKpiMetrics: "",
        documentationUrl: "",
      },
      { 
        name: "Seymour Whyte Connect", 
        codeId: "SW-003", 
        account: "Seymour Whyte",
        customer: "Seymour Whyte", 
        engagementType: "Integration",
        deliveryModel: "Managed",
        billingModel: "Capacity",
        projectImportance: "Strategic",
        ragStatus: "Red",
        scopeDescription: "Overall project progress 69%. RED due to dependency on source/target API. Equipment Timecard API available end of Aug.",
        projectManagerId: 5,
        deliveryManagerId: 2,
        teamSquad: "Integration Team",
        tower: "Tower 2",
        fte: "",
        revenue: "",
        startDate: new Date("2024-03-01"),
        plannedEndDate: new Date("2024-09-30"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["integration", "api-dependency", "timecard"],
        slaKpiMetrics: "",
        documentationUrl: "",
      },
      { 
        name: "Halo Trading Platform", 
        codeId: "HALO-004", 
        account: "Halo",
        customer: "Halo", 
        engagementType: "Development",
        deliveryModel: "Staff Aug",
        billingModel: "T&M",
        projectImportance: "Medium",
        ragStatus: "Amber",
        scopeDescription: "Automation of Fixed income case testing, calendar management, and auction filtering with whitelabel support.",
        projectManagerId: 1,
        deliveryManagerId: 2,
        teamSquad: "Trading Team",
        tower: "Tower 1",
        fte: "",
        revenue: "",
        startDate: new Date("2024-04-01"),
        plannedEndDate: new Date("2024-10-31"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["trading", "automation", "fixed-income"],
        slaKpiMetrics: "",
        documentationUrl: "",
      },
      { 
        name: "Integrations Stream", 
        codeId: "NEC-005", 
        account: "New Era Cap",
        customer: "New Era Cap", 
        engagementType: "Integration",
        deliveryModel: "Managed",
        billingModel: "T&M",
        projectImportance: "Medium",
        ragStatus: "Green",
        scopeDescription: "Smaregi integration, JP Retail Dashboard, Geodis Mexico, and Supplier Portal enhancements. 22 Zendesk tickets closed.",
        projectManagerId: 4,
        deliveryManagerId: 2,
        teamSquad: "Integration Team",
        tower: "Tower 1",
        fte: "",
        revenue: "",
        startDate: new Date("2024-05-01"),
        plannedEndDate: new Date("2024-11-30"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["integration", "smaregi", "retail"],
        slaKpiMetrics: "",
        documentationUrl: "",
      },
      { 
        name: "eCommerce Platform", 
        codeId: "NEC-006", 
        account: "New Era Cap",
        customer: "New Era Cap", 
        engagementType: "Development",
        deliveryModel: "Managed",
        billingModel: "T&M",
        projectImportance: "Medium",
        ragStatus: "Green",
        scopeDescription: "Submarine items, EMEA Returns, SHOPIFY POS stories, SOFIA and ROAL application support with system stability focus.",
        projectManagerId: 5,
        deliveryManagerId: 2,
        teamSquad: "eCommerce Team",
        tower: "Tower 1",
        fte: "",
        revenue: "",
        startDate: new Date("2024-06-01"),
        plannedEndDate: new Date("2024-12-31"),
        clientEscalation: false,
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ["ecommerce", "shopify", "sofia"],
        slaKpiMetrics: "",
        documentationUrl: "",
      }
    ];

    // Replace first 6 test projects with real ones
    realProjects.forEach((project, index) => {
      testProjects[index] = project;
    });

    testProjects.forEach(project => {
      const id = this.currentId++;
      this.projects.set(id, { 
        ...project, 
        id, 
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Create realistic weekly status reports based on Excel data
    const realWeeklyReports = [
      {
        projectId: 1, // CALX Compass
        reportingDate: new Date("2025-01-20"),
        weekNumber: 28,
        publishStatus: true,
        healthPreviousWeek: "Red",
        healthCurrentWeek: "Red",
        clientEscalation: "None",
        updateForCurrentWeek: "Pending Items - Still awaiting confirmation on the critical showstopper items related to UI component library, CMS and Maps. This has an impact on the overall schedule and scope. Customer Connect - Had customer connect with Saad and Asim. Expecting update by 15th Jul and if there are further delays, have to put entire activities on hold.",
        planForNextWeek: "Discuss with Calx team on the delays and get confirmation on pending items",
        issuesChallenges: "Delay in getting confirmation on the pending items from Calx/Ministry",
        pathToGreen: "Confirmation on the pending items and agree on revised plan",
        resourcingStatus: "None",
        currentSdlcPhase: "Requirement Gathering",
        sqaRemarks: "Revised SOW with revised scope and estimate shared with customer. Customer signing to be obtained.",
        tower: "Tower 2",
        billingModel: "Fixed Bid",
        submittedBy: 1,
      },
      {
        projectId: 2, // Snowflake Data Team
        reportingDate: new Date("2025-01-20"),
        weekNumber: 28,
        publishStatus: true,
        healthPreviousWeek: "Amber",
        healthCurrentWeek: "Amber",
        clientEscalation: "None",
        updateForCurrentWeek: "The June deliverables completed successfully with all those crystal reports moved to Production. The team is currently focusing on OLAP reports and Sales Analysis reports to close within mid July along with Power IB Enhancement Requests. The BW reengineering track solution approach being drafted to present to NEC to review and baseline it.",
        planForNextWeek: "1) Mapping and ETL Development for dimensions and fact tables for OLAP reports. 2) AtScale development for OLAP. 3) Data refresh via BW connector and ODBC connector. 4) BI Team will be handling the CR raised by users for multiple reports if any. 5) OLAP data testing in snowflake layer.",
        issuesChallenges: "",
        pathToGreen: "",
        resourcingStatus: "",
        currentSdlcPhase: "Development",
        sqaRemarks: "BCP and Information Security Risk Register not submitted by the project team",
        tower: "Tower 1",
        billingModel: "T&M",
        submittedBy: 4,
      },
      {
        projectId: 3, // Seymour Whyte Connect
        reportingDate: new Date("2025-01-20"),
        weekNumber: 28,
        publishStatus: true,
        healthPreviousWeek: "Amber",
        healthCurrentWeek: "Red",
        clientEscalation: "None",
        updateForCurrentWeek: "Overall project progress (from Reflections) - 69%. RAG – RED, Due to the dependency on the source/target API. API of Equipment Timecard will be made available only towards end of Aug, impacting the project date. Session for new business flow is planned for 14th July. Test scenario – AWAITING review comments. Test case preparation is in progress. Note – Requirement Plug & Play- Implemented in the current code. Quarterly NPS Score to be received",
        planForNextWeek: "Update the design suggested and complete any work till the APIs are available. Continue build and test case preparation",
        issuesChallenges: "The dependency on the source/target API. SAP APIs are not working which makes most of the modules in BLOCKED status. Additional business logic and design changes are getting suggested at this stage, which may impact the overall project timeline.",
        pathToGreen: "Updated the risk to the customer as the delay is due to the API at their end.",
        resourcingStatus: "No Risk - GREEN",
        currentSdlcPhase: "Development",
        sqaRemarks: "",
        tower: "Tower 2",
        billingModel: "Capacity",
        submittedBy: 5,
      },
      {
        projectId: 5, // Integrations Stream
        reportingDate: new Date("2025-01-20"),
        weekNumber: 28,
        publishStatus: true,
        healthPreviousWeek: "Green",
        healthCurrentWeek: "Green",
        clientEscalation: "None",
        updateForCurrentWeek: "The Smaregi integration work includes ongoing analysis for error logging in the Product Create API, implementation of a retry mechanism for failed requests to the BW web service. For the JP Retail Dashboard, the updated 4-Wall Operating Profit calculation has been successfully deployed to production. In the Geodis Mexico project, incorrect delivery number mappings have been identified for both inbound and outbound payloads, with fixes in progress. In the Supplier Portal –SAP report details for the packing export enhancement have been shared. 22 Zendesk tickets has been closed",
        planForNextWeek: "1) Middleware Migration Project - Continue with the development task. 2) 47 KTN EMEA Wholesale Expansion - dev testing will be in-progress 3) Smaregi Integration and Supplier Portal - Product Create API [Logging and Retry] 4) Geodis Mexico - Return Order and B2C Inventory Comparison Report 5) Production Support - Support activities to be handled.",
        issuesChallenges: "",
        pathToGreen: "",
        resourcingStatus: "Interviews for the roles Sr. Net Developer & .Net Developer are in progress.",
        currentSdlcPhase: "Development",
        sqaRemarks: "BCP and Information Security Risk Register not submitted by the project team",
        tower: "Tower 1",
        billingModel: "T&M",
        submittedBy: 4,
      },
      {
        projectId: 6, // eCommerce Platform
        reportingDate: new Date("2025-01-20"),
        weekNumber: 28,
        publishStatus: true,
        healthPreviousWeek: "Green",
        healthCurrentWeek: "Green",
        clientEscalation: "None",
        updateForCurrentWeek: "The main priority for the team was working on Submarine items, which received much of the focus and effort. EMEA Returns and SHOPIFY POS stories were the other priority items planned this week. The team continued to provide production support for SOFIA, as well as for the ROAL application, maintaining system stability and addressing any critical issues.",
        planForNextWeek: "1) Submarine Bugs 2) SOFIA EU UK US MX PROD Support 3) SHOPIFY POS 4) ROAL Application Support 5) ADA Tasks 6) SOFIA EMEA Returns",
        issuesChallenges: "",
        pathToGreen: "",
        resourcingStatus: "",
        currentSdlcPhase: "Production Support",
        sqaRemarks: "BCP and Information Security Risk Register not submitted by the project team",
        tower: "Tower 1",
        billingModel: "T&M",
        submittedBy: 5,
      },
    ];

    realWeeklyReports.forEach(report => {
      const id = this.currentId++;
      this.weeklyStatusReports.set(id, { ...report, id, createdAt: new Date() });
    });

    // Create additional test reports for other projects
    const ragStatuses = ["Red", "Amber", "Green"];
    const importanceLevels = ["High", "Medium", "Low"];
    const deliveryModels = ["Agile", "Scrum", "Kanban", "Waterfall"];
    
    const updateTemplates = {
      "Red": [
        "Critical blockers identified requiring immediate attention",
        "Integration challenges causing significant delays",
        "Resource constraints impacting delivery timeline",
        "Technical debt requiring architecture review",
        "Client feedback requiring major scope changes"
      ],
      "Amber": [
        "Minor delays in testing phase but core development on track",
        "Waiting for client approval on key design decisions", 
        "Third-party API dependencies causing minor delays",
        "Performance optimization in progress",
        "Scope clarification needed for upcoming sprints"
      ],
      "Green": [
        "All deliverables completed ahead of schedule",
        "Successful deployment to staging environment",
        "Client demo received positive feedback",
        "Team velocity exceeding planned targets", 
        "Quality metrics meeting all acceptance criteria"
      ]
    };
    
    const testReports = [];
    
    // Create reports for first 75 projects (represent active projects with reports)
    for (let i = 1; i <= 75; i++) {
      const ragStatus = ragStatuses[i % 3]; // Distribute status evenly
      const importance = importanceLevels[i % 3];
      const deliveryModel = deliveryModels[i % 4];
      const hasEscalation = ragStatus === "Red" && i % 5 === 0; // 20% of Red projects have escalations
      const pmId = i % 3 === 0 ? 1 : i % 3 === 1 ? 4 : 5;
      const updates = updateTemplates[ragStatus as keyof typeof updateTemplates];
      const updateText = updates[i % updates.length];
      
      testReports.push({
        projectId: i,
        reportingDate: new Date('2025-01-20'),
        projectImportance: importance,
        deliveryModel,
        clientEscalation: hasEscalation,
        clientEscalationDetails: hasEscalation ? "Client concerns require executive attention" : null,
        ragStatus,
        keyWeeklyUpdates: updateText,
        weeklyUpdateColumn: updateText.substring(0, 50) + "...",
        aiStatus: ragStatus, // AI status matches RAG for simplicity
        aiAssessmentDescription: `AI Analysis: ${updateText} Project ${i} requires ${ragStatus === "Red" ? "immediate" : ragStatus === "Amber" ? "moderate" : "minimal"} attention.`,
        submittedBy: pmId
      });
    }
    
    // Ensure we have the key initial reports
    testReports[0] = {
      projectId: 1,
      reportingDate: new Date('2025-01-20'),
      projectImportance: "High",
      deliveryModel: "Agile",
      clientEscalation: true,
      clientEscalationDetails: "Legacy system integration challenges causing timeline concerns",
      ragStatus: "Red",
      keyWeeklyUpdates: "Legacy API compatibility issues discovered. Working with architecture team on resolution approach.",
      weeklyUpdateColumn: "Urgent: Legacy system integration challenges impacting timeline",
      aiStatus: "Red",
      aiAssessmentDescription: "Technical challenges with legacy system integration causing 3-week delay. Database migration risks identified requiring immediate architect review.",
      submittedBy: 1
    };

    testReports.forEach(report => {
      const id = this.currentId++;
      this.weeklyStatusReports.set(id, { ...report, id, createdAt: new Date() });
    });

    // Create test LLM configuration
    const testLlmConfig = {
      providerName: "Google",
      modelName: "gemini-2.0-flash",
      apiKey: process.env.GOOGLE_API_KEY || "test-api-key",
      isActive: true,
      lastUpdatedBy: 3
    };

    const llmId = this.currentId++;
    this.llmConfigurations.set(llmId, { ...testLlmConfig, id: llmId, lastUpdatedDate: new Date() });

    // Create test portfolio analysis reflecting 100 projects
    const testPortfolioAnalysis = {
      overallPortfolioRagStatus: "Amber",
      reason: "Portfolio analysis of 100 active projects shows mixed performance indicators. 25 projects (25%) are Red status requiring immediate attention, 25 projects (25%) are Amber with moderate concerns, and 25 projects (25%) are Green performing well. Remaining 25 projects lack recent status reports. Key risk areas include legacy system integrations, resource allocation across concurrent projects, and third-party dependency management. Recommend focused attention on Red status projects and escalation management.",
      projectsAnalyzed: {
        summary: {
          total_projects_analyzed: 100,
          red_projects: 25,
          amber_projects: 25, 
          green_projects: 25,
          no_recent_reports: 25
        },
        sample_critical_projects: [
          {
            project_name: "Customer Portal Migration",
            ai_status: "Red",
            ai_assessment_description: "Critical legacy system integration challenges causing 3-week delay",
            escalation_required: true
          },
          {
            project_name: "Portal v1.0", 
            ai_status: "Red",
            ai_assessment_description: "Critical blockers identified requiring immediate attention",
            escalation_required: false
          },
          {
            project_name: "Analytics Platform v2.0",
            ai_status: "Red", 
            ai_assessment_description: "Integration challenges causing significant delays",
            escalation_required: true
          }
        ]
      },
      columnsUsedForAnalysis: ["RAG Status", "Weekly Updates", "Client Escalation", "Project Importance", "Delivery Model"],
      llmConfigurationId: llmId
    };

    const analysisId = this.currentId++;
    this.portfolioAnalyses.set(analysisId, { ...testPortfolioAnalysis, id: analysisId, analysisDate: new Date() });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.isActive);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByManager(managerId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.projectManagerId === managerId && p.isActive);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      projectManagerId: insertProject.projectManagerId ?? null,
      isActive: insertProject.isActive ?? true
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...projectUpdate };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    const existing = this.projects.get(id);
    if (!existing) return false;
    
    const updated = { ...existing, isActive: false };
    this.projects.set(id, updated);
    return true;
  }

  // Weekly Status Report methods
  async getWeeklyStatusReports(projectId?: number): Promise<WeeklyStatusReport[]> {
    const reports = Array.from(this.weeklyStatusReports.values());
    return projectId ? reports.filter(r => r.projectId === projectId) : reports;
  }

  async getWeeklyStatusReport(id: number): Promise<WeeklyStatusReport | undefined> {
    return this.weeklyStatusReports.get(id);
  }

  async createWeeklyStatusReport(insertReport: InsertWeeklyStatusReport): Promise<WeeklyStatusReport> {
    const id = this.currentId++;
    const report: WeeklyStatusReport = { 
      ...insertReport, 
      id, 
      createdAt: new Date(),
      aiStatus: null,
      aiAssessmentDescription: null,
      clientEscalation: insertReport.clientEscalation ?? null,
      clientEscalationDetails: insertReport.clientEscalationDetails ?? null,
      weeklyUpdateColumn: insertReport.weeklyUpdateColumn ?? null,
      submittedBy: insertReport.submittedBy ?? null,
    };
    this.weeklyStatusReports.set(id, report);
    return report;
  }

  async updateWeeklyStatusReport(id: number, reportUpdate: Partial<WeeklyStatusReport>): Promise<WeeklyStatusReport | undefined> {
    const existing = this.weeklyStatusReports.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...reportUpdate };
    this.weeklyStatusReports.set(id, updated);
    return updated;
  }

  // Technical Review methods
  async getTechnicalReviews(projectId?: number): Promise<TechnicalReview[]> {
    const reviews = Array.from(this.technicalReviews.values());
    return projectId ? reviews.filter(r => r.projectId === projectId) : reviews;
  }

  async getTechnicalReview(id: number): Promise<TechnicalReview | undefined> {
    return this.technicalReviews.get(id);
  }

  async createTechnicalReview(insertReview: InsertTechnicalReview): Promise<TechnicalReview> {
    const id = this.currentId++;
    const review: TechnicalReview = { 
      ...insertReview, 
      id, 
      createdAt: new Date(),
      executiveSummary: insertReview.executiveSummary ?? null,
      architectureDesignReview: insertReview.architectureDesignReview ?? null,
      codeQualityStandards: insertReview.codeQualityStandards ?? null,
      devopsDeploymentReadiness: insertReview.devopsDeploymentReadiness ?? null,
      testingQa: insertReview.testingQa ?? null,
      riskIdentification: insertReview.riskIdentification ?? null,
      actionItemsRecommendations: insertReview.actionItemsRecommendations ?? null,
      complianceStandards: insertReview.complianceStandards ?? null,
      reviewerSignOff: insertReview.reviewerSignOff ?? null,
      sqaValidation: insertReview.sqaValidation ?? null,
      participants: insertReview.participants ?? null,
      conductedBy: insertReview.conductedBy ?? null,
    };
    this.technicalReviews.set(id, review);
    return review;
  }

  async updateTechnicalReview(id: number, reviewUpdate: Partial<TechnicalReview>): Promise<TechnicalReview | undefined> {
    const existing = this.technicalReviews.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...reviewUpdate };
    this.technicalReviews.set(id, updated);
    return updated;
  }

  // LLM Configuration methods
  async getLlmConfigurations(): Promise<LlmConfiguration[]> {
    return Array.from(this.llmConfigurations.values());
  }

  async getActiveLlmConfiguration(): Promise<LlmConfiguration | undefined> {
    return Array.from(this.llmConfigurations.values()).find(config => config.isActive);
  }

  async createLlmConfiguration(insertConfig: InsertLlmConfiguration): Promise<LlmConfiguration> {
    const id = this.currentId++;
    const config: LlmConfiguration = { 
      ...insertConfig, 
      id, 
      lastUpdatedDate: new Date(),
      isActive: insertConfig.isActive ?? true,
      lastUpdatedBy: insertConfig.lastUpdatedBy ?? null,
    };
    this.llmConfigurations.set(id, config);
    return config;
  }

  async updateLlmConfiguration(id: number, configUpdate: Partial<LlmConfiguration>): Promise<LlmConfiguration | undefined> {
    const existing = this.llmConfigurations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...configUpdate, lastUpdatedDate: new Date() };
    this.llmConfigurations.set(id, updated);
    return updated;
  }

  // Portfolio Analysis methods
  async getLatestPortfolioAnalysis(): Promise<PortfolioAnalysis | undefined> {
    const analyses = Array.from(this.portfolioAnalyses.values());
    return analyses.sort((a, b) => b.analysisDate!.getTime() - a.analysisDate!.getTime())[0];
  }

  async createPortfolioAnalysis(insertAnalysis: InsertPortfolioAnalysis): Promise<PortfolioAnalysis> {
    const id = this.currentId++;
    const analysis: PortfolioAnalysis = { 
      ...insertAnalysis, 
      id, 
      analysisDate: new Date(),
      projectsAnalyzed: insertAnalysis.projectsAnalyzed ?? null,
      columnsUsedForAnalysis: insertAnalysis.columnsUsedForAnalysis ?? null,
      llmConfigurationId: insertAnalysis.llmConfigurationId ?? null,
    };
    this.portfolioAnalyses.set(id, analysis);
    return analysis;
  }

  async getPortfolioAnalysisHistory(limit = 10): Promise<PortfolioAnalysis[]> {
    const analyses = Array.from(this.portfolioAnalyses.values());
    return analyses
      .sort((a, b) => b.analysisDate!.getTime() - a.analysisDate!.getTime())
      .slice(0, limit);
  }

  // Excel Integration methods
  async createOrUpdateWeeklyReportFromExcel(reportData: any, summary: any): Promise<WeeklyStatusReport> {
    // Find existing project by name or create new one
    let project = Array.from(this.projects.values()).find(p => 
      p.name.toLowerCase() === reportData.projectName.toLowerCase()
    );
    
    if (!project) {
      // Create new project based on Excel data
      const newProject = await this.createProject({
        name: reportData.projectName,
        codeId: `EXL-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        account: reportData.projectName.split(' ')[0] || 'Unknown',
        customer: reportData.projectName.split(' ')[0] || 'Unknown',
        engagementType: 'Development',
        deliveryModel: 'Agile',
        billingModel: reportData.billingModel || 'T&M',
        projectImportance: 'Medium',
        ragStatus: reportData.healthCurrentWeek,
        scopeDescription: `Project imported from Excel: ${reportData.projectName}`,
        projectManagerId: 1, // Default to admin user
        deliveryManagerId: 3,
        teamSquad: reportData.tower || 'Alpha Squad',
        tower: reportData.tower,
        fte: reportData.fte,
        revenue: reportData.revenue,
        startDate: new Date(),
        plannedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        clientEscalation: reportData.clientEscalation !== 'None',
        isActive: true,
        aiMonitoringEnabled: true,
        projectTags: ['excel-import'],
        slaKpiMetrics: '99.5% uptime',
        documentationUrl: ''
      });
      project = newProject;
    }

    // Check if report for this week already exists
    const existingReports = await this.getWeeklyStatusReports(project.id);
    const existingReport = existingReports.find(r => 
      r.weekNumber === reportData.weekNumber && 
      r.reportingDate.toDateString() === new Date().toDateString()
    );

    const reportPayload = {
      projectId: project.id,
      reportingDate: new Date(),
      weekNumber: reportData.weekNumber,
      publishStatus: true,
      healthPreviousWeek: reportData.healthPreviousWeek,
      healthCurrentWeek: reportData.healthCurrentWeek,
      clientEscalation: reportData.clientEscalation,
      updateForCurrentWeek: reportData.updateForCurrentWeek,
      planForNextWeek: reportData.planForNextWeek,
      issuesChallenges: reportData.issuesChallenges,
      pathToGreen: reportData.pathToGreen,
      resourcingStatus: reportData.resourcingStatus,
      currentSdlcPhase: 'Development',
      sqaRemarks: '',
      fte: reportData.fte,
      revenue: reportData.revenue,
      tower: reportData.tower,
      billingModel: reportData.billingModel,
      aiStatus: summary.overallHealth,
      aiAssessmentDescription: summary.summary,
      submittedBy: 1
    };

    if (existingReport) {
      // Update existing report
      return await this.updateWeeklyStatusReport(existingReport.id, reportPayload) || existingReport;
    } else {
      // Create new report
      return await this.createWeeklyStatusReport(reportPayload);
    }
  }

  async getAIAnalyzedReports(): Promise<WeeklyStatusReport[]> {
    return Array.from(this.weeklyStatusReports.values())
      .filter(report => report.aiStatus && report.aiAssessmentDescription)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
}

export const storage = new MemStorage();

// Export Excel reports data for API access
export const excelReportsData: any[] = [];

// Function to update Excel reports data
export function setExcelReportsData(data: any[]) {
  excelReportsData.length = 0;
  excelReportsData.push(...data);
}
