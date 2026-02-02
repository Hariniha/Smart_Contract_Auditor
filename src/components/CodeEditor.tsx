'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'sol',
  height = '500px' 
}: CodeEditorProps) {
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
}
