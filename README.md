# 🛡️ SmartAudit AI - AI-Powered Smart Contract Auditor

A comprehensive web application that performs dual-layer security analysis of smart contracts (Solidity, Vyper, Cairo) using static pattern detection and dynamic AI-powered analysis with industry-standard security classifications.

## 🌟 Features

### Multi-Language Support
- **Solidity**: Full support for Ethereum smart contracts (.sol)
- **Vyper**: Python-like smart contract language analysis (.vy)
- **Cairo**: StarkNet smart contract security auditing (.cairo)
- **Auto-Detection**: Automatically detects contract language from code or file extension

### Dual-Layer Security Analysis
- **Static Analysis**: Fast pattern-based vulnerability detection using SWC Registry and language-specific patterns
- **Dynamic Analysis (AI-Powered)**: Advanced AI reasoning to understand complex business logic, state transitions, and edge cases
- **Standards Compliance**: SCSVS v2 framework validation and EthTrust security level assessment
- **Smart Reports**: Comprehensive vulnerability reports with actionable recommendations and risk scoring

### Security Standards
- **SWC Registry**: 35+ Smart Contract Weakness patterns with CWE mappings (Solidity)
- **VSR (Vyper Security Registry)**: 15 Vyper-specific vulnerability patterns with official documentation
- **CSR (Cairo Security Registry)**: 20 Cairo/StarkNet security patterns with OpenZeppelin references
- **SCSVS v2**: 50+ Security Verification Standard controls
- **EthTrust**: 5-level security classification system
- **Language-Specific Patterns**: Dedicated vulnerability detection for Solidity, Vyper, and Cairo

### Key Features
- ✅ Multi-language support (Solidity, Vyper, Cairo)
- ✅ Automatic language detection
- ✅ Real-time code analysis with Monaco Editor
- ✅ Comprehensive vulnerability detection with line numbers
- ✅ AI-powered explanations and recommendations (Groq + Llama 3.3)
- ✅ Interactive results dashboard with charts and analytics
- ✅ SCSVS v2 compliance checking
- ✅ EthTrust security level assessment
- ✅ Multiple export formats (PDF, JSON, Text)
- ✅ Sample contracts for all supported languages
- ✅ Contract naming for organized reports
- ✅ Light theme UI with smooth animations
- ✅ Character and line counter
- ✅ Responsive design for all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Groq API key (already configured)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
Create a `.env` file in the root directory with your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note**: Get your free Groq API key from [https://console.groq.com](https://console.groq.com)
> A sample `.env.local` file is provided for reference.

3. **Run Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts    # Main analysis API endpoint
│   ├── analyzer/page.tsx       # Analyzer page with tabs
│   ├── page.tsx                # Landing page with features
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles (light theme)
├── components/
│   ├── AnalysisResults.tsx     # Results container with tabs
│   ├── OverviewDashboard.tsx   # Overview tab with metrics
│   ├── VulnerabilitiesList.tsx # Vulnerabilities tab with details
│   ├── SecurityStandards.tsx   # Standards tab (SWC/SCSVS)
│   ├── AnalyticsDashboard.tsx  # Analytics tab with charts
│   ├── CodeEditor.tsx          # Monaco editor wrapper
│   ├── SampleLoader.tsx        # Sample contracts loader
│   └── AnalysisProgress.tsx    # Progress indicator
├── lib/
│   ├── swc-registry.ts         # SWC weakness definitions (Solidity)
│   ├── vyper-security-registry.ts # VSR definitions (Vyper)
│   ├── cairo-security-registry.ts # CSR definitions (Cairo)
│   ├── scsvs-v2.ts             # SCSVS v2 controls
│   ├── ethtrust.ts             # EthTrust levels
│   ├── groq-service.ts         # Groq API integration
│   ├── static-analyzer.ts      # Multi-language analyzer router
│   ├── vyper-analyzer.ts       # Vyper analysis engine
│   ├── cairo-analyzer.ts       # Cairo analysis engine
│   ├── language-detector.ts    # Auto-detect contract language
│   ├── vulnerability-patterns.ts # Solidity patterns
│   ├── vyper-patterns.ts       # Vyper patterns
│   ├── cairo-patterns.ts       # Cairo patterns
│   ├── sample-contracts.ts     # Example contracts (all languages)
│   ├── pdf-generator.ts        # PDF report generation
│   ├── doc-generator.ts        # Text report generation
│   └── utils.ts                # Utility functions
└── types/
    └── index.ts                # TypeScript definitions
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Light Theme)
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Charts**: Recharts for analytics visualization
- **Animations**: Framer Motion & GSAP
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **State**: React Hooks

