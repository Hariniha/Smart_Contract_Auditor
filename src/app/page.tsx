'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, FileSearch, BarChart3, CheckCircle2, Github, Twitter, DollarSign, Lock, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const circuitLinesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (circuitLinesRef.current) {
      const paths = circuitLinesRef.current.querySelectorAll('path');
      gsap.fromTo(paths,
        { strokeDasharray: 1000, strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          duration: 3,
          stagger: 0.5,
          repeat: -1,
          repeatDelay: 2,
          ease: 'power2.inOut'
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#0f1c2e] to-black">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">SmartAudit AI</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                Features
              </Link>
              <Link href="#how-to-use" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">
                How to Use
              </Link>
              <Link href="/analyzer" className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">AI-Powered Security Analysis</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Secure Your Code
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                with AI Intelligence
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Comprehensive security analysis combining <strong>static pattern detection</strong> with 
              <strong> dynamic AI analysis</strong> to identify vulnerabilities and protect your smart contracts.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300 font-medium">Static Analysis</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300 font-medium">AI-Powered Dynamic Analysis</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-300 font-medium">Comprehensive Reports</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/analyzer" 
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center"
              >
                Try it Now - It&apos;s Free
              </Link>
              
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              
              
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
            ref={heroRef}
          >
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Circuit Board Image Background */}
              <div className="absolute inset-0">
                <img 
                  src="/circuit-board.jpg" 
                  alt="Circuit Board"
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.7) saturate(1.2) hue-rotate(-10deg)' }}
                />
                {/* Teal/Emerald Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent mix-blend-overlay"></div>
              </div>

              {/* Security Score Card */}
              
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Why Smart Contract Security Matters
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Over $3 billion lost to smart contract vulnerabilities in 2023. A single bug can 
              cost millions. Our AI-powered auditor helps you catch vulnerabilities before they 
              become exploits.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                { 
                  icon: <DollarSign className="w-12 h-12 text-emerald-600" />, 
                  title: 'Financial Loss', 
                  desc: 'Prevent costly exploits' 
                },
                { 
                  icon: <Lock className="w-12 h-12 text-emerald-600" />, 
                  title: 'Security Breach', 
                  desc: 'Detect vulnerabilities early' 
                },
                { 
                  icon: <AlertTriangle className="w-12 h-12 text-emerald-600" />, 
                  title: 'Reputation Risk', 
                  desc: 'Maintain user trust' 
                }
              ].map((item, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-200">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-900 to-[#0f1c2e]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Dual-Layer Security Analysis
            </h2>
            <p className="text-lg text-gray-400">
              Static pattern detection meets dynamic AI analysis for comprehensive security coverage
            </p>
          </motion.div>

          {/* Feature Cards Grid - 4 cards like in the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          >
            {[
              {
                icon: <FileSearch className="w-12 h-12 text-blue-500" />,
                badge: 'Pattern Detection',
                badgeColor: 'bg-blue-500/20 text-blue-300',
                title: 'Static Analysis',
                description: 'Fast pattern-based vulnerability detection using SWC Registry and known attack vectors'
              },
              {
                icon: <Zap className="w-12 h-12 text-purple-500" />,
                badge: 'AI Reasoning',
                badgeColor: 'bg-purple-500/20 text-purple-300',
                title: 'Dynamic Analysis',
                description: 'AI-powered reasoning to understand complex business logic, state transitions, and edge cases'
              },
              {
                icon: <Shield className="w-12 h-12 text-emerald-500" />,
                badge: 'Compliance',
                badgeColor: 'bg-emerald-500/20 text-emerald-300',
                title: 'Standards Check',
                description: 'SCSVS v2 compliance validation and EthTrust security level assessment'
              },
              {
                icon: <BarChart3 className="w-12 h-12 text-teal-500" />,
                badge: 'Insights',
                badgeColor: 'bg-teal-500/20 text-teal-300',
                title: 'Smart Reports',
                description: 'Comprehensive vulnerability reports with actionable recommendations and risk scoring'
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-gray-700 rounded-2xl p-6 hover:border-emerald-500 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-800/50 rounded-xl group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Use */}
      <section id="how-to-use" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              How to Use SmartAudit AI
            </h2>
            <p className="text-lg text-gray-600">
              Get started with our AI-powered smart contract auditor in three simple steps
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Upload Your Contract',
                  description: 'Paste your Solidity, Vyper, or Cairo code directly, upload smart contract files (.sol, .vy, .cairo), or connect your GitHub repository for analysis',
                  icon: <FileSearch className="w-10 h-10 text-emerald-600" />
                },
                {
                  step: '02',
                  title: 'View Dashboard & Results',
                  description: 'Instantly see comprehensive analysis results with security scores, vulnerability details, and compliance checks in an interactive dashboard',
                  icon: <Zap className="w-10 h-10 text-emerald-600" />
                },
                {
                  step: '03',
                  title: 'Download Reports',
                  description: 'Click the download button to export comprehensive security reports in PDF, JSON, or Text format for documentation and review',
                  icon: <BarChart3 className="w-10 h-10 text-emerald-600" />
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300 h-full">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{item.step}</span>
                    </div>
                    <div className="mb-4 mt-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">Advanced Features</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Multiple Export Formats</h4>
                    <p className="text-sm text-gray-600">Download comprehensive reports as PDF, structured JSON, or plain text</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Real-time Code Editing</h4>
                    <p className="text-sm text-gray-600">Built-in Monaco editor with syntax highlighting and instant analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Standards Compliance</h4>
                    <p className="text-sm text-gray-600">Automatic validation against SCSVS v2 and EthTrust security levels</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Sample Contracts</h4>
                    <p className="text-sm text-gray-600">Pre-loaded vulnerable contracts to test and understand common security issues</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Standards */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-[#0f1c2e]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Industry-Leading Standards
            </h2>
            <p className="text-lg text-gray-400">
              Built on recognized security frameworks and classifications
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'SWC Registry',
                description: 'Smart Contract Weakness Classification with CWE mappings',
                checks: '35+ Weakness Types'
              },
              {
                title: 'SCSVS v2',
                description: 'Smart Contract Security Verification Standard Framework',
                checks: '50+ Security Controls'
              },
              {
                title: 'EthTrust Levels',
                description: 'Official EthTrust security level classification system',
                checks: '5 Security Levels'
              }
            ].map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{standard.title}</h3>
                <p className="text-gray-300 mb-4">{standard.description}</p>
                <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
                  {standard.checks}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What&apos;s Included in Your Report
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive security analysis documentation with all the details you need
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: <AlertTriangle className="w-10 h-10 text-emerald-600" />,
                  title: 'Vulnerability Details',
                  items: ['Complete list of detected vulnerabilities', 'Severity levels (Critical, High, Medium, Low)', 'Exact line numbers and code snippets', 'SWC classification mappings']
                },
                {
                  icon: <BarChart3 className="w-10 h-10 text-emerald-600" />,
                  title: 'Security Metrics',
                  items: ['Overall security score (0-100)', 'EthTrust security level (1-5)', 'Risk distribution analytics', 'Vulnerability category breakdown']
                },
                {
                  icon: <Shield className="w-10 h-10 text-emerald-600" />,
                  title: 'Compliance Checks',
                  items: ['SCSVS v2 compliance validation', 'Passed and failed security controls', 'Standards coverage percentage', 'Detailed control assessments']
                },
                {
                  icon: <FileSearch className="w-10 h-10 text-emerald-600" />,
                  title: 'Recommendations',
                  items: ['Actionable fix recommendations', 'Code improvement suggestions', 'Best practice guidelines', 'Prevention strategies']
                }
              ].map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-emerald-500 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mr-4">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Export Formats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">Available Export Formats</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-3 shadow-md">
                    <FileSearch className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">PDF Report</h4>
                  <p className="text-sm text-gray-600">Professional formatted document with charts and visualizations</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-3 shadow-md">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">JSON Data</h4>
                  <p className="text-sm text-gray-600">Structured data for integration with your tools and systems</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-3 shadow-md">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Text File</h4>
                  <p className="text-sm text-gray-600">Plain text format for easy sharing and documentation</p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-white">SmartAudit AI</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered smart contract security analysis
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/analyzer" className="hover:text-emerald-400">Analyzer</Link></li>
                <li><Link href="/" className="hover:text-emerald-400">Features</Link></li>
                <li><Link href="/" className="hover:text-emerald-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400">API Reference</a></li>
                <li><a href="#" className="hover:text-emerald-400">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-emerald-400">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-emerald-400">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 SmartAudit AI. Built with SWC Registry, SCSVS v2, and EthTrust Standards.
          </div>
        </div>
      </footer>
    </div>
  );
}
