# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-17

### Added

- **Cross-browser examination matrix**: Run URL inspection across Chromium, Chrome, Edge, Firefox, WebKit, Brave, Opera, Vivaldi, and custom Chromium-based browsers in a single pass.
- **Sandboxed browser sessions**: Every examine run uses isolated browser contexts with temporary profiles. No cookies, cache, or credentials leak between runs or affect the host browser.
- **Safety policy presets**: Three levels of isolation -- Strict (all permissions blocked, downloads disabled), Balanced (sensitive permissions blocked, downloads quarantined), and Diagnostic (minimal blocking for QA).
- **Desktop and mobile screenshots**: Full-page capture at 1440x960 and 390x844 viewports per browser.
- **Network activity log**: Request method, URL, domain, HTTP status, resource type, and content size for all page requests.
- **Console log capture**: Console messages with level, text, and source location for each browser session.
- **Storage inspection**: Cookie enumeration (name, domain, path, flags), localStorage keys, and sessionStorage keys.
- **Redirect chain mapping**: Tracks navigation redirects with status codes from initial URL through final destination.
- **URL validation and warnings**: Built-in checks for localhost, private network addresses, and unencrypted HTTP with user-facing warnings.
- **Report export**: JSON for programmatic processing and HTML for visual review and sharing.
- **Built-in web UI**: React + Vite frontend with URL input, browser matrix selector, policy picker, and tabbed report viewer (Overview, Network, Console, Storage).
- **CLI mode**: Headless examination from terminal via `npm run examine -- <url> [browser] [policy]`.
- **Browser auto-detection**: Scans standard installation paths for Chrome, Edge, Firefox, Brave, Opera, and Vivaldi on Windows.
- **Custom executable path**: Support for any Chromium-based browser not detected automatically.
- **Responsive layout**: Two-column workbench on desktop collapses to single column on mobile.
- **API server**: Express-based REST API on port 4217 with health check, browser listing, examine execution, and artifact serving.
- **GitHub Pages landing page**: Project overview and documentation site deployed via CI/CD.
- **Automated release workflow**: GitHub Actions pipeline that creates releases from version bumps and deploys GitHub Pages on push to main.
- **Sponsorship configuration**: GitHub Sponsors link for project support.

### Technical

- Runtime: Node.js 22+ with TypeScript 6
- Automation: Playwright 1.61 with Chromium, Firefox, and WebKit support
- Frontend: React 19 + Vite 8 with lucide-react icons
- Styling: Custom CSS with design system (neutral palette, status colors, responsive grid)
- API: Express 5 with CORS support
- Development: Concurrent server/client startup via concurrently and tsx watch