### Backend
- **Runtime**: Next.js API Routes
- **AI**: Groq API (Llama 3.3 70B Versatile)
- **Parser**: @solidity-parser/parser (v0.18.0)
- **Analysis**: Custom dual-layer analysis engine

## 📊 Security Standards

### SWC (Smart Contract Weakness) Registry
35+ weakness patterns for Solidity including:
- SWC-107: Reentrancy
- SWC-105: Unprotected Ether Withdrawal
- SWC-106: Unprotected SELFDESTRUCT
- SWC-101: Integer Overflow/Underflow
- SWC-115: Authorization through tx.origin
- And 30+ more patterns...

### VSR (Vyper Security Registry)
15 Vyper-specific vulnerability patterns:
- VSR-001: Reentrancy in Vyper contracts
- VSR-002: Unchecked external calls (send/raw_call)
- VSR-003: Integer overflow and arithmetic issues
- VSR-004: tx.origin authentication
- VSR-005: Missing access control decorators
- VSR-006: Zero address validation
- VSR-007: Timestamp dependence
- VSR-008: Dangerous assert usage
- VSR-009: Unsafe delegatecall via raw_call
- VSR-010: Unprotected selfdestruct
- VSR-011: Uninitialized storage variables
- VSR-012: State race conditions
- VSR-013: Missing type annotations
- VSR-014: Missing event emissions
- VSR-015: Outdated compiler version
- **References**: Official Vyper documentation (docs.vyperlang.org)
- **CWE Mappings**: Industry-standard weakness enumeration

### CSR (Cairo Security Registry)
20 Cairo/StarkNet-specific security patterns:
- CSR-001: Reentrancy in Cairo contracts
- CSR-002: Unchecked external calls
- CSR-003: felt252 overflow vulnerabilities
- CSR-004: Missing access control
- CSR-005: Zero address checks
- CSR-006: Timestamp manipulation
- CSR-007: Storage collision risks
- CSR-008: Unused return values
- CSR-009: Dangerous library_call usage
- CSR-010: Unvalidated input parameters
- CSR-011: Constructor validation issues
- CSR-012: Array bounds checking
- CSR-013: Unchecked arithmetic operations
- CSR-014: Missing event emissions
- CSR-015: Cairo version compatibility
- CSR-016: Storage pointer manipulation
- CSR-017: Incorrect type conversions
- CSR-018: Gas optimization issues
- CSR-019: Cross-contract call vulnerabilities
- CSR-020: Proxy pattern security
- **References**: StarkNet docs and OpenZeppelin Cairo contracts
- **CWE Mappings**: Comprehensive weakness classification

### SCSVS v2 Framework
50+ security controls across categories:
- Architecture & Design
- Access Control
- Arithmetic Operations
- Input Validation
- Gas Optimization
- External Calls
- Business Logic
- Cryptography
- And more...

