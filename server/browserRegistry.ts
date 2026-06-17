import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import type { BrowserId, BrowserTarget } from './types.js';

const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files';
const programFilesX86 = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';
const localAppData = process.env.LOCALAPPDATA ?? '';

const candidates: Record<BrowserId, string[]> = {
  chromium: [],
  chrome: [
    join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
    join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
    join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
  ],
  edge: [
    join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
    join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
  ],
  firefox: [
    join(programFiles, 'Mozilla Firefox\\firefox.exe'),
    join(programFilesX86, 'Mozilla Firefox\\firefox.exe'),
  ],
  webkit: [],
  brave: [
    join(programFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    join(programFilesX86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
    join(localAppData, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  ],
  opera: [
    join(localAppData, 'Programs\\Opera\\opera.exe'),
    join(localAppData, 'Programs\\Opera GX\\opera.exe'),
  ],
  vivaldi: [
    join(localAppData, 'Vivaldi\\Application\\vivaldi.exe'),
    join(programFiles, 'Vivaldi\\Application\\vivaldi.exe'),
  ],
  custom: [],
};

const labels: Record<BrowserId, string> = {
  chromium: 'Bundled Chromium',
  chrome: 'Google Chrome',
  edge: 'Microsoft Edge',
  firefox: 'Firefox',
  webkit: 'WebKit',
  brave: 'Brave',
  opera: 'Opera',
  vivaldi: 'Vivaldi',
  custom: 'Custom Chromium Path',
};

export function listBrowsers(customExecutablePath?: string): BrowserTarget[] {
  const ids: BrowserId[] = ['chromium', 'chrome', 'edge', 'firefox', 'webkit', 'brave', 'opera', 'vivaldi', 'custom'];

  return ids.map((id) => {
    if (id === 'chromium') {
      const executablePath = chromium.executablePath();
      const installed = existsSync(executablePath);
      return {
        id,
        name: labels[id],
        capability: installed ? 'native' : 'missing',
        installed,
        executablePath,
        notes: installed ? 'Bundled by Playwright.' : 'Run npx playwright install chromium.',
      };
    }

    if (id === 'firefox') {
      const executablePath = firefox.executablePath();
      const installed = existsSync(executablePath);
      return {
        id,
        name: labels[id],
        capability: installed ? 'native' : 'missing',
        installed,
        executablePath,
        notes: installed ? 'Bundled by Playwright.' : 'Run npx playwright install firefox.',
      };
    }

    if (id === 'webkit') {
      const executablePath = webkit.executablePath();
      const installed = existsSync(executablePath);
      return {
        id,
        name: labels[id],
        capability: installed ? 'approximation' : 'missing',
        installed,
        executablePath,
        notes: installed ? 'WebKit approximation, not native Safari on Windows.' : 'Run npx playwright install webkit.',
      };
    }

    if (id === 'custom') {
      const installed = Boolean(customExecutablePath && existsSync(customExecutablePath));
      return {
        id,
        name: labels[id],
        capability: installed ? 'chromium-custom' : 'missing',
        installed,
        executablePath: customExecutablePath,
        notes: 'Use for Chromium-based browsers that are not auto-detected.',
      };
    }

    const executablePath = candidates[id].find((path) => existsSync(path));
    const isNative = id === 'chrome' || id === 'edge';

    return {
      id,
      name: labels[id],
      capability: executablePath ? (isNative ? 'native' : 'chromium-custom') : 'missing',
      installed: Boolean(executablePath),
      executablePath,
      notes: executablePath ? undefined : 'Not found in common install locations.',
    };
  });
}
