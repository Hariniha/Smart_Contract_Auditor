'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Upload,
  Play,
  FileCode,
  ArrowLeft,
  Github,
  Code2,
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import AnalysisResults from '@/components/AnalysisResults';
import SampleLoader from '@/components/SampleLoader';
import AnalysisProgress from '@/components/AnalysisProgress';
import { AnalysisResult } from '@/types';

export default function AnalyzerPage() {
  const [contractCode, setContractCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [githubRepoLink, setGithubRepoLink] = useState('');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');

  const isValidContractFileName = (name: string) => {
    const trimmed = name.trim();
    return /^[^\\/:*?"<>|]+\.(sol|vy|cairo)$/i.test(trimmed);
  };

  const runAnalysis = async (
    codeToAnalyze: string,
    targetFileName: string,
  ): Promise<void> => {
    // Stage 1: Parsing contract
    setProgress(10);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Stage 2: Static analysis - Pattern detection
    setProgress(25);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Stage 3: Static analysis - SWC Registry check
    setProgress(40);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractCode: codeToAnalyze,
        fileName: targetFileName.trim(),
        analysisTypes: ['static', 'ai', 'standards'],
        severity: 'all',
      }),
    });

    // Stage 4: Dynamic analysis - AI reasoning
    setProgress(55);
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Stage 5: Dynamic analysis - Logic evaluation
    setProgress(70);

    if (!response.ok) {
      let errorMessage = 'Analysis failed';
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.details) {
          errorMessage = errorData.details;
        }
      } catch {
        // Keep default message when response is not JSON.
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Stage 6: Standards compliance check
    setProgress(85);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Stage 7: Generating comprehensive report
    setProgress(95);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Complete
    setProgress(100);
    setAnalysisResult(result);
  };

  const handleAnalyze = async () => {
    if (!contractCode.trim()) {
      setError('Please enter contract code');
      return;
    }

    if (!isValidContractFileName(fileName)) {
      setError(
        'Enter the name of the code with proper extension (.sol, .vy, .cairo)',
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setProgress(0);

    try {
      await runAnalysis(contractCode, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setContractCode(content);
        setFileName(file.name);
        setError(null);
        // Switch to code view so users can immediately see uploaded content.
        setActiveTab('paste');
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = (code: string, name: string) => {
    setContractCode(code);
    setFileName(name);
    setAnalysisResult(null);
  };

  const handleGithubRepoAnalyze = async () => {
    if (!githubRepoLink.trim()) {
      setError('Please enter a GitHub repository link');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(10);

    try {
      setProgress(25);
      const repositoryResponse = await fetch('/api/github/repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: githubRepoLink }),
      });

      if (!repositoryResponse.ok) {
        let errorMessage = 'Failed to fetch repository';
        try {
          const errorData = await repositoryResponse.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Keep fallback error message.
        }

        throw new Error(errorMessage);
      }

      const repositoryResult = await repositoryResponse.json();
      const fetchedCode: string = repositoryResult.contractCode || '';
      const fetchedFileName: string =
        repositoryResult.fileName || 'contract.sol';

      if (!fetchedCode.trim()) {
        throw new Error(
          'No smart contract files were found in the provided GitHub link',
        );
      }

      setContractCode(fetchedCode);
      setFileName(fetchedFileName);
      setAnalysisResult(null);
      setActiveTab('paste');

      await runAnalysis(fetchedCode, fetchedFileName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch repository',
      );
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation */}
      <nav className='border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-14 md:h-16'>
            <Link href='/' className='flex items-center space-x-1 md:space-x-2'>
              <ArrowLeft className='w-4 md:w-5 h-4 md:h-5 text-gray-600 hover:text-emerald-600' />
              <Shield className='w-6 md:w-8 h-6 md:h-8 text-emerald-500' />
              <span className='text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500'>
                SmartAudit
              </span>
            </Link>
            <div className='flex items-center space-x-2 md:space-x-4'>
              <span className='text-xs md:text-sm text-gray-600 font-medium truncate max-w-[100px] md:max-w-none'>
                {fileName || 'No file name'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className='container mx-auto px-3 md:px-4 py-4 md:py-8'>
        {!analysisResult ? (
          <div className='grid md:grid-cols-3 gap-4 md:gap-6'>
            {/* Code Input Section */}
            <div className='md:col-span-2 space-y-4 md:space-y-6'>
              <div className='card'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4'>
                  <h2 className='text-lg md:text-2xl font-bold flex items-center text-gray-900'>
                    <FileCode className='w-5 md:w-6 h-5 md:h-6 mr-2 text-emerald-600' />
                    Smart Contract Analysis
                  </h2>
                  <div className='flex items-center gap-2 md:gap-3 flex-wrap'>
                    <span className='text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700'>
                      Solidity
                    </span>
                    <span className='text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700'>
                      Cairo
                    </span>
                    <span className='text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700'>
                      Vyper
                    </span>
                  </div>
                </div>

                {/* File Name Input */}
                <div className='mb-3 md:mb-4'>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <FileCode className='w-3 md:w-4 h-3 md:h-4 inline mr-2' />
                    Contract Name (.sol / .vy / .cairo)
                  </label>
                  <input
                    type='text'
                    value={fileName}
                    onChange={(e) => {
                      setFileName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder='contract.sol / contract.vy / contract.cairo'
                    className='w-full px-3 md:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-gray-900 text-sm'
                  />
                  {fileName.trim() && !isValidContractFileName(fileName) && (
                    <p className='mt-2 text-xs md:text-sm text-red-600'>
                      Use a valid file name ending with .sol, .vy, or .cairo
                    </p>
                  )}
                </div>

                {/* GitHub Repo Input */}
                <div className='mb-3 md:mb-4'>
                  <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <Github className='w-3 md:w-4 h-3 md:h-4 inline mr-2' />
                    GitHub Repository Link
                  </label>
                  <div className='flex gap-2 flex-col md:flex-row'>
                    <input
                      type='text'
                      value={githubRepoLink}
                      onChange={(e) => setGithubRepoLink(e.target.value)}
                      placeholder='https://github.com/username/repo'
                      className='flex-1 px-3 md:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-gray-900 text-sm'
                    />
                    <button
                      onClick={handleGithubRepoAnalyze}
                      disabled={isAnalyzing || !githubRepoLink.trim()}
                      className='px-4 md:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap'>
                      Analyze
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className='flex gap-1 md:gap-2 mb-4 border-b border-gray-200 overflow-x-auto'>
                  <button
                    onClick={() => setActiveTab('paste')}
                    className={`flex items-center px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 text-xs md:text-base whitespace-nowrap ${
                      activeTab === 'paste'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    <Code2 className='w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2' />
                    Paste Code
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 text-xs md:text-base whitespace-nowrap ${
                      activeTab === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    <Upload className='w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2' />
                    Upload File
                  </button>
                </div>

                {/* Paste Code Tab */}
                {activeTab === 'paste' && (
                  <div>
                    <textarea
                      value={contractCode}
                      onChange={(e) => setContractCode(e.target.value)}
                      placeholder={`Paste your code here...

Example:
pragma solidity ^0.8.0;

contract UserAuth {
    mapping(address => bool) public isRegistered;

    function registerUser() public {
        require(!isRegistered[msg.sender], 'User already registered');
        isRegistered[msg.sender] = true;
    }
}`}
                      className='w-full h-64 md:h-96 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono text-xs md:text-sm text-gray-700 resize-none leading-relaxed'
                    />
                    <div className='mt-2 text-xs md:text-sm text-blue-600'>
                      {contractCode.split('\n').length} lines •{' '}
                      {contractCode.length} characters
                    </div>
                  </div>
                )}

                {/* Upload File Tab */}
                {activeTab === 'upload' && (
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-12 text-center'>
                    <Upload className='w-8 md:w-12 h-8 md:h-12 mx-auto mb-3 md:mb-4 text-gray-400' />
                    <label className='cursor-pointer'>
                      <span className='text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base'>
                        Click to upload
                      </span>
                      <span className='text-gray-500 text-sm md:text-base'> or drag and drop</span>
                      <input
                        type='file'
                        accept='.sol,.vy,.cairo'
                        onChange={handleFileUpload}
                        className='hidden'
                      />
                    </label>
                    <p className='text-xs text-gray-500 mt-2'>
                      Solidity (.sol), Vyper (.vy), or Cairo (.cairo) files
                    </p>

                    {contractCode.trim() && (
                      <div className='mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-left'>
                        <p className='text-xs md:text-sm text-emerald-700 font-semibold'>
                          File loaded successfully
                        </p>
                        <p className='text-xs text-gray-700 mt-1'>
                          {fileName || 'Unnamed file'}
                        </p>
                        <p className='text-xs text-gray-600 mt-1'>
                          {contractCode.split('\n').length} lines •{' '}
                          {contractCode.length} characters
                        </p>
                        <button
                          type='button'
                          onClick={() => setActiveTab('paste')}
                          className='mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700'>
                          View uploaded code
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className='mt-4 p-3 md:p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm'>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !contractCode.trim()}
                  className='btn-primary w-full mt-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base py-2 md:py-3'>
                  {isAnalyzing ? (
                    <>
                      <div className='w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className='w-4 md:w-5 h-4 md:h-5 mr-2' />
                      Analyze Contract
                    </>
                  )}
                </button>

                {isAnalyzing && <AnalysisProgress progress={progress} />}
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-4 md:space-y-6'>
              <SampleLoader onLoad={handleLoadSample} />

              <div className='card'>
                <h3 className='text-base md:text-lg font-bold mb-3 md:mb-4 text-gray-900'>
                  Analysis Features
                </h3>
                <ul className='space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600'>
                  <li className='flex items-start'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0' />
                    <span>
                      <strong>Static Analysis:</strong> Pattern-based
                      vulnerability detection using SWC Registry
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0' />
                    <span>
                      <strong>Dynamic Analysis:</strong> AI-powered deep
                      analysis of complex logic and business rules
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <div className='w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0' />
                    <span>SCSVS v2 compliance checking</span>
                  </li>
                  <li className='flex items-start'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-2 flex-shrink-0' />
                    <span>EthTrust security level assessment</span>
                  </li>
                </ul>
              </div>

              <div className='card bg-blue-50/50 border-blue-200'>
                <h3 className='text-base md:text-lg font-bold mb-2 text-gray-900'>
                  Security Standards
                </h3>
                <p className='text-xs md:text-sm text-gray-600 mb-3'>
                  Analysis based on industry-recognized frameworks
                </p>
                <div className='space-y-2 text-xs'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>SWC Registry</span>
                    <span className='text-blue-600 font-semibold'>
                      35+ Checks
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>SCSVS v2</span>
                    <span className='text-purple-600 font-semibold'>
                      50+ Controls
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>EthTrust</span>
                    <span className='text-green-600 font-semibold'>
                      5 Levels
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setAnalysisResult(null)}
              className='mb-6 btn-secondary flex items-center text-sm md:text-base'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              New Analysis
            </button>
            <AnalysisResults result={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}
