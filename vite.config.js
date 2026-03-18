import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { generateOpenRouterReply } from './server/openrouter.js';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_MODEL = env.OPENROUTER_MODEL || process.env.OPENROUTER_MODEL;
  process.env.OPENROUTER_SITE_URL = env.OPENROUTER_SITE_URL || process.env.OPENROUTER_SITE_URL;
  process.env.OPENROUTER_SITE_NAME = env.OPENROUTER_SITE_NAME || process.env.OPENROUTER_SITE_NAME;

  return {
    plugins: [
      react(),
      {
        name: 'mindorbit-openai-dev-api',
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
              const message =
                error?.message === 'Missing OPENROUTER_API_KEY'
                  ? 'Missing OPENROUTER_API_KEY. Add it to your environment before running the AI chat.'
                  : error?.status === 401
                    ? 'OpenRouter authentication failed. Check whether your API key is valid.'
                    : error?.status === 429
                      ? 'OpenRouter rate limit or credit limit reached. Check your usage in the OpenRouter dashboard.'
                      : error?.message || 'The AI companion could not respond right now.';
              res.end(
                JSON.stringify({
                  error: message,
                }),
              );
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
