import { runExamineMatrix } from './runner.js';
import type { BrowserId, SafetyPolicy } from './types.js';

const [, , url, browser = 'chromium', policy = 'strict'] = process.argv;

if (!url) {
  console.error('Usage: npm run examine -- <url> [browser] [policy]');
  process.exit(1);
}

const report = await runExamineMatrix({
  url,
  browsers: [browser as BrowserId],
  policy: policy as SafetyPolicy,
});

console.log(JSON.stringify(report, null, 2));
