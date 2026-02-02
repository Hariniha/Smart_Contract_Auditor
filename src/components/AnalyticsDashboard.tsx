'use client';

import { AnalysisResult } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Shield, AlertTriangle } from 'lucide-react';

interface AnalyticsDashboardProps {
  result: AnalysisResult;
}

export default function AnalyticsDashboard({ result }: AnalyticsDashboardProps) {
  // Vulnerability type distribution
  const vulnTypeData = result.vulnerabilities.reduce((acc, vuln) => {
    const existing = acc.find(item => item.name === vuln.swcId);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: vuln.swcId, count: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; count: number }>);

  const sortedVulnTypes = vulnTypeData.sort((a, b) => b.count - a.count).slice(0, 10);

  // Severity distribution for bar chart
  const severityBarData = [
    { severity: 'Critical', count: result.statistics.critical, color: '#DC2626' },
    { severity: 'High', count: result.statistics.high, color: '#F59E0B' },
    { severity: 'Medium', count: result.statistics.medium, color: '#EAB308' },
    { severity: 'Low', count: result.statistics.low, color: '#3B82F6' },
    { severity: 'Info', count: result.statistics.info, color: '#6B7280' }
  ];

  // Detection method distribution
  const detectionMethodData = result.vulnerabilities.reduce((acc, vuln) => {
    const existing = acc.find(item => item.name === vuln.detectionMethod);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: vuln.detectionMethod, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const methodColors: Record<string, string> = {
    static: '#3B82F6',
    dynamic: '#8B5CF6',
    ai: '#10B981'
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Analysis Time</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{(result.analysisTime / 1000).toFixed(2)}s</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Unique Patterns</span>
            <Target className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{vulnTypeData.length}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Security Score</span>
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{result.securityScore}/100</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Risk Level</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{result.riskLevel}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Severity Distribution Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="severity" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3B82F6">
                {severityBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Method Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Detection Methods</h3>
          {detectionMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={detectionMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {detectionMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={methodColors[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Top Vulnerability Types */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Top Vulnerability Patterns</h3>
        {sortedVulnTypes.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedVulnTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="py-12 text-center text-gray-400">
            No vulnerabilities to analyze
          </div>
        )}
      </div>

      {/* Risk Assessment Matrix */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Risk Assessment Matrix</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-600">Vulnerability Impact</h4>
            <div className="space-y-3">
              {[
                { label: 'Fund Loss Risk', value: result.statistics.critical > 0 ? 'High' : 'Low', color: result.statistics.critical > 0 ? 'text-red-600' : 'text-green-600' },
                { label: 'Access Control', value: result.vulnerabilities.some(v => v.type.includes('Access') || v.type.includes('Authorization')) ? 'Issues Found' : 'Secure', color: result.vulnerabilities.some(v => v.type.includes('Access')) ? 'text-orange-600' : 'text-green-600' },
                { label: 'Reentrancy Risk', value: result.vulnerabilities.some(v => v.swcId === 'SWC-107') ? 'Critical' : 'None', color: result.vulnerabilities.some(v => v.swcId === 'SWC-107') ? 'text-red-600' : 'text-green-600' },
                { label: 'Integer Safety', value: result.vulnerabilities.some(v => v.swcId === 'SWC-101') ? 'At Risk' : 'Protected', color: result.vulnerabilities.some(v => v.swcId === 'SWC-101') ? 'text-orange-600' : 'text-green-600' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-600">Standards Compliance</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">SCSVS v2</span>
                  <span className="text-sm font-semibold text-blue-600">{result.scsvCompliance.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${result.scsvCompliance.percentage}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">EthTrust Level</span>
                  <span className="text-sm font-semibold text-purple-600">Level {result.ethTrustLevel}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-purple-500 rounded-full"
                    style={{ width: `${(result.ethTrustLevel / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Security Score</span>
                  <span className="text-sm font-semibold text-green-600">{result.securityScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${result.securityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Analysis Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">Total Issues</div>
            <div className="text-2xl font-bold text-gray-900">{result.statistics.total}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Unique Patterns</div>
            <div className="text-2xl font-bold text-gray-900">{vulnTypeData.length}</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Analysis Duration</div>
            <div className="text-2xl font-bold text-gray-900">{(result.analysisTime / 1000).toFixed(2)}s</div>
          </div>
        </div>
      </div>
    </div>
  );
}
