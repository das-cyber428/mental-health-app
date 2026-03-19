function parseEventBlock(block) {
  const lines = block.split('\n');
  const eventLine = lines.find((line) => line.startsWith('event:'));
  const dataLine = lines.find((line) => line.startsWith('data:'));

  return {
    event: eventLine ? eventLine.replace('event:', '').trim() : 'message',
    data: dataLine ? dataLine.replace('data:', '').trim() : '',
  };
}

async function readJsonError(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => ({}));
    return data?.error || 'The AI companion could not respond right now.';
  }

  return 'The AI companion could not respond right now.';
}

export async function streamMessageToAI({
  message,
  messages = [],
  onState,
  onToken,
  onDone,
}) {
  const response = await fetch('/api/chat-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(await readJsonError(response));
  }

  if (!response.body) {
    throw new Error('Streaming is not available in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    chunks.forEach((chunk) => {
      if (!chunk.trim()) {
        return;
      }

      const { event, data } = parseEventBlock(chunk);

      if (!data) {
        return;
      }

      const parsed = JSON.parse(data);

      if (event === 'state') {
        onState?.(parsed.value);
      } else if (event === 'token') {
        onToken?.(parsed.value);
      } else if (event === 'done') {
        onDone?.(parsed.value);
      } else if (event === 'error') {
        throw new Error(parsed.value || 'The AI companion could not respond right now.');
      }
    });
  }
}
