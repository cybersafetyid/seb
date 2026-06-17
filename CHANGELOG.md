# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-06-17

### Fixed

- Sidebar `<nav>` styling conflict with top navigation. Changed top nav to `<header>` element so sidebar nav links no longer inherit 64px height and border-bottom.
- Active nav indicator changed from `border-right` (clashing with sidebar divider) to `border-left` with proper spacing.
- Page width inconsistency between landing page (960px) and documentation pages (1200px). Unified to single 1200px `wrap` class across all pages.
- Landing page now uses shared `style.css` instead of duplicating styles inline.

### Added

- GitHub Pages 404 fallback page with navigation links.
- All guide pages now use absolute `/seb/` paths for link consistency.

## [1.1.0] - 2026-06-17

### Added

- Comprehensive documentation site under `docs/guide/` with seven pages:
  - Quick Start guide with installation steps and first-run walkthrough
  - Features reference covering all capabilities
  - API Reference documenting all REST endpoints with examples
  - Report Format specification with full data structure details
  - CLI Usage guide with examples and argument reference
  - Safety Policies comparison and detailed descriptions
  - FAQ answering common questions
- Shared CSS stylesheet for consistent documentation presentation
- Custom 404 page for GitHub Pages with navigation links
- `<base href="/seb/" />` tag on all pages for correct asset path resolution
- Navigation links from landing page to documentation guide and API reference

### Changed

- Landing page navigation updated with links to Quick Start, Guide, and API docs
- Landing page hero buttons updated: replaced "Documentation" with "Quick Start"

### Infrastructure

- Release workflow extended to support branch trigger for both main and master
- Changelog entries now automatically populate GitHub release body
- Repo description, homepage URL, and 9 repository topics configured

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
- **Automated release workflow**: GitHub Actions pipeline that creates releases from version bumps and deploys GitHub Pages on push.
- **Sponsorship configuration**: GitHub Sponsors link for project support.
- **README badges**: Release, license, CI status, contributors, stars, and sponsor badges.
- **Community files**: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, PULL_REQUEST_TEMPLATE.md.

### Technical

- Runtime: Node.js 22+ with TypeScript 6
- Automation: Playwright 1.61 with Chromium, Firefox, and WebKit support
- Frontend: React 19 + Vite 8 with lucide-react icons
- Styling: Custom CSS with design system (neutral palette, status colors, responsive grid)
- API: Express 5 with CORS support
- Development: Concurrent server/client startup via concurrently and tsx watch
