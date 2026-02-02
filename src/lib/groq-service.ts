// Groq API Integration Service

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface AIAnalysisRequest {
  contractCode: string;
  issueType?: string;
  lineNumber?: number;
  context?: string;
}

export interface AIAnalysisResponse {
  explanation: string;
  exploitationScenario: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  recommendation: string;
  cweClassification?: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export async function analyzeWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const prompt = constructAnalysisPrompt(request);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert smart contract security auditor specializing in Solidity vulnerabilities. 
Your task is to analyze smart contract code for security vulnerabilities and provide detailed, actionable insights.
Always respond in valid JSON format with the following structure:
{
  "explanation": "Clear explanation of the vulnerability",
  "exploitationScenario": "How an attacker could exploit this",
  "severity": "Critical|High|Medium|Low|Info",
  "recommendation": "Specific fix recommendations",
  "cweClassification": "CWE-XXX if applicable",
  "confidence": "High|Medium|Low"
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(responseText);

    return {
      explanation: analysis.explanation || 'No explanation provided',
      exploitationScenario: analysis.exploitationScenario || 'No exploitation scenario provided',
      severity: analysis.severity || 'Medium',
      recommendation: analysis.recommendation || 'No recommendation provided',
      cweClassification: analysis.cweClassification,
      confidence: analysis.confidence || 'Medium'
    };
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return {
      explanation: 'AI analysis unavailable',
      exploitationScenario: 'Unable to generate exploitation scenario',
      severity: 'Medium',
      recommendation: 'Manual review recommended',
      confidence: 'Low'
    };
  }
}

function constructAnalysisPrompt(request: AIAnalysisRequest): string {
  let prompt = `Analyze this Solidity smart contract for security vulnerabilities:\n\n`;
  prompt += `Contract Code:\n\`\`\`solidity\n${request.contractCode}\n\`\`\`\n\n`;

  if (request.issueType) {
    prompt += `Detected Issue Type: ${request.issueType}\n`;
  }

  if (request.lineNumber) {
    prompt += `Location: Line ${request.lineNumber}\n`;
  }

  if (request.context) {
    prompt += `Additional Context: ${request.context}\n`;
  }

  prompt += `\nProvide a comprehensive security analysis including:
1. Clear explanation of any vulnerabilities found
2. Realistic exploitation scenarios
3. Accurate severity rating (Critical/High/Medium/Low/Info)
4. Specific, actionable recommendations for fixes
5. Relevant CWE classification if applicable
6. Your confidence level in this assessment

Respond in JSON format only.`;

  return prompt;
}

export async function getContractOverview(contractCode: string): Promise<{
  summary: string;
  mainFindings: string[];
  riskAssessment: string;
}> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a smart contract security auditor. Provide a high-level overview in JSON format.'
        },
        {
          role: 'user',
          content: `Provide a high-level security overview of this smart contract:\n\n\`\`\`solidity\n${contractCode}\n\`\`\`\n\nReturn JSON with: summary, mainFindings (array), riskAssessment`
        }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      summary: result.summary || 'No summary available',
      mainFindings: result.mainFindings || [],
      riskAssessment: result.riskAssessment || 'Unable to assess risk'
    };
  } catch (error) {
    console.error('Error getting contract overview:', error);
    return {
      summary: 'Overview unavailable',
      mainFindings: [],
      riskAssessment: 'Manual review required'
    };
  }
}

export async function enhanceVulnerabilityDescription(
  vulnerability: {
    name: string;
    type: string;
    codeSnippet: string;
    lineNumber: number;
  }
): Promise<{
  enhancedDescription: string;
  exploitationScenario: string;
  recommendation: string;
}> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a smart contract security expert. Enhance vulnerability descriptions with clear, actionable insights. Return JSON only.'
        },
        {
          role: 'user',
          content: `Enhance this vulnerability report:
          
Vulnerability: ${vulnerability.name}
Type: ${vulnerability.type}
Line: ${vulnerability.lineNumber}
Code: ${vulnerability.codeSnippet}

Provide JSON with: enhancedDescription, exploitationScenario, recommendation`
        }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      enhancedDescription: result.enhancedDescription || vulnerability.name,
      exploitationScenario: result.exploitationScenario || 'See documentation',
      recommendation: result.recommendation || 'Review and fix'
    };
  } catch (error) {
    console.error('Error enhancing vulnerability:', error);
    return {
      enhancedDescription: vulnerability.name,
      exploitationScenario: 'Exploitation details unavailable',
      recommendation: 'Manual review recommended'
    };
  }
}
