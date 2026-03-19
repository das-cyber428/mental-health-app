import { streamOpenRouterReply } from '../server/openrouter.js';

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, messages } = req.body || {};

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'A message string is required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const reply = await streamOpenRouterReply({
      message,
      messages,
      onState(value) {
        writeSse(res, 'state', { value });
      },
      onToken(value) {
        writeSse(res, 'token', { value });
      },
    });

    writeSse(res, 'done', { value: reply });
    res.end();
  } catch (error) {
    const status = error?.status || 500;
    res.statusCode = status;
    writeSse(
      res,
      'error',
      {
        value:
          status === 401
            ? 'OpenRouter authentication failed. Check whether your API key is valid.'
            : status === 429
              ? 'OpenRouter rate limit or credit limit reached. Check your usage in the OpenRouter dashboard.'
              : 'The AI companion could not respond right now.',
      },
    );
    res.end();
  }
}
