import type { SafetyPolicy } from './types.js';

export const policyDescriptions: Record<SafetyPolicy, string> = {
  strict: 'Blocks sensitive permissions, disables downloads, and uses a fresh temporary browser context.',
  balanced: 'Blocks sensitive permissions and keeps downloads quarantined in the run artifact folder.',
  diagnostic: 'Uses an isolated profile with fewer blocks for compatibility diagnostics.',
};

export function validateUrl(input: string): URL {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http:// and https:// URLs can be examined.');
  }
  return url;
}

export function getUrlWarnings(url: URL): string[] {
  const host = url.hostname.toLowerCase();
  const warnings: string[] = [];

  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    warnings.push('Target is a local address. Make sure this is intentional.');
  }

  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    warnings.push('Target appears to be a private network address.');
  }

  if (url.protocol === 'http:') {
    warnings.push('Target uses HTTP without transport encryption.');
  }

  return warnings;
}

export function shouldBlockDownload(policy: SafetyPolicy): boolean {
  return policy === 'strict';
}
