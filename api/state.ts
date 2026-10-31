import { readFile, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { get, put } from '@vercel/blob';

const BLOB_PATH = 'state/schatzinsel-v2.json';
const LOCAL_FILE = '/tmp/schatzinsel-cloud-state.json';
const MAX_BODY_BYTES = 512 * 1024;

interface StoredPayload {
  state: unknown;
  updatedAt: number;
}

function hasProfiles(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;
  const profiles = (state as { profiles?: unknown }).profiles;
  return Array.isArray(profiles) && profiles.length > 0;
}

function isValidEnvelope(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;
  const obj = state as { version?: unknown; profiles?: unknown; setupDone?: unknown };
  return obj.version === 2 && Array.isArray(obj.profiles) && typeof obj.setupDone === 'boolean';
}

async function readCloud(): Promise<StoredPayload | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const result = await get(BLOB_PATH, { access: 'private', useCache: false });
      if (result?.statusCode !== 200) return null;
      const text = await new Response(result.stream).text();
      return JSON.parse(text) as StoredPayload;
    } catch {
      return null;
    }
  }
  try {
    const text = await readFile(LOCAL_FILE, 'utf8');
    return JSON.parse(text) as StoredPayload;
  } catch {
    return null;
  }
}

async function writeCloud(payload: StoredPayload): Promise<void> {
  const json = JSON.stringify(payload);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(BLOB_PATH, json, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return;
  }
  await writeFile(LOCAL_FILE, json, 'utf8');
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    total += buf.length;
    if (total > MAX_BODY_BYTES) throw new Error('Body too large');
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? (JSON.parse(raw) as unknown) : null;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const data = Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': String(data.length),
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

/**
 * Vercel Serverless Function `/api/state`:
 * - GET lädt den geräteübergreifend gespeicherten Spielstand.
 * - PUT speichert den aktualisierten Spielstand in Vercel Blob (bzw. lokal unter /tmp).
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'GET') {
    const stored = await readCloud();
    sendJson(res, 200, {
      state: stored?.state ?? null,
      updatedAt: stored?.updatedAt ?? 0,
    });
    return;
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (typeof body !== 'object' || body === null) {
        sendJson(res, 400, { error: 'Invalid payload' });
        return;
      }
      const { state, overwrite } = body as { state?: unknown; overwrite?: unknown };
      if (!isValidEnvelope(state)) {
        sendJson(res, 400, { error: 'Invalid state format' });
        return;
      }

      // Schutz: Ein leerer Browser darf ohne explizites overwrite nie vorhandene Kinder überschreiben.
      if (overwrite !== true && !hasProfiles(state)) {
        const existing = await readCloud();
        if (existing && hasProfiles(existing.state)) {
          sendJson(res, 200, existing);
          return;
        }
      }

      const payload: StoredPayload = { state, updatedAt: Date.now() };
      await writeCloud(payload);
      sendJson(res, 200, payload);
    } catch {
      sendJson(res, 500, { error: 'Failed to store state' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method Not Allowed' });
}
