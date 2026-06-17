# Contributing to Safe Examine Browser

Thank you for considering contributing. This project aims to make URL investigation safer and more thorough, and every contribution helps.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development](#development)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Browser Support Contributions](#browser-support-contributions)
- [Security Issues](#security-issues)

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/<your-username>/seb.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Install Playwright browsers: `npx playwright install chromium`
6. Make your changes.
7. Test: `npm run check` (TypeScript validation)
8. Commit and push, then open a pull request.

## Development

### Project Layout

```
src/        React frontend
server/     Express API and Playwright runner
docs/       GitHub Pages and screenshots
```

### Running Locally

```bash
npm run dev
```

This starts both the Express API server (port 4217) and the Vite dev server (port 5173) concurrently.

### TypeScript

```bash
npm run check
```

Run type checking before committing. The project uses TypeScript 6 with strict mode.

### Adding a Browser

Browser detection lives in `server/browserRegistry.ts`. To add a new browser:

1. Add the browser ID to the `BrowserId` type in `server/types.ts`.
2. Add executable path candidates in `browserRegistry.ts`.
3. Add launch logic in `runner.ts` if the browser requires special handling.
4. Add display label in the labels map.

## Pull Request Guidelines

1. Keep changes focused. One pull request per feature or fix.
2. Update the CHANGELOG.md if your change is user-facing.
3. Run `npm run check` and confirm no TypeScript errors.
4. Update or add inline documentation for new modules or functions.
5. If adding a screenshot or visual change, include a before/after if possible.
6. Reference any related issues in the pull request description.

### Pull Request Template

When opening a pull request, please include:

- A clear description of what the change does
- Motivation for the change
- Testing steps (how to verify the change works)
- Screenshots for UI changes
- Any related issue numbers

## Reporting Bugs

Open an issue at https://github.com/cybersafetyid/seb/issues and include:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected behavior and what actually happened
- Browser and OS versions
- Node.js version (`node --version`)
- Screenshots if applicable
- Run ID from the report if available

## Suggesting Features

Open an issue with the label "enhancement" and describe:

- What problem the feature solves
- How you envision it working
- Any prior art or references

## Browser Support Contributions

Browser detection and automation is a core area where contributions are especially valuable. If you are adding support for a browser on a platform not currently covered (macOS, Linux), please include:

- Installation paths for each platform
- Automation flags required
- Any limitations or known issues

## Security Issues

Do not open a public issue for security vulnerabilities. Follow the disclosure guidelines in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
