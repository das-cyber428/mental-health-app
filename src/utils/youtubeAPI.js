const moodQueries = {
  happy: 'happy upbeat songs',
  sad: 'sad emotional songs',
  anxious: 'calm relaxing music',
  calm: 'ambient meditation music',
};

const moodCache = new Map();
const queryCache = new Map();

export function getMoodQuery(mood) {
  return moodQueries[mood] || moodQueries.calm;
}

export async function getMusicByMood(mood) {
  const normalizedMood = moodQueries[mood] ? mood : 'calm';

  if (moodCache.has(normalizedMood)) {
    return moodCache.get(normalizedMood);
  }

  const response = await fetch(`/api/music?mood=${encodeURIComponent(normalizedMood)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Could not load music recommendations.');
  }

  const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
  moodCache.set(normalizedMood, tracks);
  return tracks;
}

export async function getMusicByQuery(query, mood = 'calm') {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const cacheKey = `${mood}:${trimmed.toLowerCase()}`;

  if (queryCache.has(cacheKey)) {
    return queryCache.get(cacheKey);
  }

  const response = await fetch(
    `/api/music?query=${encodeURIComponent(trimmed)}&mood=${encodeURIComponent(mood)}`,
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Could not load music recommendations.');
  }

  const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
  queryCache.set(cacheKey, tracks);
  return tracks;
}
