import { generateOpenRouterReply } from '../server/openrouter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, messages } = req.body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A message string is required.' });
      return;
    }

    const reply = await generateOpenRouterReply({ message, messages });
    res.status(200).json({ reply });
  } catch (error) {
    const status = error?.status || 500;
    const fallbackMessage =
      status === 401
        ? 'OpenRouter authentication failed. Check whether your API key is valid.'
        : status === 429
          ? 'OpenRouter rate limit or credit limit reached. Check your usage in the OpenRouter dashboard.'
        : 'The AI companion could not respond right now.';

    res.status(status).json({
      error: fallbackMessage,
      details: error?.message,
    });
  }
}
