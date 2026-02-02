'use client';

import { AnalysisResult } from '@/types';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getEthTrustLevelDefinition } from '@/lib/ethtrust';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OverviewDashboardProps {
  result: AnalysisResult;
}

export default function OverviewDashboard({ result }: OverviewDashboardProps) {
  const ethTrustDef = getEthTrustLevelDefinition(result.ethTrustLevel);

  const severityData = [
    { name: 'Critical', value: result.statistics.critical, color: '#DC2626' },
    { name: 'High', value: result.statistics.high, color: '#F59E0B' },
    { name: 'Medium', value: result.statistics.medium, color: '#EAB308' },
    { name: 'Low', value: result.statistics.low, color: '#3B82F6' },
    { name: 'Info', value: result.statistics.info, color: '#6B7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Security Score</span>
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{result.securityScore}</div>
          <div className="text-xs text-gray-500 mt-1">out of 100</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Risk Level</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold" style={{ 
            color: ethTrustDef.color 
          }}>
            {result.riskLevel}
          </div>
          <div className="text-xs text-gray-500 mt-1">{ethTrustDef.risk}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Vulnerabilities</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{result.statistics.total}</div>
          <div className="text-xs text-gray-500 mt-1">issues detected</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">SCSVS Compliance</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{result.scsvCompliance.percentage}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {result.scsvCompliance.passed}/{result.scsvCompliance.passed + result.scsvCompliance.failed} checks
          </div>
        </div>
      </div>

      {/* EthTrust Level */}
      <div className="bg-white border-2 rounded-xl p-6 shadow-md" style={{ borderColor: ethTrustDef.color + '40' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              EthTrust Security Level: {ethTrustDef.level}
            </h3>
            <p className="text-lg mb-4" style={{ color: ethTrustDef.color }}>
              {ethTrustDef.name}
            </p>
            <p className="text-gray-600 mb-4">{ethTrustDef.description}</p>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{ethTrustDef.recommendation}</p>
            </div>
          </div>
          <div className="text-6xl font-bold" style={{ color: ethTrustDef.color }}>
            {ethTrustDef.level}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Criteria:</h4>
          <ul className="space-y-2">
            {ethTrustDef.criteria.map((criterion, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0" />
                {criterion}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Severity Distribution</h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No vulnerabilities detected
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Vulnerability Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: result.statistics.critical, color: 'bg-red-600' },
              { label: 'High', count: result.statistics.high, color: 'bg-orange-600' },
              { label: 'Medium', count: result.statistics.medium, color: 'bg-yellow-600' },
              { label: 'Low', count: result.statistics.low, color: 'bg-blue-600' },
              { label: 'Info', count: result.statistics.info, color: 'bg-gray-600' }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{
                      width: result.statistics.total > 0 
                        ? `${(item.count / result.statistics.total) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Recommendations
        </h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
