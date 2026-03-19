const moodTerms = {
  calm: /\b(calm|calming|ambient|meditation|sleep|focus|relax|relaxing|soft)\b/i,
  anxious: /\b(anxious|anxiety|stress|stressed|overwhelmed|panic|nervous)\b/i,
  sad: /\b(sad|lonely|emotional|heartbreak|heartbroken|cry|down)\b/i,
  happy: /\b(happy|upbeat|energetic|dance|joy|bright|cheerful)\b/i,
};

function inferMood(text, fallbackMood = 'calm') {
  for (const [mood, pattern] of Object.entries(moodTerms)) {
    if (pattern.test(text)) {
      return mood;
    }
  }

  return fallbackMood === 'neutral' ? 'calm' : fallbackMood;
}

function extractPlayTarget(text) {
  return text
    .replace(/^(?:can you\s+)?(?:please\s+)?(?:play|listen to|put on|start)\s+/i, '')
    .trim();
}

export function parseMusicCommand(text, fallbackMood = 'calm') {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  if (/^(next|next song|skip|skip song)$/i.test(lower)) {
    return { type: 'next' };
  }

  if (/^(previous|prev|previous song|prev song|back song)$/i.test(lower)) {
    return { type: 'previous' };
  }

  if (/^(pause|pause song|pause music|stop music)$/i.test(lower)) {
    return { type: 'pause' };
  }

  if (/^(resume|resume music|continue|continue music|play again)$/i.test(lower)) {
    return { type: 'resume' };
  }

  if (/^(open player|show player|open music|show queue)$/i.test(lower)) {
    return { type: 'open_player' };
  }

  if (/^(play|listen to|put on|start)\b/i.test(trimmed)) {
    const target = extractPlayTarget(trimmed);
    const mood = inferMood(trimmed, fallbackMood);

    if (!target) {
      return { type: 'play_mood', mood };
    }

    if (/^(sad|happy|calm|anxious)(?:\s+(songs?|music|playlist|mix))?$/i.test(target)) {
      return { type: 'play_mood', mood: inferMood(target, fallbackMood) };
    }

    return {
      type: 'play_query',
      query: target,
      mood,
    };
  }

  return null;
}
