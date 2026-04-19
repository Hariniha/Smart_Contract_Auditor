'use client';

import { useState } from 'react';
import { Vulnerability } from '@/types';
import { ChevronDown, ChevronUp, ExternalLink, Code, AlertTriangle, Zap, BarChart3, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VulnerabilitiesListProps {
  vulnerabilities: Vulnerability[];
  language?: string;
}

export default function VulnerabilitiesList({ vulnerabilities, language }: VulnerabilitiesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredVulns = severityFilter === 'all'
    ? vulnerabilities
    : vulnerabilities.filter(v => v.severity.toLowerCase() === severityFilter);

  const severityOrder = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Info': 5 };
  
  // Helper to get the appropriate registry ID based on language
  const getRegistryId = (vuln: Vulnerability): string => {
    const lang = language?.toLowerCase() || 'solidity';
    if (lang === 'cairo') {
      return vuln.type?.startsWith('CSR-') ? vuln.type : 'CSR-N/A';
    } else if (lang === 'vyper') {
      return vuln.type?.startsWith('VSR-') ? vuln.type : 'VSR-N/A';
    } else {
      return vuln.swcId || 'SWC-N/A';
    }
  };
  
  // Get detection method badge
  const getDetectionBadge = (method: string) => {
    switch(method) {
      case 'ai':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'AI-Detected', icon: Bot };
      case 'hybrid':
        return { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Static + AI', icon: Zap };
      case 'dynamic':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Dynamic', icon: BarChart3 };
      case 'static':
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Static', icon: BarChart3 };
    }
  };

  const sortedVulns = [...filteredVulns].sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );

  // Count AI findings
  const aiDetectedCount = vulnerabilities.filter(v => v.detectionMethod === 'ai').length;
  const aiHybridCount = vulnerabilities.filter(v => v.detectionMethod === 'hybrid').length;
  const totalAIFindings = aiDetectedCount + aiHybridCount;

  if (vulnerabilities.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <div className="inline-flex items-center justify-center w-12 md:w-16 h-12 md:h-16 bg-green-50 rounded-full mb-3 md:mb-4 border-2 border-green-200">
          <AlertTriangle className="w-6 md:w-8 h-6 md:h-8 text-green-500" />
        </div>
        <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900">No Vulnerabilities Detected</h3>
        <p className="text-sm md:text-base text-gray-600">Your smart contract passed all security checks!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* AI Analysis Summary */}
      {totalAIFindings > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Zap className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-purple-900 text-sm md:text-base">AI Analysis Report</h3>
                <p className="text-xs md:text-sm text-purple-700">
                  {aiDetectedCount > 0 && `${aiDetectedCount} vulnerabilities discovered by AI`}
                  {aiDetectedCount > 0 && aiHybridCount > 0 && ' + '}
                  {aiHybridCount > 0 && `${aiHybridCount} findings enhanced with AI insights`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Filter by severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSeverityFilter(filter)}
              className={cn(
                'px-2 md:px-3 py-1 rounded-full text-xs font-medium transition-colors',
                severityFilter === filter
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-xs md:text-sm text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredVulns.length}</span> of <span className="font-bold text-gray-900">{vulnerabilities.length}</span>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-3 md:space-y-4">
        {sortedVulns.map((vuln) => {
          const detectionBadge = getDetectionBadge(vuln.detectionMethod);
          const BadgeIcon = detectionBadge.icon;
          const isAIFinding = vuln.detectionMethod === 'ai' || vuln.detectionMethod === 'hybrid';
          
          return (
            <div
              key={vuln.id}
              className={cn(
                'bg-white border-2 rounded-lg p-3 md:p-4 hover:shadow-md transition-all duration-200 cursor-pointer',
                isAIFinding 
                  ? 'border-purple-300 bg-gradient-to-r from-white to-purple-50' 
                  : 'border-gray-200 hover:border-emerald-500'
              )}
              style={{
                borderLeftWidth: isAIFinding ? '6px' : '4px',
                borderLeftColor: isAIFinding ? '#a855f7' : getSeverityColor(vuln.severity)
              }}
            >
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === vuln.id ? null : vuln.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 md:space-x-2 mb-2 flex-wrap gap-1 md:gap-2">
                      <span className={cn('badge text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1', `severity-${vuln.severity.toLowerCase()}`)}>
                        {vuln.severity}
                      </span>
                      
                      {/* Detection Method Badge */}
                      <span className={cn('text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1', detectionBadge.bg, detectionBadge.text)}>
                        {isAIFinding && <Zap className="w-3 h-3" />}
                        {detectionBadge.label}
                      </span>
                      
                      <span className="text-xs text-gray-500 font-medium">{getRegistryId(vuln)}</span>
                      <span className="text-xs text-gray-500 font-medium">Line {vuln.lineNumber}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-900">{vuln.name}</h3>
                    <p className="text-sm text-gray-600">{vuln.description}</p>
                  </div>
                  <button className="ml-4 text-gray-400 hover:text-gray-900 flex-shrink-0">
                    {expandedId === vuln.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {expandedId === vuln.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-slide-up">
                    {/* Code Snippet */}
                    <div>
                      <div className="flex items-center mb-2">
                        <Code className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-900">Code Snippet (Line {vuln.lineNumber})</span>
                      </div>
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 overflow-x-auto">
                        <code className="text-sm text-gray-100 font-mono">
                          {vuln.codeSnippet}
                        </code>
                      </div>
                    </div>

                    {/* Exploitation Scenario */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-red-600">
                        Exploitation Scenario
                      </h4>
                      <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                        {vuln.exploitationScenario}
                      </p>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-green-600">
                        Recommended Fix
                      </h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        {vuln.recommendation}
                      </p>
                    </div>

                    {/* AI Analysis Note */}
                    {isAIFinding && (
                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                        <p className="text-sm text-purple-700 flex items-center gap-2">
                          <Bot className="w-4 h-4 flex-shrink-0" />
                          <span><strong>AI Analysis:</strong> This vulnerability was identified and analyzed using advanced AI pattern recognition.</span>
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Detection Method:</span>{' '}
                        <span className={cn('font-medium', detectionBadge.text)}>
                          {detectionBadge.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>{' '}
                        <span className="text-gray-900 font-medium">{vuln.confidence}</span>
                      </div>
                      {vuln.cweIds.length > 0 && (
                        <div>
                          <span className="text-gray-600">CWE IDs:</span>{' '}
                          <span className="text-gray-900 font-medium">{vuln.cweIds.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* References */}
                    {vuln.references.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-900">References</h4>
                        <div className="space-y-1">
                          {vuln.references.map((ref, index) => (
                            <a
                              key={index}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {ref}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    'Critical': '#DC2626',
    'High': '#F59E0B',
    'Medium': '#EAB308',
    'Low': '#3B82F6',
    'Info': '#6B7280'
  };
  return colors[severity] || colors.Info;
}
