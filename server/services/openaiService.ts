import axios from 'axios';
import type { ExcelReportData } from './excelParser';

export interface ProjectSummary {
  projectName: string;
  overallHealth: 'Red' | 'Amber' | 'Green';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyInsights: string[];
  recommendations: string[];
  summary: string;
  criticalIssues: string[];
  successFactors: string[];
}

export class OpenAIService {
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly API_KEY = process.env.OPENAI_API_KEY;
  
  static async generateProjectSummary(reportData: ExcelReportData): Promise<ProjectSummary> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const prompt = this.buildAnalysisPrompt(reportData);
    
    try {
      const response = await axios.post(
        this.API_URL,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert project management analyst specializing in risk assessment and project health evaluation. Analyze weekly status reports and provide structured insights in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const aiResponse = response.data.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from OpenAI API');
      }
      
      // Parse the JSON response
      return this.parseAIResponse(aiResponse, reportData.projectName);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback response in case of API failure
      return this.generateFallbackSummary(reportData);
    }
  }
  
  private static buildAnalysisPrompt(data: ExcelReportData): string {
    return `
Analyze this weekly project status report and provide insights in valid JSON format:

Project: ${data.projectName}
Week: ${data.weekNumber}
Health Trend: ${data.healthPreviousWeek} → ${data.healthCurrentWeek}
Current Week Update: ${data.updateForCurrentWeek}
Next Week Plan: ${data.planForNextWeek}
Issues/Challenges: ${data.issuesChallenges}
Path to Green: ${data.pathToGreen}
Resourcing: ${data.resourcingStatus}
Client Escalation: ${data.clientEscalation}
Tower: ${data.tower}
Billing Model: ${data.billingModel}
FTE: ${data.fte}
Revenue: ${data.revenue}

Please respond with a valid JSON object containing:
{
  "overallHealth": "Red" | "Amber" | "Green",
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "keyInsights": [3-5 bullet points],
  "recommendations": [3-5 actionable recommendations],
  "summary": "2-3 sentence executive summary",
  "criticalIssues": [list of critical issues, if any],
  "successFactors": [list of positive aspects, if any]
}

Consider:
- Health status trend (improving/declining)
- Critical issues and blockers
- Resource adequacy
- Client satisfaction
- Revenue/budget impact
- Timeline risks
- Quality concerns
`;
  }
  
  private static parseAIResponse(aiResponse: string, projectName: string): ProjectSummary {
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        projectName,
        overallHealth: parsed.overallHealth || 'Amber',
        riskLevel: parsed.riskLevel || 'Medium',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        summary: parsed.summary || 'Analysis completed',
        criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
        successFactors: Array.isArray(parsed.successFactors) ? parsed.successFactors : []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI analysis response');
    }
  }
  
  private static generateFallbackSummary(data: ExcelReportData): ProjectSummary {
    return {
      projectName: data.projectName,
      overallHealth: data.healthCurrentWeek as 'Red' | 'Amber' | 'Green',
      riskLevel: data.healthCurrentWeek === 'Red' ? 'High' : data.healthCurrentWeek === 'Amber' ? 'Medium' : 'Low',
      keyInsights: [
        `Project health: ${data.healthCurrentWeek}`,
        `Resource status: ${data.resourcingStatus || 'Not specified'}`,
        `Client escalation: ${data.clientEscalation}`
      ],
      recommendations: [
        'Review current status and adjust plans accordingly',
        'Monitor key risk factors closely',
        'Ensure adequate resource allocation'
      ],
      summary: `${data.projectName} is currently ${data.healthCurrentWeek} status with focus needed on addressing current challenges.`,
      criticalIssues: data.issuesChallenges ? [data.issuesChallenges] : [],
      successFactors: []
    };
  }
  
  static async generatePortfolioSummary(projectSummaries: ProjectSummary[]): Promise<{
    overallHealth: string;
    totalProjects: number;
    riskDistribution: Record<string, number>;
    keyRecommendations: string[];
    criticalAlerts: string[];
  }> {
    const totalProjects = projectSummaries.length;
    const riskDistribution = projectSummaries.reduce((acc, project) => {
      acc[project.riskLevel] = (acc[project.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const redProjects = projectSummaries.filter(p => p.overallHealth === 'Red').length;
    const amberProjects = projectSummaries.filter(p => p.overallHealth === 'Amber').length;
    
    const overallHealth = redProjects > 0 ? 'Red' : amberProjects > totalProjects / 2 ? 'Amber' : 'Green';
    
    const criticalAlerts = projectSummaries
      .filter(p => p.overallHealth === 'Red' || p.riskLevel === 'Critical')
      .map(p => `${p.projectName}: ${p.summary}`);
    
    const keyRecommendations = [
      ...new Set(
        projectSummaries
          .flatMap(p => p.recommendations)
          .slice(0, 5)
      )
    ];
    
    return {
      overallHealth,
      totalProjects,
      riskDistribution,
      keyRecommendations,
      criticalAlerts
    };
  }
}