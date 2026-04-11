'use client';

import { FileCode } from 'lucide-react';
import { getAllSamples } from '@/lib/sample-contracts';
import { detectLanguage, getLanguageFileExtension } from '@/lib/language-detector';

interface SampleLoaderProps {
  onLoad: (code: string, name: string) => void;
}

export default function SampleLoader({ onLoad }: SampleLoaderProps) {
  const samples = getAllSamples();

  const getFileNameWithExtension = (code: string, name: string) => {
    const detected = detectLanguage(code);
    const extension = getLanguageFileExtension(detected.language);
    return name + extension;
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center text-gray-900 mb-2">
          <FileCode className="w-5 h-5 mr-2 text-blue-500" />
          Sample Contracts
        </h3>
        <p className="text-xs text-gray-600">
          Try our multi-language examples:
          <span className="inline-flex gap-2 ml-2">
            <span className="font-semibold text-blue-600">Solidity</span>
            <span className="font-semibold text-yellow-600">Cairo</span>
            <span className="font-semibold text-green-600">Vyper</span>
          </span>
        </p>
      </div>
      <div className="space-y-2">
        {samples.map((sample) => {
          const detected = detectLanguage(sample.code);
          const languageLabel = detected.language.charAt(0).toUpperCase() + detected.language.slice(1);
          const getBgColor = (lang: string) => {
            switch(lang.toLowerCase()) {
              case 'solidity': return 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300';
              case 'cairo': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 hover:border-yellow-300';
              case 'vyper': return 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300';
              default: return 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300';
            }
          };
          return (
            <button
              key={sample.key}
              onClick={() => onLoad(sample.code, getFileNameWithExtension(sample.code, sample.name))}
              className={`w-full text-left p-3 rounded-lg border transition-all ${getBgColor(detected.language)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">{sample.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{sample.description}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                  detected.language === 'solidity' ? 'bg-blue-200 text-blue-700' :
                  detected.language === 'cairo' ? 'bg-yellow-200 text-yellow-700' :
                  'bg-green-200 text-green-700'
                }`}>
                  {languageLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
