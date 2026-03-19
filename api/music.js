import { getYouTubeMusicByMood, normalizeMood, searchYouTubeMusic } from '../server/youtube.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const mood = normalizeMood(req.query?.mood || 'calm');
    const query = typeof req.query?.query === 'string' ? req.query.query : '';
    const tracks = query.trim()
      ? await searchYouTubeMusic(query, mood)
      : await getYouTubeMusicByMood(mood);
    res.status(200).json({ mood, tracks, query: query || null });
  } catch (error) {
    const status = error?.status || 500;
    const message =
      error?.message === 'Missing YOUTUBE_API_KEY'
        ? 'Missing YOUTUBE_API_KEY. Add it to your environment before loading music.'
        : status === 403
          ? 'YouTube API access was denied. Check your API key and quota.'
          : 'Music recommendations could not load right now.';

    res.status(status).json({ error: message });
  }
}
