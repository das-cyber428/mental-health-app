const responseLibrary = [
  "That sounds like a lot to carry at once. Let's slow the moment down and notice one feeling at a time.",
  'You do not need to solve everything right now. What feels most important to name in this moment?',
  "I'm with you. Try one deeper breath, relax your shoulders, and tell me what is feeling sharpest.",
  'Thank you for sharing that. What would feel most supportive right now: grounding, reflection, or encouragement?',
];

export async function sendMessageToAI(message) {
  const normalized = message.toLowerCase();

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1100);
  });

  if (normalized.includes('anxious') || normalized.includes('panic')) {
    return "Anxiety can make everything feel louder. Let's anchor into the present together. Can you name five things you can see?";
  }

  if (normalized.includes('sad') || normalized.includes('lonely')) {
    return "I'm really glad you reached out. You do not have to hold sadness alone here. What feels most tender right now?";
  }

  if (normalized.includes('overwhelmed') || normalized.includes('stress')) {
    return 'When everything feels crowded, we can make the next step smaller. What is one thing that can wait until later?';
  }

  if (normalized.includes('sleep') || normalized.includes('tired')) {
    return 'Rest can feel far away when your mind is still active. Would a short breathing rhythm or a gentle brain-dump help more right now?';
  }

  return responseLibrary[Math.floor(Math.random() * responseLibrary.length)];
}
