'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { CheckCircle, XCircle, Shield, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getEthTrustLevelDefinition } from '@/lib/ethtrust';
import { getSWCById } from '@/lib/swc-registry';

interface SecurityStandardsProps {
  result: AnalysisResult;
}

export default function SecurityStandards({ result }: SecurityStandardsProps) {
  const [showSCSVSDetails, setShowSCSVSDetails] = useState(false);
  const ethTrustDef = getEthTrustLevelDefinition(result.ethTrustLevel);
  
  const groupedControls = result.scsvCompliance.checklist.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, typeof result.scsvCompliance.checklist>);

  return (
    <div className="space-y-6">
      {/* SCSVS v2 Compliance Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">SCSVS v2 Compliance</h3>
            <p className="text-gray-600">Smart Contract Security Verification Standard</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-1">
              {result.scsvCompliance.percentage}%
            </div>
            <div className="text-sm text-gray-600">Compliance</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">Passed</span>
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {result.scsvCompliance.passed}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-700 font-medium">Failed</span>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700 mt-2">
              {result.scsvCompliance.failed}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Total</span>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-2">
              {result.scsvCompliance.passed + result.scsvCompliance.failed}
            </div>
          </div>
        </div>

        {/* Compliance Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
            style={{ width: `${result.scsvCompliance.percentage}%` }}
          />
        </div>
      </div>

      {/* EthTrust Security Level */}
      <div className="card" style={{ borderColor: ethTrustDef.color + '40' }}>
        <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
          <Shield className="w-6 h-6 mr-2" style={{ color: ethTrustDef.color }} />
          EthTrust Security Level
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold mb-2" style={{ color: ethTrustDef.color }}>
              Level {ethTrustDef.level} - {ethTrustDef.name}
            </div>
            <p className="text-gray-600 mb-4">{ethTrustDef.description}</p>
            <div className="inline-block px-4 py-2 rounded-full" style={{
              backgroundColor: ethTrustDef.color + '20',
              color: ethTrustDef.color,
              border: `1px solid ${ethTrustDef.color}40`
            }}>
              {ethTrustDef.risk}
            </div>
          </div>
          <div className="text-8xl font-bold opacity-20" style={{ color: ethTrustDef.color }}>
            {ethTrustDef.level}
          </div>
        </div>
      </div>

      {/* SWC Registry Coverage */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-900">SWC Registry Coverage</h3>
        <p className="text-gray-600 mb-4">
          Smart Contract Weakness Classification patterns detected in your contract
        </p>
        
        {result.vulnerabilities.length > 0 ? (
          <div className="space-y-3">
            {Array.from(new Set(result.vulnerabilities.map(v => v.swcId))).map((swcId) => {
              const swc = getSWCById(swcId);
              const count = result.vulnerabilities.filter(v => v.swcId === swcId).length;
              
              return swc && (
                <div key={swcId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{swc.title}</div>
                      <div className="text-sm text-gray-600">
                        {swcId} • {swc.cweIds.join(', ')} • {count} instance{count > 1 ? 's' : ''}
                      </div>
                    </div>
                    <span className={`badge severity-${swc.severity.toLowerCase()}`}>
                      {swc.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{swc.description.substring(0, 150)}...</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            No SWC patterns detected
          </div>
        )}
      </div>

      {/* SCSVS Controls by Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">SCSVS v2 Controls by Category</h3>
          <button
            onClick={() => setShowSCSVSDetails(!showSCSVSDetails)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
          >
            <span>{showSCSVSDetails ? 'Hide Details' : 'Show Details'}</span>
            {showSCSVSDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {showSCSVSDetails && Object.entries(groupedControls).map(([category, controls]) => {
          const passed = controls.filter(c => c.passed).length;
          const total = controls.length;
          const percentage = (passed / total) * 100;

          return (
            <div key={category} className="card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{category}</h4>
                <div className="text-sm">
                  <span className="text-green-600 font-semibold">{passed}</span>
                  <span className="text-gray-500"> / {total}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="space-y-2">
                {controls.map((control) => (
                  <div
                    key={control.controlId}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    {control.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{control.title}</span>
                        <span className="text-xs text-gray-500">{control.controlId}</span>
                      </div>
                      {!control.passed && control.findings.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          {control.findings.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!showSCSVSDetails && (
          <div className="card bg-gray-50">
            <p className="text-center text-gray-600">
              Click &ldquo;Show Details&rdquo; to view all {result.scsvCompliance.checklist.length} SCSVS v2 controls by category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
