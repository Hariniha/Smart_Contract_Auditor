import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SEVERITY_WEIGHTS } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateSecurityScore(vulnerabilities: {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}): number {
  const deduction =
    vulnerabilities.critical * SEVERITY_WEIGHTS.Critical +
    vulnerabilities.high * SEVERITY_WEIGHTS.High +
    vulnerabilities.medium * SEVERITY_WEIGHTS.Medium +
    vulnerabilities.low * SEVERITY_WEIGHTS.Low;

  const score = Math.max(0, 100 - deduction);
  return Math.round(score);
}

export function getRiskLevel(score: number): 'Critical' | 'High' | 'Medium' | 'Low' | 'Secure' {
  if (score < 30) return 'Critical';
  if (score < 50) return 'High';
  if (score < 70) return 'Medium';
  if (score < 90) return 'Low';
  return 'Secure';
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Critical: 'text-red-600 bg-red-50 border-red-200',
    High: 'text-orange-600 bg-orange-50 border-orange-200',
    Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    Low: 'text-blue-600 bg-blue-50 border-blue-200',
    Info: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  return colors[severity] || colors.Info;
}

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
