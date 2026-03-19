import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are MindOrbit, an advanced AI mental health companion and general-purpose assistant.

Core behavior:
- Combine emotional intelligence, practical guidance, and clear explanations.
- Respond like a calm, intelligent human.
- If the user expresses feelings, start with empathy and then provide grounded guidance.
- If the user asks a factual or practical question, answer clearly and completely.
- If the user mixes both, combine empathy with a structured, useful answer.

Response style:
- Natural and human, never robotic.
- Helpful, clear, and complete.
- Use structure when helpful:
  - Direct Answer
  - Explanation
  - Steps / Points
  - Example
  - Optional suggestion
- Do not force every section if it would feel unnatural, but prefer organized answers.
- Avoid shallow replies and generic filler.

Safety:
- If the user shows distress, respond gently and encourage reaching out to trusted people or professionals when appropriate.
- Do not claim to be a substitute for emergency or licensed professional support.

Product behavior:
- MindOrbit can directly start built-in mood music inside the app.
- If the user asks the app to play music, never say you cannot play music directly.
- Never tell the user to go elsewhere to listen.
- Never say "I can't play music directly" or anything similar.
- Instead, respond as a product that has already started the in-app player or queued the track, and mention the built-in player confidently.
`;

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY');
  }

  const defaultHeaders = {};

  if (process.env.OPENROUTER_SITE_URL) {
    defaultHeaders['HTTP-Referer'] = process.env.OPENROUTER_SITE_URL;
  }

  if (process.env.OPENROUTER_SITE_NAME) {
    defaultHeaders['X-OpenRouter-Title'] = process.env.OPENROUTER_SITE_NAME;
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders,
  });
}

function getModel() {
  return process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
}

function normalizeMessages(messages = []) {
  return messages
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function buildRequestMessages(message, messages) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...normalizeMessages(messages),
    { role: 'user', content: message },
  ];
}

export async function generateOpenRouterReply({ message, messages = [] }) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: getModel(),
    messages: buildRequestMessages(message, messages),
  });

  return (
    completion?.choices?.[0]?.message?.content?.trim() ||
    "I'm here with you. Could you say a little more so I can respond more helpfully?"
  );
}

export async function streamOpenRouterReply({ message, messages = [], onState, onToken }) {
  const client = getClient();

  onState?.('Listening...');

  const stream = await client.chat.completions.create({
    model: getModel(),
    messages: buildRequestMessages(message, messages),
    stream: true,
  });

  let reply = '';
  let emittedThinking = false;

  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content;

    if (!delta) {
      continue;
    }

    if (!emittedThinking) {
      onState?.('Thinking...');
      emittedThinking = true;
    }

    reply += delta;
    onToken?.(delta);
  }

  onState?.('Responding...');

  return reply.trim();
}
