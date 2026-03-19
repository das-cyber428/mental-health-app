import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { generateOpenRouterReply, streamOpenRouterReply } from './server/openrouter.js';
import { getYouTubeMusicByMood, normalizeMood, searchYouTubeMusic } from './server/youtube.js';

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function getErrorMessage(error) {
  if (error?.message === 'Missing OPENROUTER_API_KEY') {
    return 'Missing OPENROUTER_API_KEY. Add it to your environment before running the AI chat.';
  }

  if (error?.status === 401) {
    return 'OpenRouter authentication failed. Check whether your API key is valid.';
  }

  if (error?.status === 429) {
    return 'OpenRouter rate limit or credit limit reached. Check your usage in the OpenRouter dashboard.';
  }

  return error?.message || 'The AI companion could not respond right now.';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_MODEL = env.OPENROUTER_MODEL || process.env.OPENROUTER_MODEL;
  process.env.OPENROUTER_SITE_URL = env.OPENROUTER_SITE_URL || process.env.OPENROUTER_SITE_URL;
  process.env.OPENROUTER_SITE_NAME = env.OPENROUTER_SITE_NAME || process.env.OPENROUTER_SITE_NAME;
  process.env.YOUTUBE_API_KEY = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'MindOrbit Mental Health',
          short_name: 'MindOrbit',
          description: 'An AI-powered mental health companion.',
          theme_color: '#121212',
          background_color: '#121212',
          display: 'standalone',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      }),
      {
        name: 'mindorbit-openrouter-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const { message, messages } = await parseJsonBody(req);

              if (!message || typeof message !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'A message string is required.' }));
                return;
              }

              const reply = await generateOpenRouterReply({ message, messages });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (error) {
              res.statusCode = error?.status || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: getErrorMessage(error) }));
            }
          });

          server.middlewares.use('/api/chat-stream', async (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            try {
              const { message, messages } = await parseJsonBody(req);

              if (!message || typeof message !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'A message string is required.' }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
              res.setHeader('Connection', 'keep-alive');

              const writeSse = (event, payload) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
              };

              const reply = await streamOpenRouterReply({
                message,
                messages,
                onState(value) {
                  writeSse('state', { value });
                },
                onToken(value) {
                  writeSse('token', { value });
                },
              });

              writeSse('done', { value: reply });
              res.end();
            } catch (error) {
              res.statusCode = error?.status || 500;
              res.setHeader('Content-Type', 'text/event-stream');
              res.write(`event: error\n`);
              res.write(`data: ${JSON.stringify({ value: getErrorMessage(error) })}\n\n`);
              res.end();
            }
          });

          server.middlewares.use('/api/music', async (req, res, next) => {
            if (req.method !== 'GET') {
              next();
              return;
            }

            try {
              const requestUrl = new URL(req.url || '', 'http://localhost');
              const mood = normalizeMood(requestUrl.searchParams.get('mood') || 'calm');
              const query = requestUrl.searchParams.get('query') || '';
              const tracks = query.trim()
                ? await searchYouTubeMusic(query, mood)
                : await getYouTubeMusicByMood(mood);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ mood, tracks, query: query || null }));
            } catch (error) {
              res.statusCode = error?.status || 500;
              res.setHeader('Content-Type', 'application/json');
              const message =
                error?.message === 'Missing YOUTUBE_API_KEY'
                  ? 'Missing YOUTUBE_API_KEY. Add it to your environment before loading music.'
                  : error?.status === 403
                    ? 'YouTube API access was denied. Check your API key and quota.'
                    : 'Music recommendations could not load right now.';
              res.end(JSON.stringify({ error: message }));
            }
          });
        },
      },
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('framer-motion')) {
              return 'motion';
            }

            if (id.includes('@react-three/drei')) {
              return 'drei';
            }

            if (id.includes('@react-three/fiber')) {
              return 'fiber';
            }

            if (id.includes('three')) {
              return 'three-core';
            }

            return undefined;
          },
        },
      },
    },
  };
});
