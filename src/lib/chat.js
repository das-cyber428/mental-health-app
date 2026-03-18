const emotionalSignals = {
  anxious: [
    'anxious',
    'anxiety',
    'panic',
    'overwhelmed',
    'stress',
    'stressed',
    'restless',
    'worried',
    'nervous',
    'scared',
    'fear',
    'afraid',
  ],
  sad: [
    'sad',
    'lonely',
    'empty',
    'hurt',
    'down',
    'hopeless',
    'crying',
    'heavy',
    'lost',
    'numb',
    'low',
    'broken',
  ],
  angry: ['angry', 'frustrated', 'annoyed', 'irritated', 'upset', 'mad'],
  tired: ['tired', 'sleep', 'exhausted', 'burnout', 'drained', 'fatigued'],
};

const supportPhrases = [
  'i feel',
  'i am feeling',
  'i need help',
  'i need support',
  'i am struggling',
  'nothing feels right',
  'i do not know what to do',
  "i don't know what to do",
  'i cannot handle',
  "i can't handle",
];

const distressSignals = [
  'self harm',
  'suicide',
  'kill myself',
  'want to die',
  'not safe',
  'hurt myself',
];

const practicalTopics = {
  study:
    "Try working in one 25-minute focus block, then take a 5-minute break. If you're stuck, tell me the subject and I can help you break it down.",
  career:
    'A useful next step is to narrow the problem: are you choosing a direction, improving skills, or preparing for interviews? Once that is clear, the plan gets much easier.',
  sleep:
    'A simple reset is: dim lights, put your phone away for 20 minutes, write down looping thoughts, and do a slower exhale than inhale for a few rounds.',
  health:
    'For basic wellbeing questions, I can offer general guidance, but if symptoms feel intense, persistent, or worrying, it is best to check with a licensed professional.',
  life:
    'A helpful next step is to shrink the problem. Focus on one decision, one task, or one conversation instead of trying to solve everything at once.',
};

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function detectEmotion(text) {
  for (const [emotion, words] of Object.entries(emotionalSignals)) {
    if (includesAny(text, words)) {
      return emotion;
    }
  }

  if (includesAny(text, supportPhrases)) {
    return 'sad';
  }

  return null;
}

function isQuestion(text) {
  return (
    text.includes('?') ||
    /^(what|why|how|when|where|who|can|should|is|are|do|does|will|would|could)\b/i.test(text)
  );
}

function detectTopic(text) {
  if (includesAny(text, ['study', 'exam', 'homework', 'college', 'school', 'learn'])) return 'study';
  if (includesAny(text, ['career', 'job', 'interview', 'resume', 'work'])) return 'career';
  if (includesAny(text, ['sleep', 'insomnia', 'night', 'rest'])) return 'sleep';
  if (includesAny(text, ['health', 'body', 'symptom', 'doctor'])) return 'health';
  return 'life';
}

function buildEmpathy(emotion) {
  switch (emotion) {
    case 'anxious':
      return 'I understand how that can feel overwhelming. Anxiety can make everything seem urgent, even when you are already doing your best.';
    case 'sad':
      return "I'm sorry you're carrying that. When you feel low or lost, even simple things can start to feel much heavier.";
    case 'angry':
      return 'That sounds really frustrating. When emotions run hot, it often means something important inside you feels crossed or unheard.';
    case 'tired':
      return 'That sounds exhausting. When your mind and body both feel worn down, even small tasks can start to feel like too much.';
    default:
      return "I'm here with you, and I'm listening carefully.";
  }
}

function buildGuidance(emotion) {
  switch (emotion) {
    case 'anxious':
      return 'A good next step is to slow the moment down: unclench your jaw, drop your shoulders, and focus on one concrete thing you can control in the next 10 minutes.';
    case 'sad':
      return 'Try keeping the goal small for now: one glass of water, one honest journal line, or one message to someone safe can be enough for this moment.';
    case 'angry':
      return 'Before reacting, give your body a short reset. A walk, slower breathing, or stepping away for five minutes can help you respond more clearly.';
    case 'tired':
      return 'Instead of pushing harder, reduce the load. Pick the single most necessary task and let the rest wait if it can.';
    default:
      return 'We can take this one step at a time and figure out what would help most right now.';
  }
}

function buildFollowUp(emotion, questionMode) {
  if (questionMode) {
    return 'If you want, I can help you think through it step by step.';
  }

  switch (emotion) {
    case 'anxious':
      return 'What feels most urgent in your mind right now?';
    case 'sad':
      return 'What part of this feels heaviest today?';
    case 'angry':
      return 'What do you wish had happened differently?';
    case 'tired':
      return 'What is draining you the most right now: sleep, pressure, or emotional weight?';
    default:
      return 'What would feel most supportive right now?';
  }
}

function buildGeneralAnswer(text) {
  const topic = detectTopic(text);
  return practicalTopics[topic];
}

function buildDistressResponse() {
  return [
    "I'm really glad you said that out loud. You do not have to handle this alone.",
    'If there is any immediate risk of hurting yourself or you feel unsafe, please call emergency services right now or reach out to a local crisis line immediately.',
    'If you can, message or call someone you trust and tell them you need support staying safe with you.',
  ].join(' ');
}

function buildReflectiveFallback(text) {
  if (text.length < 20) {
    return "I'm here with you. Tell me a little more about what is going on, and I'll respond in a clearer, more helpful way.";
  }

  return [
    "I can hear that something important is sitting underneath this.",
    'A helpful place to start is to name whether this feels more like stress, sadness, confusion, or pressure.',
    'Once you tell me that, I can help with both emotional support and a practical next step.',
  ].join(' ');
}

export async function sendMessageToAI(message) {
  const normalized = message.toLowerCase().trim();
  const emotion = detectEmotion(normalized);
  const questionMode = isQuestion(normalized);
  const distress = includesAny(normalized, distressSignals);
  const supportMode = includesAny(normalized, supportPhrases);

  await new Promise((resolve) => {
    window.setTimeout(resolve, 900 + Math.random() * 450);
  });

  if (distress) {
    return buildDistressResponse();
  }

  if (emotion && questionMode) {
    return [
      buildEmpathy(emotion),
      buildGeneralAnswer(normalized),
      buildFollowUp(emotion, true),
    ].join(' ');
  }

  if (emotion || supportMode) {
    const resolvedEmotion = emotion ?? 'sad';
    return [
      buildEmpathy(resolvedEmotion),
      buildGuidance(resolvedEmotion),
      buildFollowUp(resolvedEmotion, false),
    ].join(' ');
  }

  if (questionMode) {
    return `${buildGeneralAnswer(normalized)} If you want, tell me your exact situation and I can make the advice more specific.`;
  }

  return buildReflectiveFallback(normalized);
}
