const STORAGE_KEYS = {
  chat: 'solace.chatHistory',
  journal: 'solace.journalEntries',
  moods: 'solace.moodHistory',
};

const emotionKeywords = {
  happy: [
    'happy',
    'grateful',
    'joy',
    'joyful',
    'excited',
    'relieved',
    'hopeful',
    'peaceful',
    'calm',
    'good',
    'better',
  ],
  sad: [
    'sad',
    'down',
    'empty',
    'hurt',
    'cry',
    'lonely',
    'lost',
    'tired',
    'heavy',
    'hopeless',
  ],
  anxious: [
    'anxious',
    'anxiety',
    'overwhelmed',
    'panic',
    'stressed',
    'stress',
    'worried',
    'worry',
    'restless',
    'afraid',
    'nervous',
  ],
};

const keywordLibrary = [
  ...emotionKeywords.happy,
  ...emotionKeywords.sad,
  ...emotionKeywords.anxious,
  'sleep',
  'work',
  'family',
  'friend',
  'alone',
  'pressure',
  'focus',
  'night',
  'morning',
];

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function countMatches(text, keywords) {
  return keywords.reduce((score, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    return score + (matches ? matches.length : 0);
  }, 0);
}

export function analyzeEmotion(text) {
  const normalized = text.toLowerCase();
  const scores = {
    happy: countMatches(normalized, emotionKeywords.happy),
    sad: countMatches(normalized, emotionKeywords.sad),
    anxious: countMatches(normalized, emotionKeywords.anxious),
  };

  const [emotion, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return score > 0 ? emotion : 'neutral';
}

export function extractKeywords(text) {
  const normalized = text.toLowerCase();
  return keywordLibrary.filter((keyword) =>
    new RegExp(`\\b${keyword}\\b`, 'i').test(normalized),
  );
}

export function highlightKeywords(text) {
  const keywords = extractKeywords(text);
  if (keywords.length === 0) {
    return text;
  }

  const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  return text.replace(pattern, '<mark>$1</mark>');
}

export function generateReflectionQuestions(text, mood) {
  const questions = [];
  const normalized = text.toLowerCase();

  if (mood === 'anxious') {
    questions.push('What seems to trigger this tension most strongly?');
    questions.push('What would help your body feel 10% safer tonight?');
  } else if (mood === 'sad') {
    questions.push('What felt especially heavy or disappointing today?');
    questions.push('Who or what usually helps you feel less alone?');
  } else if (mood === 'happy') {
    questions.push('What supported this steadier feeling today?');
    questions.push('How could you protect more space for this tomorrow?');
  } else {
    questions.push('What feels most important to acknowledge about today?');
    questions.push('What could make tomorrow feel a little lighter?');
  }

  if (normalized.includes('work') || normalized.includes('study')) {
    questions.push('What boundary would make work feel more manageable?');
  } else if (normalized.includes('sleep') || normalized.includes('night')) {
    questions.push('What nighttime ritual could help you unwind more gently?');
  } else if (normalized.includes('family') || normalized.includes('friend')) {
    questions.push('What kind of support would feel most helpful from others?');
  } else {
    questions.push('What is one small act of care you can offer yourself next?');
  }

  return questions.slice(0, 3);
}

export function getTimePattern(moods) {
  if (moods.length === 0) {
    return null;
  }

  const buckets = {
    morning: [],
    afternoon: [],
    night: [],
  };

  moods.forEach((item) => {
    const hour = new Date(item.timestamp).getHours();
    if (hour < 12) {
      buckets.morning.push(item.mood);
    } else if (hour < 18) {
      buckets.afternoon.push(item.mood);
    } else {
      buckets.night.push(item.mood);
    }
  });

  const anxiousCounts = Object.entries(buckets).map(([period, values]) => ({
    period,
    count: values.filter((mood) => mood === 'anxious').length,
  }));

  anxiousCounts.sort((a, b) => b.count - a.count);
  return anxiousCounts[0].count > 0 ? anxiousCounts[0].period : null;
}

export function getMostCommonEmotion(moods) {
  if (moods.length === 0) {
    return 'neutral';
  }

  const counts = moods.reduce((accumulator, item) => {
    accumulator[item.mood] = (accumulator[item.mood] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function getMoodTrends(moods) {
  const scoreMap = {
    happy: 4,
    neutral: 3,
    sad: 2,
    anxious: 1,
  };

  const days = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    const key = date.toISOString().slice(0, 10);
    const dayEntries = moods.filter((item) => item.timestamp.slice(0, 10) === key);
    const average =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, item) => sum + scoreMap[item.mood], 0) / dayEntries.length
        : null;

    return {
      day: label,
      score: average ? Number(average.toFixed(2)) : null,
      mood: dayEntries.at(-1)?.mood ?? 'neutral',
    };
  });

  return days;
}

export function generateInsights(moods, journalEntries) {
  if (moods.length === 0) {
    return [
      'Your insights will begin to appear after you chat or save a journal entry.',
      'Try checking in at different times of day so the companion can notice patterns gently.',
    ];
  }

  const commonEmotion = getMostCommonEmotion(moods);
  const timePattern = getTimePattern(moods);
  const recentKeywords = journalEntries
    .slice(-5)
    .flatMap((entry) => entry.keywords ?? [])
    .reduce((accumulator, keyword) => {
      accumulator[keyword] = (accumulator[keyword] || 0) + 1;
      return accumulator;
    }, {});

  const topKeyword = Object.entries(recentKeywords).sort((a, b) => b[1] - a[1])[0]?.[0];

  const insights = [
    `Your most common recent emotional tone has been ${commonEmotion}.`,
  ];

  if (timePattern) {
    insights.push(`You seem more anxious during the ${timePattern}.`);
  }

  if (topKeyword) {
    insights.push(`The theme "${topKeyword}" appears often in your recent reflections.`);
  }

  return insights.slice(0, 3);
}

export function getPersonalizedSuggestions(moods, journalEntries) {
  const dominantMood = getMostCommonEmotion(moods);
  const latestEntry = journalEntries.at(-1);
  const latestKeywords = latestEntry?.keywords ?? [];

  const suggestions = [];

  if (dominantMood === 'anxious') {
    suggestions.push('Try a 4-6 breathing cycle for two minutes.');
    suggestions.push('Write down one worry and one thing you can postpone.');
  } else if (dominantMood === 'sad') {
    suggestions.push('Journal about one moment today that felt especially tender.');
    suggestions.push('Reach out to one safe person, even with a short message.');
  } else if (dominantMood === 'happy') {
    suggestions.push('Capture what supported this steadier mood so you can revisit it.');
    suggestions.push('Use the orb chat to reflect on what you want to protect tomorrow.');
  } else {
    suggestions.push('Do a short body check-in and name what you need most right now.');
    suggestions.push('Use the journal to reflect on one win and one stressor from today.');
  }

  if (latestKeywords.includes('sleep') || latestKeywords.includes('night')) {
    suggestions.push('Create a soft evening reset: dim lights, no scrolling, three slow breaths.');
  }

  return suggestions.slice(0, 3);
}

export function getOrbMood(latestMood) {
  return latestMood || 'neutral';
}

export function loadAppData(initialMessages) {
  return {
    chatHistory: readStorage(STORAGE_KEYS.chat, initialMessages),
    journalEntries: readStorage(STORAGE_KEYS.journal, []),
    moodHistory: readStorage(STORAGE_KEYS.moods, []),
  };
}

export function persistChatHistory(messages) {
  writeStorage(STORAGE_KEYS.chat, messages);
}

export function persistJournalEntries(entries) {
  writeStorage(STORAGE_KEYS.journal, entries);
}

export function persistMoodHistory(moods) {
  writeStorage(STORAGE_KEYS.moods, moods);
}
