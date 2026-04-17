'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';
import { Shield, AlertTriangle, FileText, BarChart3, FileDown, Bot } from 'lucide-react';
import OverviewDashboard from '@/components/OverviewDashboard';
import VulnerabilitiesList from '@/components/VulnerabilitiesList';
import SecurityStandards from '@/components/SecurityStandards';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { generatePDFReport } from '@/lib/pdf-generator';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vulnerabilities' | 'standards' | 'analytics'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Shield },
    { id: 'vulnerabilities' as const, label: 'Vulnerabilities', icon: AlertTriangle, count: result.statistics.total },
    { id: 'standards' as const, label: 'Security Standards', icon: FileText },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 }
  ];

  const handleDownloadPDF = () => {
    generatePDFReport(result);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4">
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-bold mb-2 text-gray-900">Analysis Results</h1>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <p className="text-xs md:text-sm text-gray-600">{result.fileName}</p>
              {result.language && (
                <span className="px-2 md:px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-300">
                  {result.language.charAt(0).toUpperCase() + result.language.slice(1)}
                </span>
              )}
              {result.vulnerabilities.some(v => v.detectionMethod === 'ai-detected' || v.detectionMethod === 'ai-optimized') && (
                <span className="px-2 md:px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-300 flex items-center gap-1 whitespace-nowrap">
                  <Bot className="w-3 h-3" />
                  <span className="hidden sm:inline">AI Enhanced Analysis</span>
                  <span className="sm:hidden">AI Enhanced</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center text-sm md:text-base py-2 md:py-3 px-4 md:px-6"
            >
              <FileDown className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">PDF</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Info Banner */}
        {result.vulnerabilities.some(v => v.detectionMethod === 'ai-detected' || v.detectionMethod === 'ai-optimized') && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3 md:p-4 mt-4">
            <div className="flex items-start gap-2 md:gap-3">
              <Bot className="w-5 md:w-6 h-5 md:h-6 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-purple-900 text-sm md:text-base">Advanced AI Analysis Included</h3>
                <p className="text-xs md:text-sm text-purple-700 mt-1">
                  This analysis includes vulnerabilities discovered by AI pattern recognition in addition to static analysis. 
                  AI-detected findings are marked with a purple badge in the vulnerabilities list.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-md">
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <div className="flex space-x-2 md:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 md:space-x-2 pb-3 md:pb-4 border-b-2 transition-colors whitespace-nowrap text-xs md:text-base ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-semibold hidden sm:inline">{tab.label}</span>
                  <span className="font-semibold sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 md:px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewDashboard result={result} />}
          {activeTab === 'vulnerabilities' && <VulnerabilitiesList vulnerabilities={result.vulnerabilities} language={result.language} />}
          {activeTab === 'standards' && <SecurityStandards result={result} />}
          {activeTab === 'analytics' && <AnalyticsDashboard result={result} />}
        </div>
      </div>
    </div>
  );
}
