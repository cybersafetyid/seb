# Safe Examine Browser

Isolated multi-browser URL inspection toolkit for security analysts, QA engineers, and developers. Opens URLs in sandboxed browser sessions, captures evidence, and generates reports across Chrome, Firefox, Edge, Brave, Opera, Vivaldi, and WebKit.

## Why This Exists

When you need to examine a URL -- a suspicious link, a redirect chain, a page that behaves differently per browser -- you do not want to use your personal browser profile. Cookies, cached credentials, extensions, and session data contaminate the result, and opening a risky link in a primary profile is unnecessary exposure.

This tool gives you a clean room per URL: temporary profiles, blocked permissions, quarantined downloads, and a full audit trail across multiple browser engines in one run.

## What It Does

- Opens a URL across any combination of installed browsers
- Captures desktop and mobile screenshots
- Records network activity (method, status, domain, size)
- Logs console errors, warnings, and info messages
- Inspects cookies, localStorage, and sessionStorage
- Maps redirect chains
- Applies safety policies (strict, balanced, diagnostic)
- Exports reports as JSON or HTML

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
npx playwright install firefox     # optional
npx playwright install webkit      # optional

# Start the application (UI + API server)
npm run dev
```

Open http://localhost:5173 in your browser, enter a URL, select browsers, and run examine.

### CLI mode

```bash
npm run examine -- https://example.com chromium strict
```

## Safety Policies

| Policy     | Permissions | Downloads | Profile |
|------------|-------------|-----------|---------|
| Strict     | All blocked | Disabled  | Temporary |
| Balanced   | Sensitive blocked | Quarantined | Temporary |
| Diagnostic | Minimal blocking | Allowed  | Temporary |

## Browser Support

| Browser   | Detection method |
|-----------|-----------------|
| Chromium  | Playwright bundled |
| Chrome    | Channel or executable path |
| Edge      | Channel or executable path |
| Firefox   | Playwright bundled |
| WebKit    | Playwright approximation |
| Brave     | Executable path detection |
| Opera     | Executable path detection |
| Vivaldi   | Executable path detection |
| Custom    | User-provided executable path |

## Project Structure

```
src/              React UI (Vite)
server/           API and Playwright runner
  index.ts        Express server
  runner.ts       Browser orchestration and evidence capture
  browserRegistry.ts  Auto-detection of installed browsers
  policy.ts       Safety policy definitions
  types.ts        TypeScript interfaces
runs/             Run artifacts (gitignored)
```

## Use Cases

- Investigate a suspicious link without risking your primary browser profile
- Compare how different browsers render and behave on the same URL
- Collect evidence of redirect chains, third-party requests, and console errors
- Verify that a page works across browser engines before deployment
- Generate shareable reports for bug reproduction or audit trails

## Export and Reports

Each run produces a JSON report with full telemetry and an HTML summary page. Artifacts live in `runs/<run-id>/` and include screenshots per browser.

## License

ISC

## Contributing

Issues and pull requests welcome. This is a security-adjacent tool, so responsible disclosure practices apply.
