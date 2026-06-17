export type SafetyPolicy = 'strict' | 'balanced' | 'diagnostic';

export type BrowserId =
  | 'chromium'
  | 'chrome'
  | 'edge'
  | 'firefox'
  | 'webkit'
  | 'brave'
  | 'opera'
  | 'vivaldi'
  | 'custom';

export type BrowserCapability = 'native' | 'chromium-custom' | 'approximation' | 'missing';

export interface BrowserTarget {
  id: BrowserId;
  name: string;
  capability: BrowserCapability;
  installed: boolean;
  executablePath?: string;
  notes?: string;
}

export interface ExamineRequest {
  url: string;
  browsers: BrowserId[];
  policy: SafetyPolicy;
  customExecutablePath?: string;
}

export interface NetworkEntry {
  method: string;
  url: string;
  domain: string;
  status?: number;
  resourceType: string;
  size?: number;
  failed?: string;
}

export interface ConsoleEntry {
  level: string;
  text: string;
  location?: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}

export interface RedirectEntry {
  url: string;
  status?: number;
}

export interface StorageSummary {
  cookies: Array<{ name: string; domain: string; path: string; secure: boolean; httpOnly: boolean; sameSite: string }>;
  localStorageKeys: string[];
  sessionStorageKeys: string[];
}

export interface BrowserReport {
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
  redirects: RedirectEntry[];
  network: NetworkEntry[];
  console: ConsoleEntry[];
  storage: StorageSummary;
  warnings: string[];
}

export interface MatrixReport {
  runId: string;
  url: string;
  policy: SafetyPolicy;
  createdAt: string;
  artifactDir: string;
  reports: BrowserReport[];
}
