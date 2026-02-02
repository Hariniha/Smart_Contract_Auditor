'use client';

import { useState } from 'react';
import { Vulnerability } from '@/types';
import { ChevronDown, ChevronUp, ExternalLink, Code, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VulnerabilitiesListProps {
  vulnerabilities: Vulnerability[];
}

export default function VulnerabilitiesList({ vulnerabilities }: VulnerabilitiesListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredVulns = severityFilter === 'all'
    ? vulnerabilities
    : vulnerabilities.filter(v => v.severity.toLowerCase() === severityFilter);

  const severityOrder = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Info': 5 };
  const sortedVulns = [...filteredVulns].sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );

  if (vulnerabilities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4 border-2 border-green-200">
          <AlertTriangle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">No Vulnerabilities Detected</h3>
        <p className="text-gray-600">Your smart contract passed all security checks!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 font-medium">Filter by severity:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSeverityFilter(filter)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              severityFilter === filter
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {sortedVulns.map((vuln) => (
          <div
            key={vuln.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: getSeverityColor(vuln.severity)
            }}
          >
            <div
              className="cursor-pointer"
              onClick={() => setExpandedId(expandedId === vuln.id ? null : vuln.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={cn('badge', `severity-${vuln.severity.toLowerCase()}`)}>
                      {vuln.severity}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{vuln.swcId}</span>
                    <span className="text-xs text-gray-500 font-medium">Line {vuln.lineNumber}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">{vuln.name}</h3>
                  <p className="text-sm text-gray-600">{vuln.description}</p>
                </div>
                <button className="ml-4 text-gray-400 hover:text-gray-900">
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
                    <h4 className="text-sm font-semibold mb-2 text-green-400">
                      Recommended Fix
                    </h4>
                    <p className="text-sm text-gray-400 bg-green-900/10 p-3 rounded-lg border border-green-900/30">
                      {vuln.recommendation}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Detection Method:</span>{' '}
                      <span className="text-gray-900 font-medium">{vuln.detectionMethod}</span>
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
        ))}
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
