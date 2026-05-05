'use client';

import {
  Shield,
  BookOpen,
  Zap,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-2'>
            <Shield className='w-8 h-8 text-emerald-500' />
            <span className='font-bold text-lg text-gray-900'>SmartAudit</span>
          </Link>
          <div className='flex items-center space-x-6'>
            <Link
              href='/'
              className='text-gray-700 hover:text-emerald-600 font-medium transition'>
              Home
            </Link>
            <Link
              href='/analyzer'
              className='text-gray-700 hover:text-emerald-600 font-medium transition'>
              Analyzer
            </Link>
            <Link
              href='/documentation'
              className='text-emerald-600 font-medium'>
              Documentation
            </Link>
          </div>
        </div>
      </nav>

      <section className='bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-5xl font-bold mb-4'>SmartAudit Documentation</h1>
          <p className='text-lg text-emerald-50'>
            Learn how to use SmartAudit for smart contract security analysis
          </p>
        </div>
      </section>

      <section className='py-16'>
        <div className='mx-auto px-4 max-w-4xl space-y-8'>
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex items-center space-x-3 mb-4'>
              <BookOpen className='w-8 h-8 text-emerald-600' />
              <h2 className='text-3xl font-bold text-gray-900'>Overview</h2>
            </div>
            <p className='text-gray-700 leading-relaxed'>
              SmartAudit is a comprehensive security analysis
              platform that identifies vulnerabilities, security issues, and
              code quality problems in Solidity and Vyper smart contracts,
              plus Cairo provable code. Our platform combines static pattern detection with
              AI-powered analysis for thorough auditing.
            </p>
          </div>

          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex items-center space-x-3 mb-6'>
              <CheckCircle2 className='w-8 h-8 text-emerald-600' />
              <h2 className='text-3xl font-bold text-gray-900'>Features</h2>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='border-l-4 border-emerald-500 pl-4'>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>
                  Smart Contract Analyzer
                </h3>
                <p className='text-gray-600'>
                  Advanced analysis for detecting vulnerabilities in contract
                  code
                </p>
              </div>
              <div className='border-l-4 border-emerald-500 pl-4'>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>
                  Vulnerability Detection
                </h3>
                <p className='text-gray-600'>
                  Identifies security weaknesses and design flaws automatically
                </p>
              </div>
              <div className='border-l-4 border-emerald-500 pl-4'>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>
                  Severity Classification
                </h3>
                <p className='text-gray-600'>
                  Issues categorized by severity for easy prioritization
                </p>
              </div>
              <div className='border-l-4 border-emerald-500 pl-4'>
                <h3 className='font-bold text-gray-900 text-lg mb-2'>
                  PDF Report Generation
                </h3>
                <p className='text-gray-600'>
                  Export comprehensive audit reports with findings
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex items-center space-x-3 mb-6'>
              <Zap className='w-8 h-8 text-emerald-600' />
              <h2 className='text-3xl font-bold text-gray-900'>How It Works</h2>
            </div>
            <div className='space-y-4'>
              {[
                {
                  num: 1,
                  title: 'Input Your Code',
                  desc: 'Paste or upload your smart contract or provable code',
                },
                {
                  num: 2,
                  title: 'Analyzer Scans Code',
                  desc: 'System performs static and dynamic analysis',
                },
                {
                  num: 3,
                  title: 'Detects Vulnerabilities',
                  desc: 'Security issues are identified and classified',
                },
                {
                  num: 4,
                  title: 'Generates Report',
                  desc: 'Creates comprehensive audit report',
                },
              ].map((step) => (
                <div key={step.num} className='flex gap-4 items-start'>
                  <div className='flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold'>
                    {step.num}
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 text-lg'>
                      {step.title}
                    </h3>
                    <p className='text-gray-600'>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-md p-8'>
            <h2 className='text-3xl font-bold text-gray-900 mb-6'>
              How to Use
            </h2>
            <ol className='space-y-4 text-gray-700'>
              <li className='flex gap-4'>
                <span className='font-bold text-emerald-600'>1.</span>
                <div>
                  <strong>Paste or Upload Your Code</strong>
                  <p className='text-gray-600'>
                    Go to Analyzer and enter your smart contract or provable code
                  </p>
                </div>
              </li>
              <li className='flex gap-4'>
                <span className='font-bold text-emerald-600'>2.</span>
                <div>
                  <strong>Run Analysis</strong>
                  <p className='text-gray-600'>
                    Click "Analyze" to start the security scan
                  </p>
                </div>
              </li>
              <li className='flex gap-4'>
                <span className='font-bold text-emerald-600'>3.</span>
                <div>
                  <strong>View Results</strong>
                  <p className='text-gray-600'>
                    Review vulnerabilities, severity levels, and recommendations
                  </p>
                </div>
              </li>
              <li className='flex gap-4'>
                <span className='font-bold text-emerald-600'>4.</span>
                <div>
                  <strong>Download PDF Report</strong>
                  <p className='text-gray-600'>
                    Export professional report with all findings
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex items-center space-x-3 mb-6'>
              <FileText className='w-8 h-8 text-emerald-600' />
              <h2 className='text-3xl font-bold text-gray-900'>PDF Report</h2>
            </div>
            <p className='text-gray-700 leading-relaxed mb-4'>
              The report includes:
            </p>
            <ul className='space-y-2 text-gray-700'>
              <li className='flex gap-2'>
                <span className='text-emerald-600 font-bold'>✓</span>
                <span>
                  <strong>Executive Summary</strong> - Overview of findings and
                  risk assessment
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-emerald-600 font-bold'>✓</span>
                <span>
                  <strong>Detailed Findings</strong> - Complete list of
                  vulnerabilities discovered
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-emerald-600 font-bold'>✓</span>
                <span>
                  <strong>Severity Levels</strong> - Issues classified by
                  severity
                </span>
              </li>
              <li className='flex gap-2'>
                <span className='text-emerald-600 font-bold'>✓</span>
                <span>
                  <strong>Fix Recommendations</strong> - Actionable steps to
                  remediate
                </span>
              </li>
            </ul>
          </div>

          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='flex items-center space-x-3 mb-6'>
              <AlertTriangle className='w-8 h-8 text-emerald-600' />
              <h2 className='text-3xl font-bold text-gray-900'>
                Security Standards
              </h2>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-6'>
                <h3 className='font-bold text-emerald-900 text-lg mb-2'>
                  SWC Registry
                </h3>
                <p className='text-gray-700 text-sm'>
                  Smart Contract Weakness classification system with
                  standardized vulnerability IDs
                </p>
              </div>
              <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-6'>
                <h3 className='font-bold text-emerald-900 text-lg mb-2'>
                  SCSVS v2
                </h3>
                <p className='text-gray-700 text-sm'>
                  Smart Contract Security Verification Standard framework for
                  controls and best practices
                </p>
              </div>
              <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-6'>
                <h3 className='font-bold text-emerald-900 text-lg mb-2'>
                  EthTrust
                </h3>
                <p className='text-gray-700 text-sm'>
                  Ethereum Trust Standards for secure smart contract development
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-8 text-white text-center'>
            <h3 className='text-3xl font-bold mb-2'>
              Ready to Analyze Your Code?
            </h3>
            <p className='text-emerald-50 mb-6'>Start with SmartAudit today</p>
            <Link
              href='/analyzer'
              className='inline-block px-8 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 transition'>
              Go to Analyzer
            </Link>
          </div>
        </div>
      </section>

      <footer className='border-t border-gray-800 py-12 bg-gray-900/50 mt-16'>
        <div className='mx-auto px-4 max-w-5xl'>
          <div className='flex flex-col md:flex-row justify-center items-start md:items-start gap-16 md:gap-20'>
            <div className='text-center md:text-left'>
              <div className='flex items-center justify-center md:justify-start space-x-2 mb-4'>
                <Shield className='w-6 h-6 text-emerald-500' />
                <span className='font-bold text-white'>SmartAudit</span>
              </div>
              <p className='text-sm text-gray-400'>
                AI-powered security analysis for smart contracts & provable code
              </p>
            </div>
            <div className='text-center md:text-left'>
              <h3 className='font-bold mb-4 text-white'>Product</h3>
              <ul className='space-y-2 text-sm text-gray-400'>
                <li>
                  <Link
                    href='/analyzer'
                    className='hover:text-emerald-400 transition'>
                    Analyzer
                  </Link>
                </li>
                <li>
                  <Link
                    href='/#features'
                    className='hover:text-emerald-400 transition'>
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div className='text-center md:text-left'>
              <h3 className='font-bold mb-4 text-white'>Resources</h3>
              <ul className='space-y-2 text-sm text-gray-400'>
                <li>
                  <Link
                    href='/documentation'
                    className='hover:text-emerald-400 transition'>
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400'>
            © 2026 SmartAudit. Built with SWC Registry, SCSVS v2, and EthTrust
            Standards.
          </div>
        </div>
      </footer>
    </div>
  );
}
