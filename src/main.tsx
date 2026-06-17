import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FileJson,
  Globe2,
  Loader2,
  Monitor,
  Play,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import './styles.css';

type SafetyPolicy = 'strict' | 'balanced' | 'diagnostic';
type BrowserId = 'chromium' | 'chrome' | 'edge' | 'firefox' | 'webkit' | 'brave' | 'opera' | 'vivaldi' | 'custom';

interface BrowserTarget {
  id: BrowserId;
  name: string;
  capability: 'native' | 'chromium-custom' | 'approximation' | 'missing';
  installed: boolean;
  executablePath?: string;
  notes?: string;
}

interface NetworkEntry {
  method: string;
  url: string;
  domain: string;
  status?: number;
  resourceType: string;
  size?: number;
  failed?: string;
}

interface ConsoleEntry {
  level: string;
  text: string;
  location?: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}

interface BrowserReport {
  browserId: BrowserId;
  browserName: string;
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  initialUrl: string;
  finalUrl?: string;
  title?: string;
  status?: number;
  error?: string;
  screenshot?: string;
  mobileScreenshot?: string;
  redirects: Array<{ url: string; status?: number }>;
  network: NetworkEntry[];
  console: ConsoleEntry[];
  storage: {
    cookies: Array<{ name: string; domain: string; path: string; secure: boolean; httpOnly: boolean; sameSite: string }>;
    localStorageKeys: string[];
    sessionStorageKeys: string[];
  };
  warnings: string[];
}

interface MatrixReport {
  runId: string;
  url: string;
  policy: SafetyPolicy;
  createdAt: string;
  artifactDir: string;
  reports: BrowserReport[];
}

const policyCopy: Record<SafetyPolicy, string> = {
  strict: 'Permissions blocked, downloads disabled, temporary profile.',
  balanced: 'Permissions blocked, downloads quarantined, temporary profile.',
  diagnostic: 'Temporary profile with compatibility-oriented behavior.',
};

function StatusBadge({ report }: { report: BrowserReport }) {
  if (report.ok) {
    return (
      <span className="badge success">
        <CheckCircle2 size={14} /> Complete
      </span>
    );
  }

  return (
    <span className="badge danger">
      <XCircle size={14} /> Failed
    </span>
  );
}

function capabilityLabel(browser: BrowserTarget) {
  if (browser.capability === 'native') return 'Native';
  if (browser.capability === 'chromium-custom') return 'Chromium path';
  if (browser.capability === 'approximation') return 'Approx';
  return 'Missing';
}

