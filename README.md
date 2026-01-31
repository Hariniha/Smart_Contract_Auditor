# 🛡️ SmartAudit AI - AI-Powered Smart Contract Auditor

A comprehensive web application that performs dual-layer security analysis of Solidity smart contracts using static pattern detection and dynamic AI-powered analysis with industry-standard security classifications.

## 🌟 Features

### Dual-Layer Security Analysis
- **Static Analysis**: Fast pattern-based vulnerability detection using SWC Registry and known attack vectors
- **Dynamic Analysis (AI-Powered)**: Advanced AI reasoning to understand complex business logic, state transitions, and edge cases
- **Standards Compliance**: SCSVS v2 framework validation and EthTrust security level assessment
- **Smart Reports**: Comprehensive vulnerability reports with actionable recommendations and risk scoring

### Security Standards
- **SWC Registry**: 35+ Smart Contract Weakness patterns with CWE mappings
- **SCSVS v2**: 50+ Security Verification Standard controls
- **EthTrust**: 5-level security classification system

### Key Features
- ✅ Real-time code analysis with Monaco Editor
- ✅ Comprehensive vulnerability detection with line numbers
- ✅ AI-powered explanations and recommendations (Groq + Llama 3.3)
- ✅ Interactive results dashboard with charts and analytics
- ✅ SCSVS v2 compliance checking
- ✅ EthTrust security level assessment
- ✅ Multiple export formats (PDF, JSON, Text)
- ✅ Sample vulnerable contracts for testing
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
│   ├── swc-registry.ts         # SWC weakness definitions
│   ├── scsvs-v2.ts             # SCSVS v2 controls
│   ├── ethtrust.ts             # EthTrust levels
│   ├── groq-service.ts         # Groq API integration
│   ├── static-analyzer.ts      # Static analysis engine
│   ├── vulnerability-patterns.ts # Detection patterns
│   ├── sample-contracts.ts     # Example contracts
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
35+ weakness patterns including:
- SWC-107: Reentrancy
- SWC-105: Unprotected Ether Withdrawal
- SWC-106: Unprotected SELFDESTRUCT
- SWC-101: Integer Overflow/Underflow
- SWC-115: Authorization through tx.origin
- And 30+ more patterns...

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
- **Level 3**: Medium Risk (Medium issues only)
- **Level 4**: Low Risk (Low severity issues)
- **Level 5**: Secure (No significant vulnerabilities)

## 🎯 How to Use

### Step 1: Upload Your Contract
- **Paste Code**: Directly paste your Solidity code into the editor
- **Upload File**: Upload a `.sol` file from your computer
- **Load Sample**: Test with pre-loaded vulnerable contracts
- **Name Your Contract**: Add a custom name for organized reports

### Step 2: View Dashboard & Results
- Analysis runs automatically and displays comprehensive results
- Interactive dashboard with 4 tabs:
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
- Exact line numbers and code snippets
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
  ]
}
```

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

## 📝 License

MIT License - Feel free to use for your projects

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new vulnerability patterns to detection engine
- Improve AI analysis prompts
- Enhance UI/UX components
- Add more sample contracts
- Improve report generation
- Expand documentation

## 🚧 Roadmap

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
