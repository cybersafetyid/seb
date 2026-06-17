# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x | Yes |

## Reporting a Vulnerability

This tool is designed for safe URL investigation. If you discover a security
vulnerability in Safe Examine Browser itself, please report it privately.

Do not open a public GitHub issue for security vulnerabilities.

To report a vulnerability, contact the maintainer directly via the security
advisory process at:

https://github.com/cybersafetyid/seb/security/advisories/new

You can also reach out via the GitHub Sponsors profile.

### What to include

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Any potential impact or exploit scenario

### Response timeline

You will receive an acknowledgment within 72 hours. The maintainer will
investigate and provide updates as the assessment progresses.

## Scope

This security policy covers the Safe Examine Browser codebase, including:

- Server-side API and Playwright runner
- Client-side React UI
- Build and deployment tooling
- Documentation and website

Vulnerabilities in dependencies (Playwright, Express, React, etc.) should be
reported to those projects directly.

## Safe Use

Safe Examine Browser is a security tool. Please use it responsibly:

- Only examine URLs you have authorization to inspect.
- This tool is for defensive security research, evidence collection,
  and quality assurance.
- Do not use this tool to bypass security controls, probe systems without
  authorization, or otherwise engage in unauthorized activity.

The tool includes built-in safety measures (sandboxed profiles, permission
blocking, download quarantining), but no tool can guarantee complete isolation
against all threats. Exercise judgment when examining untrusted URLs.
