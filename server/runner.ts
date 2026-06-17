import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, firefox, webkit, type Browser, type BrowserContext } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { listBrowsers } from './browserRegistry.js';
import { getUrlWarnings, shouldBlockDownload, validateUrl } from './policy.js';
import type { BrowserReport, BrowserTarget, ConsoleEntry, ExamineRequest, MatrixReport, NetworkEntry } from './types.js';

const runsRoot = join(process.cwd(), 'runs');

function nowIso() {
  return new Date().toISOString();
}

function toPublicArtifactPath(runId: string, fileName: string) {
  return `/api/runs/${runId}/artifact/${fileName}`;
}

function getDomain(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return '';
  }
}

async function launchBrowser(target: BrowserTarget): Promise<Browser> {
  if (target.id === 'firefox') {
    return firefox.launch({ headless: true, executablePath: target.executablePath });
  }

  if (target.id === 'webkit') {
    return webkit.launch({ headless: true });
  }

  if (target.id === 'chrome') {
    return target.executablePath
      ? chromium.launch({ headless: true, executablePath: target.executablePath })
      : chromium.launch({ headless: true, channel: 'chrome' });
  }

  if (target.id === 'edge') {
    return target.executablePath
      ? chromium.launch({ headless: true, executablePath: target.executablePath })
      : chromium.launch({ headless: true, channel: 'msedge' });
  }

  if (target.id === 'chromium') {
    return chromium.launch({ headless: true });
  }

  if (target.executablePath) {
    return chromium.launch({ headless: true, executablePath: target.executablePath });
  }

  throw new Error(`${target.name} is not available. Add a custom executable path or select another browser.`);
}

async function summarizeStorage(context: BrowserContext, pageUrl: string) {
  const cookies = await context.cookies();
  const page = context.pages()[0];
  let localStorageKeys: string[] = [];
  let sessionStorageKeys: string[] = [];

  if (page && pageUrl.startsWith('http')) {
    try {
      localStorageKeys = await page.evaluate(() => Object.keys(window.localStorage));
      sessionStorageKeys = await page.evaluate(() => Object.keys(window.sessionStorage));
    } catch {
      localStorageKeys = [];
      sessionStorageKeys = [];
    }
  }

  return {
    cookies: cookies.map((cookie) => ({
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
    })),
    localStorageKeys,
    sessionStorageKeys,
  };
}