function App() {
  const [url, setUrl] = useState('https://example.com');
  const [policy, setPolicy] = useState<SafetyPolicy>('strict');
  const [browsers, setBrowsers] = useState<BrowserTarget[]>([]);
  const [selected, setSelected] = useState<BrowserId[]>(['chromium']);
  const [customPath, setCustomPath] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'console' | 'storage'>('overview');
  const [selectedReportId, setSelectedReportId] = useState<BrowserId>('chromium');
  const [report, setReport] = useState<MatrixReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadBrowsers(path = customPath) {
    const query = path ? `?customPath=${encodeURIComponent(path)}` : '';
    const response = await fetch(`/api/browsers${query}`);
    const data = (await response.json()) as BrowserTarget[];
    setBrowsers(data);
    if (!selected.length) {
      const firstInstalled = data.find((item) => item.installed);
      if (firstInstalled) setSelected([firstInstalled.id]);
    }
  }

  useEffect(() => {
    void loadBrowsers('');
  }, []);

  const selectedReport = useMemo(() => {
    if (!report) return null;
    return report.reports.find((item) => item.browserId === selectedReportId) ?? report.reports[0] ?? null;
  }, [report, selectedReportId]);

  const canRun = selected.length > 0 && /^https?:\/\/.+/i.test(url) && !loading;

  async function runExamine() {
    setError('');
    setLoading(true);
    setReport(null);

    try {
      const response = await fetch('/api/examine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          policy,
          browsers: selected,
          customExecutablePath: customPath || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to run examine.');
      }

      setReport(data as MatrixReport);
      setSelectedReportId((data as MatrixReport).reports[0]?.browserId ?? 'chromium');
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
    } finally {
      setLoading(false);
    }
  }

  function toggleBrowser(id: BrowserId) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <ShieldCheck size={22} />
          <div>
            <h1>Safe Examine Browser</h1>
            <p>Isolated URL inspection across browser engines</p>
          </div>
        </div>
        <div className="top-actions">
          {report ? (
            <>
              <a className="icon-button" href={`/api/runs/${report.runId}/report`} title="Open JSON report" target="_blank" rel="noreferrer">
                <FileJson size={18} />
              </a>
              <a className="button secondary" href={`/api/runs/${report.runId}/export/html`} target="_blank" rel="noreferrer">
                <Download size={16} /> HTML
              </a>
            </>
          ) : null}
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <div className="panel">
            <div className="panel-title">
              <Globe2 size={17} />
              Examine Target
            </div>
            <label className="field-label" htmlFor="url">
              URL
            </label>
            <input id="url" className="text-input" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" />
            <div className="segmented" aria-label="Safety policy">
              {(['strict', 'balanced', 'diagnostic'] as SafetyPolicy[]).map((item) => (
                <button key={item} className={policy === item ? 'active' : ''} onClick={() => setPolicy(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
            <p className="policy-copy">{policyCopy[policy]}</p>
            <button className="button primary run-button" disabled={!canRun} onClick={runExamine} type="button">
              {loading ? <Loader2 className="spin" size={17} /> : <Play size={17} />}
              {loading ? 'Running' : 'Run Examine'}
            </button>
            {error ? (
              <div className="inline-error">
                <AlertTriangle size={16} />
                {error}
              </div>
            ) : null}
          </div>

          <div className="panel">
            <div className="panel-title">
              <Monitor size={17} />
              Browser Matrix
              <button className="icon-button small" onClick={() => loadBrowsers()} title="Refresh browser list" type="button">
                <RefreshCw size={15} />
              </button>
            </div>
            <div className="browser-list">
              {browsers.map((browser) => (
                <label className={`browser-row ${!browser.installed ? 'muted' : ''}`} key={browser.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(browser.id)}
                    onChange={() => toggleBrowser(browser.id)}
                    disabled={!browser.installed && browser.id !== 'custom'}
                  />
                  <span className="browser-name">{browser.name}</span>
                  <span className={`capability ${browser.capability}`}>{capabilityLabel(browser)}</span>
                  {browser.notes ? <span className="browser-note">{browser.notes}</span> : null}
                </label>
              ))}
            </div>
            <label className="field-label" htmlFor="customPath">
              Custom Chromium executable
            </label>
            <input
              id="customPath"
              className="text-input mono"
              value={customPath}
              onChange={(event) => setCustomPath(event.target.value)}
              onBlur={() => loadBrowsers(customPath)}
              placeholder="C:\Program Files\Browser\Application\browser.exe"
            />
          </div>
        </aside>

        <section className="report-area">
          <div className="report-header">
            <div>
              <h2>{report ? 'Examine Report' : 'Ready for Examine'}</h2>
              <p>{report ? `${report.url} · ${report.reports.length} browser run(s)` : 'Run a safe isolated browser session to collect evidence.'}</p>
            </div>
            {report ? <span className="run-id">Run {report.runId.slice(0, 8)}</span> : null}
          </div>

          {loading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={34} />
              <h3>Running isolated sessions</h3>
              <p>Collecting screenshots, network activity, console logs, and storage metadata.</p>
            </div>
          ) : null}

          {!loading && !report ? (
            <div className="empty-state">
              <ClipboardList size={36} />
              <h3>No report yet</h3>
              <p>Select a target URL and browser matrix, then run examine.</p>
            </div>
          ) : null}

          {!loading && report && selectedReport ? (
            <>
              <div className="browser-tabs">
                {report.reports.map((item) => (
                  <button
                    key={item.browserId}
                    className={selectedReport.browserId === item.browserId ? 'active' : ''}
                    onClick={() => setSelectedReportId(item.browserId)}
                    type="button"
                  >
                    {item.browserName}
                    {item.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </button>
                ))}
              </div>

              <div className="report-card">
                <div className="report-card-top">
                  <div>
                    <h3>{selectedReport.browserName}</h3>
                    <p>{selectedReport.title || selectedReport.finalUrl || selectedReport.error}</p>
                  </div>
                  <StatusBadge report={selectedReport} />
                </div>

                <div className="tabbar">
                  {(['overview', 'network', 'console', 'storage'] as const).map((tab) => (
                    <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)} type="button">
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'overview' ? <Overview report={selectedReport} /> : null}
                {activeTab === 'network' ? <NetworkTable rows={selectedReport.network} /> : null}
                {activeTab === 'console' ? <ConsoleTable rows={selectedReport.console} /> : null}
                {activeTab === 'storage' ? <StoragePanel report={selectedReport} /> : null}
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function Overview({ report }: { report: BrowserReport }) {
  return (
    <div className="overview-grid">
      <div className="metrics">
        <Metric label="HTTP Status" value={report.status?.toString() ?? 'N/A'} />
        <Metric label="Requests" value={report.network.length.toString()} />
        <Metric label="Console Issues" value={report.console.length.toString()} />
        <Metric label="Cookies" value={report.storage.cookies.length.toString()} />
      </div>
      {report.error ? (
        <div className="inline-error large">
          <AlertTriangle size={18} />
          {report.error}
        </div>
      ) : null}
      {report.warnings.length ? (
        <div className="warning-list">
          {report.warnings.map((warning) => (
            <div key={warning}>
              <AlertTriangle size={15} />
              {warning}
            </div>
          ))}
        </div>
      ) : null}
      {report.finalUrl ? (
        <a className="final-url" href={report.finalUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={15} />
          {report.finalUrl}
        </a>
      ) : null}
      <div className="screenshots">
        {report.screenshot ? (
          <figure>
            <img src={report.screenshot} alt={`${report.browserName} desktop screenshot`} />
            <figcaption>Desktop screenshot</figcaption>
          </figure>
        ) : null}
        {report.mobileScreenshot ? (
          <figure>
            <img src={report.mobileScreenshot} alt={`${report.browserName} mobile screenshot`} />
            <figcaption>Mobile screenshot</figcaption>
          </figure>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NetworkTable({ rows }: { rows: NetworkEntry[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Status</th>
            <th>Domain</th>
            <th>Type</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.method}-${row.url}`}>
              <td>{row.method}</td>
              <td>{row.failed ? 'Failed' : row.status ?? ''}</td>
              <td>{row.domain}</td>
              <td>{row.resourceType}</td>
              <td className="mono truncate">{row.url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConsoleTable({ rows }: { rows: ConsoleEntry[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Message</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.level}-${index}`}>
              <td>{row.level}</td>
              <td>{row.text}</td>
              <td className="mono truncate">{row.location?.url ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StoragePanel({ report }: { report: BrowserReport }) {
  return (
    <div className="storage-grid">
      <div>
        <h4>Cookies</h4>
        {report.storage.cookies.length ? (
          report.storage.cookies.map((cookie) => (
            <div className="key-row" key={`${cookie.domain}-${cookie.name}`}>
              <span>{cookie.name}</span>
              <code>{cookie.domain}</code>
            </div>
          ))
        ) : (
          <p className="muted-text">No cookies captured.</p>
        )}
      </div>
      <div>
        <h4>Local Storage Keys</h4>
        {report.storage.localStorageKeys.length ? (
          report.storage.localStorageKeys.map((key) => <code className="key-chip" key={key}>{key}</code>)
        ) : (
          <p className="muted-text">No local storage keys.</p>
        )}
      </div>
      <div>
        <h4>Session Storage Keys</h4>
        {report.storage.sessionStorageKeys.length ? (
          report.storage.sessionStorageKeys.map((key) => <code className="key-chip" key={key}>{key}</code>)
        ) : (
          <p className="muted-text">No session storage keys.</p>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
