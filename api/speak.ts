import type { IncomingMessage, ServerResponse } from 'node:http';

const MAX_TEXT_LENGTH = 800;
const CHUNK_LIMIT = 180;

/**
 * Teilt längere Vorlesetexte an Satzgrenzen in Stücke <= CHUNK_LIMIT Zeichen,
 * damit der TTS-Endpunkt jeden Satz sauber und ohne Abschneiden vertont.
 */
export function splitSpeechChunks(text: string, limit = CHUNK_LIMIT): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= limit) return [cleaned];

  const sentences = cleaned.split(/(?<=[.!?…:;])\s+/);
  const chunks: string[] = [];
  let current = '';

  const pushWords = (part: string) => {
    for (const word of part.split(' ')) {
      if (!word) continue;
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= limit) {
        current = candidate;
      } else {
        if (current) chunks.push(current);
        current = word.slice(0, limit);
      }
    }
  };

  for (const sentence of sentences) {
    if (!sentence) continue;
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= limit) {
      current = candidate;
    } else {
      if (current) {
        chunks.push(current);
        current = '';
      }
      if (sentence.length <= limit) {
        current = sentence;
      } else {
        pushWords(sentence);
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function fetchOpenAiTts(text: string, apiKey: string): Promise<Buffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      speed: 0.94,
      response_format: 'mp3',
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI TTS HTTP ${String(response.status)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function fetchGoogleChunk(chunk: string): Promise<Buffer> {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    tl: 'de',
    client: 'gtx',
    ttsspeed: '0.9',
    q: chunk,
  });
  const url = `https://translate.googleapis.com/translate_tts?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    },
  });
  if (!response.ok) {
    throw new Error(`TTS HTTP ${String(response.status)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeGermanSpeech(text: string): Promise<Buffer> {
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return fetchOpenAiTts(text, openAiKey);
  }
  const chunks = splitSpeechChunks(text);
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    buffers.push(await fetchGoogleChunk(chunk));
  }
  return Buffer.concat(buffers);
}

/**
 * Vercel Serverless Function (/api/speak?text=...)
 * Liefert eine warme, deutsche Frauenstimme als MP3 für alle Geräte (iPhone, iPad, Android, Desktop).
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const rawUrl = req.url ?? '/';
  const url = new URL(rawUrl, 'http://localhost');
  const text = (url.searchParams.get('text') ?? '').trim().slice(0, MAX_TEXT_LENGTH);

  if (!text) {
    res.statusCode = 400;
    res.end('Missing text parameter');
    return;
  }

  try {
    const audio = await synthesizeGermanSpeech(text);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', String(audio.byteLength));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    res.end(req.method === 'HEAD' ? undefined : audio);
  } catch {
    res.statusCode = 502;
    res.end('Speech synthesis unavailable');
  }
}
