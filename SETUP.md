# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Monaco Editor
- Groq SDK
- Recharts
- Framer Motion
- And more...

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory and add your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from: [https://console.groq.com](https://console.groq.com)

## Step 3: Start Development Server

```powershell
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Navigate to the Analyzer page
3. Load a sample contract or paste your own
4. Click "Analyze Contract"
5. View comprehensive security analysis results!

## 📋 What's Included

### ✅ Frontend
- Landing page with hero section and features
- Analyzer page with Monaco code editor
- Interactive results dashboard with tabs
- Real-time analysis progress
- Sample contract loader
- Export functionality

### ✅ Backend
- `/api/analyze` - Main analysis endpoint
- Static analysis engine with 35+ patterns
- Groq AI integration for enhanced explanations
- SCSVS v2 compliance checker (50+ controls)
- EthTrust security level calculator

### ✅ Security Standards
- **SWC Registry**: 35+ smart contract weaknesses
- **SCSVS v2**: 50+ security controls
- **EthTrust**: 5-level security classification
- **CWE Mappings**: Industry-standard classifications

### ✅ Features
- Pattern-based vulnerability detection
- AI-powered explanations
- Security score calculation
- Risk level assessment
- Compliance checking
- Interactive charts and visualizations
- Dark mode UI

## 🎯 Usage Examples

### Analyze a Contract
1. Go to Analyzer page
2. Load "Vulnerable Bank (Reentrancy)" sample
3. Click "Analyze Contract"
4. Explore the 4 tabs:
   - Overview (scores, EthTrust level)
   - Vulnerabilities (detailed findings)
   - Security Standards (SCSVS, SWC)
   - Analytics (charts and metrics)

### Try Different Samples
- **Vulnerable Bank**: Reentrancy vulnerability
- **Unprotected Contract**: Missing access controls
- **Integer Overflow**: Old Solidity version issues
- **Secure Token**: Best practices example

## 🐛 Troubleshooting

### If port 3000 is busy:
```powershell
npm run dev -- -p 3001
```

### If dependencies fail to install:
```powershell
npm cache clean --force
npm install
```

### If Monaco Editor doesn't load:
Check your internet connection (Monaco loads from CDN)

## 📊 Expected Results

When you analyze a vulnerable contract, you should see:
- Security score (0-100)
- Risk level classification
- List of vulnerabilities with:
  - Severity badges
  - SWC and CWE classifications
  - Line numbers
  - Code snippets
  - Exploitation scenarios
  - Remediation recommendations
- SCSVS v2 compliance percentage
- EthTrust security level (1-5)
- Interactive charts showing distribution
- Exportable JSON report

## 🎨 UI Features

- Modern dark theme
- Smooth animations
- Responsive design
- Syntax highlighting
- Interactive charts
- Collapsible vulnerability cards
- Tab-based navigation
- Export functionality

## 🔧 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Monaco Editor
- Recharts
- Framer Motion
- Groq AI
- Solidity Parser

## 📝 Next Steps

1. Try analyzing different contract samples
2. Upload your own contracts
3. Explore all 4 result tabs
4. Export analysis reports
5. Check the README.md for detailed documentation

## 🎉 You're All Set!

Your AI-powered smart contract auditor is ready to use. Start securing your smart contracts today!

For detailed documentation, see [README.md](README.md)