async function examineBrowser(runId: string, target: BrowserTarget, request: ExamineRequest, runDir: string): Promise<BrowserReport> {
  const startedAt = nowIso();
  const warnings = getUrlWarnings(validateUrl(request.url));
  const network = new Map<string, NetworkEntry>();
  const consoleEntries: ConsoleEntry[] = [];
  const redirects: Array<{ url: string; status?: number }> = [];
  const browserDir = join(runDir, target.id);

  await mkdir(browserDir, { recursive: true });

  let browser: Browser | undefined;

  try {
    browser = await launchBrowser(target);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      acceptDownloads: !shouldBlockDownload(request.policy),
      javaScriptEnabled: true,
      ignoreHTTPSErrors: false,
      permissions: [],
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });

    await context.clearPermissions();

    const page = await context.newPage();

    context.on('page', async (popup) => {
      if (popup === page || !popup.opener()) return;
      warnings.push(`Popup opened and was closed: ${popup.url() || 'about:blank'}`);
      await popup.close().catch(() => undefined);
    });

    page.on('console', (message) => {
      const location = message.location();
      consoleEntries.push({
        level: message.type(),
        text: message.text(),
        location: {
          url: location.url,
          lineNumber: location.lineNumber,
          columnNumber: location.columnNumber,
        },
      });
    });

    page.on('request', (req) => {
      network.set(req.url(), {
        method: req.method(),
        url: req.url(),
        domain: getDomain(req.url()),
        resourceType: req.resourceType(),
      });
    });

    page.on('requestfailed', (req) => {
      const entry = network.get(req.url());
      if (entry) {
        entry.failed = req.failure()?.errorText;
      }
    });

    page.on('response', async (res) => {
      const req = res.request();
      const entry = network.get(req.url());
      const headers: Record<string, string> = await res.allHeaders().catch(() => ({}));
      const size = Number(headers['content-length']);
      const status = res.status();

      if (entry) {
        entry.status = status;
        entry.size = Number.isFinite(size) ? size : undefined;
      }

      if (req.isNavigationRequest() && status >= 300 && status < 400) {
        redirects.push({ url: res.url(), status });
      }
    });

    const response = await page.goto(request.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {
      warnings.push('Network did not become idle within 8 seconds.');
    });

    const finalUrl = page.url();
    const title = await page.title().catch(() => '');
    const screenshotFile = `${target.id}-desktop.png`;
    const mobileScreenshotFile = `${target.id}-mobile.png`;

    await page.screenshot({ path: join(browserDir, screenshotFile), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(browserDir, mobileScreenshotFile), fullPage: true });

    const storage = await summarizeStorage(context, finalUrl);

    const report: BrowserReport = {
      browserId: target.id,
      browserName: target.name,
      ok: true,
      startedAt,
      finishedAt: nowIso(),
      initialUrl: request.url,
      finalUrl,
      title,
      status: response?.status(),
      screenshot: toPublicArtifactPath(runId, `${target.id}/${screenshotFile}`),
      mobileScreenshot: toPublicArtifactPath(runId, `${target.id}/${mobileScreenshotFile}`),
      redirects,
      network: Array.from(network.values()).slice(0, 500),
      console: consoleEntries.slice(0, 500),
      storage,
      warnings,
    };

    await writeFile(join(browserDir, 'report.json'), JSON.stringify(report, null, 2));
    await context.close();
    return report;
  } catch (error) {
    const report: BrowserReport = {
      browserId: target.id,
      browserName: target.name,
      ok: false,
      startedAt,
      finishedAt: nowIso(),
      initialUrl: request.url,
      error: error instanceof Error ? error.message : String(error),
      redirects,
      network: Array.from(network.values()).slice(0, 500),
      console: consoleEntries.slice(0, 500),
      storage: { cookies: [], localStorageKeys: [], sessionStorageKeys: [] },
      warnings,
    };
    await writeFile(join(browserDir, 'report.json'), JSON.stringify(report, null, 2));
    return report;
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

export async function runExamineMatrix(request: ExamineRequest): Promise<MatrixReport> {
  const validatedUrl = validateUrl(request.url);
  const runId = uuidv4();
  const runDir = join(runsRoot, runId);
  await mkdir(runDir, { recursive: true });

  const targets = listBrowsers(request.customExecutablePath).filter((browser) => request.browsers.includes(browser.id));
  if (targets.length === 0) {
    throw new Error('Select at least one browser.');
  }

  const reports: BrowserReport[] = [];
  for (const target of targets) {
    reports.push(await examineBrowser(runId, target, { ...request, url: validatedUrl.toString() }, runDir));
  }

  const matrixReport: MatrixReport = {
    runId,
    url: validatedUrl.toString(),
    policy: request.policy,
    createdAt: nowIso(),
    artifactDir: runDir,
    reports,
  };

  await writeFile(join(runDir, 'report.json'), JSON.stringify(matrixReport, null, 2));
  await writeFile(join(runDir, 'report.html'), renderHtmlReport(matrixReport));
  return matrixReport;
}

export function getRunsRoot() {
  return runsRoot;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

export function renderHtmlReport(report: MatrixReport) {
  const rows = report.reports
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.browserName)}</td>
        <td>${item.ok ? 'Complete' : 'Failed'}</td>
        <td>${item.status ?? ''}</td>
        <td>${escapeHtml(item.finalUrl ?? item.error ?? '')}</td>
        <td>${item.network.length}</td>
        <td>${item.console.filter((entry) => entry.level === 'error').length}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Safe Examine Report ${escapeHtml(report.runId)}</title>
      <style>
        body { font-family: Inter, Segoe UI, sans-serif; margin: 32px; color: #151a22; background: #f7f8fa; }
        table { border-collapse: collapse; width: 100%; background: white; }
        th, td { border: 1px solid #d7dde5; padding: 10px; text-align: left; vertical-align: top; }
        th { background: #eef1f5; }
        code { font-family: Consolas, monospace; }
      </style>
    </head>
    <body>
      <h1>Safe Examine Report</h1>
      <p><strong>URL:</strong> <code>${escapeHtml(report.url)}</code></p>
      <p><strong>Run:</strong> <code>${escapeHtml(report.runId)}</code></p>
      <p><strong>Policy:</strong> ${escapeHtml(report.policy)}</p>
      <table>
        <thead><tr><th>Browser</th><th>Status</th><th>HTTP</th><th>Final URL / Error</th><th>Requests</th><th>Console Errors</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
  </html>`;
}
