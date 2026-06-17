import cors from 'cors';
import express from 'express';
import { createReadStream, existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { listBrowsers } from './browserRegistry.js';
import { policyDescriptions } from './policy.js';
import { getRunsRoot, runExamineMatrix } from './runner.js';
import type { ExamineRequest } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 4217);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'safe-examine-browser' });
});

app.get('/api/policies', (_req, res) => {
  res.json(policyDescriptions);
});

app.get('/api/browsers', (req, res) => {
  res.json(listBrowsers(typeof req.query.customPath === 'string' ? req.query.customPath : undefined));
});

app.post('/api/examine', async (req, res) => {
  try {
    const body = req.body as ExamineRequest;
    const report = await runExamineMatrix(body);
    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/runs', async (_req, res) => {
  const root = getRunsRoot();
  if (!existsSync(root)) {
    res.json([]);
    return;
  }

  const entries = await readdir(root, { withFileTypes: true });
  res.json(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().reverse());
});

app.get('/api/runs/:runId/report', async (req, res) => {
  try {
    const reportPath = join(getRunsRoot(), req.params.runId, 'report.json');
    res.type('json').send(await readFile(reportPath, 'utf8'));
  } catch {
    res.status(404).json({ error: 'Report not found.' });
  }
});

app.get('/api/runs/:runId/export/html', async (req, res) => {
  try {
    const reportPath = join(getRunsRoot(), req.params.runId, 'report.html');
    res.type('html').send(await readFile(reportPath, 'utf8'));
  } catch {
    res.status(404).json({ error: 'HTML report not found.' });
  }
});

app.get('/api/runs/:runId/artifact/*artifactPath', (req, res) => {
  const rawPath = req.params.artifactPath;
  const artifactPath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  const root = join(getRunsRoot(), req.params.runId);
  const fullPath = normalize(join(root, artifactPath));

  if (!fullPath.startsWith(normalize(root)) || !existsSync(fullPath)) {
    res.status(404).json({ error: 'Artifact not found.' });
    return;
  }

  createReadStream(fullPath).pipe(res);
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Safe Examine Browser API listening on http://127.0.0.1:${port}`);
});
