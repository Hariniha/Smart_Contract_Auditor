'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

// Map smart contract languages to Monaco editor languages
function getMonacoLanguage(language: string = 'sol'): string {
  const languageMap: Record<string, string> = {
    'sol': 'sol',
    'solidity': 'sol',
    'vy': 'python',
    'vyper': 'python',
    'cairo': 'rust',
  };
  return languageMap[language.toLowerCase()] || 'sol';
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'sol',
  height = '400px' 
}: CodeEditorProps) {
  const monacoLang = getMonacoLanguage(language);
  
  // Responsive height based on viewport
  const responsiveHeight = height === '500px' ? 'min(500px, 60vh)' : height;

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white w-full">
      <Editor
        height={responsiveHeight}
        language={monacoLang}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 }
        }}
      />
    </div>
  );
}