### EthTrust Security Levels
- **Level 1**: Critical - Unsafe (Critical vulnerabilities)
- **Level 2**: High Risk (High severity issues)
- **Level 3**: Medium Risk (Medium issues only, Vyper, or Cairo code into the editor
- **Upload File**: Upload a `.sol`, `.vy`, or `.cairo` file from your computer
- **Load Sample**: Test with pre-loaded contracts in all supported languages
- **Name Your Contract**: Add a custom name for organized reports
- **Auto-Detection**: Language is automatically detected from code or file extension
## 🎯 How to Use

### Step 1: Upload Your Contract
- **Paste Code**: Directly paste your Solidity code into the editor
- **Upload File**: Upload a `.sol` file from your computer
- **Load Sample**: Test with pre-loaded vulnerable contracts
6 pre-loaded examples for testing:

**Solidity:**
1. **Vulnerable Bank**: Classic reentrancy vulnerability (SWC-107)
2. **Unprotected Contract**: Missing access controls (SWC-105)

**Vyper:**
3. **Vulnerable Vyper Wallet**: Unchecked send and access control issues
4. **Secure Vyper Token**: Best practices with proper decorators

**Cairo:**
5. **Unsafe Cairo Vault**: Reentrancy and missing validation
6. **Secure Cairo Contract**: Proper patterns and safety checks
  - **Overview**: Security score, risk level, EthTrust level, key metrics
  - **Vulnerabilities**: Detailed list with severity, line numbers, code snippets
  - **Security Standards**: SWC Registry and SCSVS v2 compliance
  - **Analytics**: Charts, risk distribution, recommendations

### Step 3: Download Reports
Click the download button to export in multiple formats:
- **PDF Report**: Professional formatted document with charts
- **JSON Data**: Structured data for integration
- **Text File**: Plain text for easy sharing

## 📦 Report Contents

### Vulnerability Details
- Complete list of detected vulnerabilities
- Severity levels (Critical, High, Medium, Low)
- Eecurity classification mappings:
  - SWC IDs for Solidity
  - VSR IDs for Vyper (with docs.vyperlang.org references)
  - CSR IDs for Cairo (with StarkNet/OpenZeppelin references)
- CWE mappings for all languagee snippets
- SWC classification mappings
- AI-enhanced descriptions and explanations

### Security Metrics
- Overall security score (0-100)
- EthTrust security level (1-5)
- Risk distribution analytics
- Vulnerability category breakdown

### Compliance Checks
- SCSVS v2 compliance validation
- Passed and failed security controls
- Standards coverage percentage
- Detailed control assessments

### Recommendations
- Actionable fix recommendations
- Code improvement suggestions
- Best practice guidelines
- Prevention strategies

## 🔍 Sample Contracts

4 pre-loaded examples for testing:
1. **Vulnerable Bank**: Classic reentrancy vulnerability (SWC-107)
2. **Unprotected Contract**: Missing access controls (SWC-105)
3. **Integer Overflow**: Arithmetic vulnerabilities (SWC-101)
4. **Secure Token**: Best practices implementation (Educational)

## 🌐 API Endpoints

### POST /api/analyze
Analyzes smart contract code and returns comprehensive security report.

**Request Body:**
```json
{
  "contractCode": "string",
  "fileName": "string (optional)"
}
```

**Response:**
```json
{
  "analysisId": "uuid",
  "timestamp": "ISO-8601",
  "fileName": "string",
  "contractName": "string",
  "securityScore": 75,
  "riskLevel": "Medium",
  "ethTrustLevel": 3,
  "vulnerabilities": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "severity": "Critical|High|Medium|Low",
      "category": "string",
      "swcId": "SWC-XXX",
      "line": 42,
      "codeSnippet": "string",
      "recommendation": "string",
      "aiAnalysis": "string (for top 3 critical/high)"
    }
  ],
  "statistics": {
    "totalVulnerabilities": 10,
    "critical": 2,
    "high": 3,
    "medium": 4,
    "low": 1,
    "linesOfCode": 150
  },
  "scsvCompliance": {
    "score": 75,
    "passed": 38,
    "failed": 12,
    "controls": [...]
  },
  "recommendations": [
    "Fix critical reentrancy in withdraw function",
    "Add access control modifiers",
    "..."
  ]Multi-Registry Support**: 
  - SWC Registry (35+ Solidity patterns)
  - VSR (15 Vyper patterns with official docs)
  - CSR (20 Cairo/StarkNet patterns)
- **Fast Execution**: Instant results
- **Known Attack Vectors**: Reentrancy, access control, arithmetic issues, etc.
- **Language-Specific**: Uses appropriate registry based on detected language

## 📈 Analysis Features

### Static Analysis
- **Pattern-Based Detection**: Scans for known vulnerability patterns
- **SWC Registry**: 35+ weakness types detected
- **Fast Execution**: Instant results
- **Known Attack Vectors**: Reentrancy, access control, arithmetic issues, etc.

### Dynamic Analysis (AI-Powered)
- **Deep Semantic Understanding**: Analyzes business logic and context
- **Complex State Transitions**: Identifies edge cases
- **AI-Enhanced Descriptions**: Top 3 critical/high vulnerabilities get detailed AI analysis
- **Contextual Recommendations**: Tailored fix suggestions

### Compliance & Standards
- **SCSVS v2 Validation**: 50+ security control checks
- **EthTrust Classification**: 5-level security rating
- **Industry Standards**: Built on recognized frameworks

### Reporting & Export
- **PDF Reports**: Professional formatted documents with visualizations
- **JSON Export**: Structured data for CI/CD integration
- **Text Reports**: Plain text for documentation
- **Named Files**: Exports use your contract name

## 📊 Metrics Calculated

- **Security Score**: 0-100 based on vulnerability severity and count
- **Risk Level**: Critical/High/Medium/Low/Secure
- **SCSVS Compliance**: Percentage of passed controls
- **EthTrust Level**: 1-5 security classification (1=Critical, 5=Secure)
- **Vulnerability Distribution**: Count by severity and category
- **Lines of Code**: Code complexity metrics

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 🔐 Security Notes

- API key is stored in `.env.local` (not committed to git)
- All analysis runs server-side for security
- No contract code is stored permanently
- Results are generated on-demand
- AI analysis uses Groq with Llama 3.3 70B model
- Only top 3 critical/high vulnerabilities receive AI enhancement

## 🎨 UI/UX Features

- **Light Theme**: Clean, professional white backgrounds
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion and GSAP for fluid interactions
- **Monaco Editor**: VS Code-quality code editing experience
- **Interactive Charts**: Recharts for data visualization
- **Tab Navigation**: Organized results in 4 sections
- **Real-time Feedback**: Character counter and line numbers
- **Severity Color Coding**: Visual distinction of vulnerability levels

## 🌐 Landing Page Sections

1. **Hero Section**: Main value proposition with animated visuals
2. **Problem Statement**: Why smart contract security matters
3. **Features**: 4-card showcase of core capabilities
4. **How to Use**: 3-step process guide
5. **Security Standards**: SWC, SCSVS v2, EthTrust information
6. **Report Contents**: What's included in downloaded reports
7. **Footer**: Links and resources
s
- Contribute to VSR (Vyper Security Registry) or CSR (Cairo Security Registry)
- Improve AI analysis prompts
- Enhance UI/UX components
- Add more sample contracts in any supported language
- Improve report generation
- Expand documentation
- Add support for new smart contract languages

Contributions welcome! Feel free to:
- Ax] Multi-language support (Solidity, Vyper, Cairo)
- [x] Vyper Security Registry (VSR) with 15 patterns
- [x] Cairo Security Registry (CSR) with 20 patterns
- [x] Automatic language detection
- [ ] GitHub repository integration
- [ ] Analysis mode selector (Static only, Dynamic only, Both)
- [ ] Full AI analysis for all vulnerabilities
- [ ] Historical analysis tracking
- [ ] Comparison reports
- [ ] Custom rule configuration
- [ ] Gas optimization suggestions
- [ ] Formal verification integ
## 🚧 Roadmap
and comprehensive security registries:**
- **SWC Registry** for Solidity
- **VSR (Vyper Security Registry)** for Vyper
- **CSR (Cairo Security Registry)** for Cairo/StarkNet
- **SCSVS v2** and **EthTrust** Standards
- [ ] GitHub repository integration
- [ ] Multi-language support (Vyper, Rust, Move)
- [ ] Analysis mode selector (Static only, Dynamic only, Both)
- [ ] Full AI analysis for all vulnerabilities
- [ ] Historical analysis tracking
- [ ] Comparison reports
- [ ] Custom rule configuration

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Groq AI, SWC Registry, SCSVS v2, and EthTrust Standards**
