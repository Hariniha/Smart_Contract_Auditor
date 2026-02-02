'use client';

import { FileCode } from 'lucide-react';
import { getAllSamples } from '@/lib/sample-contracts';

interface SampleLoaderProps {
  onLoad: (code: string, name: string) => void;
}

export default function SampleLoader({ onLoad }: SampleLoaderProps) {
  const samples = getAllSamples();

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
        <FileCode className="w-5 h-5 mr-2 text-blue-500" />
        Sample Contracts
      </h3>
      <div className="space-y-2">
        {samples.map((sample) => (
          <button
            key={sample.key}
            onClick={() => onLoad(sample.code, sample.name + '.sol')}
            className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 
                     border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="font-semibold text-sm text-gray-900">{sample.name}</div>
            <div className="text-xs text-gray-600 mt-1">{sample.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
