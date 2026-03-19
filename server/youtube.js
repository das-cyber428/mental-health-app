import yts from 'yt-search';

const moodQueries = {
  happy: ['happy upbeat songs', 'feel good indie pop', 'happy lofi chill mix'],
  sad: ['sad emotional songs', 'soft melancholy playlist', 'sad boy hour acoustic'],
  anxious: ['calm relaxing music', 'ambient focus study', 'deep sleep frequency'],
  calm: ['ambient meditation music', 'soft piano relaxing', 'chillwave study lofi'],
};

const defaultMood = 'calm';

const moodAccents = {
  happy: '#4de3c1',
  sad: '#8d7eff',
  anxious: '#59d3ff',
  calm: '#61d0ff',
};

const moodEnergy = {
  happy: 0.78,
  sad: 0.32,
  anxious: 0.28,
  calm: 0.42,
};

const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 20;

export function normalizeMood(mood) {
  return moodQueries[mood] ? mood : defaultMood;
}

function buildCacheKey(mood, query) {
  return `${normalizeMood(mood)}::${(query || '').trim().toLowerCase()}`;
}

function mapTrack(item, mood, index) {
  const videoId = item?.videoId;

  if (!videoId) {
    return null;
  }

  return {
    id: `${mood}-${videoId}-${index}`,
    mood,
    videoId,
    title: item.title || 'Untitled',
    artist: item.author?.name || 'YouTube',
    thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    accent: moodAccents[mood],
    energy: moodEnergy[mood],
  };
}

function generateQueries(query, mood) {
  const normalizedMood = normalizeMood(mood);
  if (!query) {
    return moodQueries[normalizedMood];
  }

  const base = query.trim();
  // Mix specific search with algorithm-forcing variety
  return [
    `${base} audio`,
    `${base} youtube music mix`,
    `top songs like ${base}`,
    moodQueries[normalizedMood][Math.floor(Math.random() * moodQueries[normalizedMood].length)] // Guarantee diverse mood injections
  ];
}

function getTitleWords(title) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, '') // remove parens/brackets/braces
    .replace(/(official|video|audio|lyrics|instrumental|music|hd|hq|live|remix|slowed|reverb|lofi|flip|mix|feat|ft)/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function calculateOverlap(wordsA, wordsB) {
  if (!wordsA.length || !wordsB.length) return 0;
  let matches = 0;
  for (const w of wordsA) {
    if (wordsB.includes(w)) matches++;
  }
  return matches / Math.min(wordsA.length, wordsB.length);
}

function removeDuplicates(tracks, baseQuery) {
  const seenIds = new Set();
  const seenTitlesWords = [];
  const uniqueTracks = [];

  const baseWords = baseQuery ? getTitleWords(baseQuery) : [];
  let baseMatchCount = 0;

  for (const track of tracks) {
    if (!track) continue;
    if (seenIds.has(track.videoId)) continue;

    const words = getTitleWords(track.title);
    
    // Semantic Duplicate Check (>60% word overlap with any previously added track)
    let isDuplicate = false;
    for (const seen of seenTitlesWords) {
      if (calculateOverlap(words, seen) > 0.6) {
        isDuplicate = true;
        break;
      }
    }

    // Base Search Throttle: For a specific search like "Dil Mere", only allow 2 matching items
    if (!isDuplicate && baseWords.length > 0) {
      const overlapWithBase = calculateOverlap(words, baseWords);
      if (overlapWithBase > 0.7) {
        baseMatchCount++;
        if (baseMatchCount > 2) { 
          isDuplicate = true;
        }
      }
    }

    if (!isDuplicate) {
      seenIds.add(track.videoId);
      seenTitlesWords.push(words);
      uniqueTracks.push(track);
    }
  }

  return uniqueTracks;
}

function smartMixShuffle(tracks) {
  const shuffled = [...tracks];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const result = [];
  const reserve = [];

  for (const track of shuffled) {
    const lastTrack = result[result.length - 1];
    
    if (lastTrack && lastTrack.artist === track.artist) {
      reserve.push(track);
    } else {
      result.push(track);
      
      if (reserve.length > 0) {
        for (let i = 0; i < reserve.length; i++) {
          if (reserve[i].artist !== result[result.length - 1].artist) {
            result.push(reserve[i]);
            reserve.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  return [...result, ...reserve];
}

async function fetchAndProcess(queries, mood, baseQuery = '') {
  const searchPromises = queries.map(q => yts(q).catch(() => null));
  const searchResults = await Promise.all(searchPromises);

  let rawTracks = [];
  let index = 0;

  for (const result of searchResults) {
    if (result && result.videos) {
      const subset = result.videos.slice(0, 10);
      for (const item of subset) {
        const mapped = mapTrack(item, mood, index++);
        if (mapped) rawTracks.push(mapped);
      }
    }
  }

  if (!rawTracks.length) {
    throw new Error('Music recommendations could not load right now.');
  }

  // Filter with baseQuery throttle
  const uniqueTracks = removeDuplicates(rawTracks, baseQuery);
  const finalMix = smartMixShuffle(uniqueTracks);
  
  // Guarantee a full queue if possible, but sliced
  return finalMix.slice(0, 15);
}

export async function getYouTubeMusicByMood(mood) {
  const normalizedMood = normalizeMood(mood);
  const cacheKey = buildCacheKey(normalizedMood, '');
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.tracks;
  }

  const queries = generateQueries('', normalizedMood);
  const tracks = await fetchAndProcess(queries, normalizedMood, '');

  cache.set(cacheKey, { timestamp: Date.now(), tracks });
  return tracks;
}

export async function searchYouTubeMusic(query, mood = 'calm') {
  const trimmed = query.trim();
  const normalizedMood = normalizeMood(mood);

  if (!trimmed) {
    return [];
  }

  const cacheKey = buildCacheKey(normalizedMood, trimmed);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.tracks;
  }

  const queries = generateQueries(trimmed, normalizedMood);
  // Pass trimmed query down to fetchAndProcess to activate Base Search Throttle
  const tracks = await fetchAndProcess(queries, normalizedMood, trimmed);

  cache.set(cacheKey, { timestamp: Date.now(), tracks });
  return tracks;
}
