'use client';

interface AnalysisProgressProps {
  progress: number;
}

export default function AnalysisProgress({ progress }: AnalysisProgressProps) {
  const stages = [
    { label: 'Parsing contract', threshold: 15 },
    { label: 'Static analysis - Pattern detection', threshold: 30 },
    { label: 'Static analysis - SWC Registry check', threshold: 45 },
    { label: 'Dynamic analysis - AI reasoning', threshold: 60 },
    { label: 'Dynamic analysis - Logic evaluation', threshold: 75 },
    { label: 'Standards compliance check', threshold: 90 },
    { label: 'Generating comprehensive report', threshold: 95 }
  ];

  const currentStage = stages.find(s => progress < s.threshold) || stages[stages.length - 1];

  return (
    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700 font-medium">{currentStage.label}</span>
        <span className="text-sm font-semibold text-emerald-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
