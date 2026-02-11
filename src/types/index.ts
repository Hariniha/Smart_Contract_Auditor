// Core Types for Smart Contract Auditor

export interface Vulnerability {
  id: string;
  name: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  swcId: string;
  cweIds: string[];
  scsvIds: string[];
  ethTrustImpact: number;
  lineNumber: number;
  lineRange?: { start: number; end: number };
  codeSnippet: string;
  description: string;
  exploitationScenario: string;
  recommendation: string;
  references: string[];
  detectionMethod: 'static' | 'dynamic' | 'ai';
  confidence: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  analysisId: string;
  timestamp: string;
  contractCode: string;
  fileName: string;
  securityScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Secure';
  vulnerabilities: Vulnerability[];
  statistics: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  scsvCompliance: {
    passed: number;
    failed: number;
    percentage: number;
    checklist: SCSVSCheckResult[];
  };
  ethTrustLevel: number;
  recommendations: string[];
  analysisTime: number; // in milliseconds
}

export interface SCSVSCheckResult {
  controlId: string;
  category: string;
  title: string;
  passed: boolean;
  findings: string[];
  severity: string;
}

export interface AnalysisRequest {
  contractCode: string;
  fileName: string;
  analysisTypes: ('static' | 'dynamic' | 'standards')[];
  severity?: 'all' | 'critical' | 'high' | 'medium' | 'low';
}

export interface AnalysisProgress {
  stage: 'parsing' | 'static' | 'dynamic' | 'ai' | 'standards' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TrendData {
  date: string;
  vulnerabilities: number;
  securityScore: number;
}

export interface VulnerabilityPattern {
  pattern: RegExp | string;
  swcId: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  scsvIds?: string[]; // SCSVS control IDs mapped to this vulnerability
  check: (code: string, ast?: any) => boolean;
}

export const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#DC2626',
  High: '#F59E0B',
  Medium: '#EAB308',
  Low: '#3B82F6',
  Info: '#6B7280'
};

export const SEVERITY_WEIGHTS: Record<string, number> = {
  Critical: 20,
  High: 10,
  Medium: 5,
  Low: 2,
  Info: 0
};
