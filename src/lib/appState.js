const USERS_KEY = 'mindorbit.users';
const SESSION_KEY = 'mindorbit.session';
const USER_DATA_PREFIX = 'mindorbit.userData';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function userDataKey(userId) {
  return `${USER_DATA_PREFIX}.${userId}`;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password) {
  if (typeof crypto?.subtle === 'undefined') {
    return `fallback:${password}`;
  }

  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getStoredUsers() {
  return readJson(USERS_KEY, []);
}

export function getActiveSession() {
  return readJson(SESSION_KEY, null);
}

export function getActiveUser() {
  const session = getActiveSession();
  if (!session?.userId) {
    return null;
  }

  const users = getStoredUsers();
  return sanitizeUser(users.find((user) => user.id === session.userId) ?? null);
}

export async function createLocalAccount({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    throw new Error('Name, email, and password are required.');
  }

  const users = getStoredUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with that email already exists.');
  }

  const user = {
    id: `user-${Date.now()}`,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    settings: {
      voicePlaybackEnabled: false,
      notificationsEnabled: false,
      notificationsPermission: 'default',
      reminderHour: 20,
      autoReadResponses: false,
    },
  };

  writeJson(USERS_KEY, [...users, user]);
  writeJson(SESSION_KEY, { userId: user.id });

  return sanitizeUser(user);
}

export async function signInLocalAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const user = getStoredUsers().find(
    (item) => item.email === normalizedEmail && item.passwordHash === passwordHash,
  );

  if (!user) {
    throw new Error('We could not match that email and password.');
  }

  writeJson(SESSION_KEY, { userId: user.id });
  return sanitizeUser(user);
}

export async function signInDemoAccount() {
  const demoEmail = 'demo@mindorbit.app';
  const existing = getStoredUsers().find((user) => user.email === demoEmail);

  if (existing) {
    writeJson(SESSION_KEY, { userId: existing.id });
    return sanitizeUser(existing);
  }

  return createLocalAccount({
    name: 'Demo Companion',
    email: demoEmail,
    password: 'mindorbit-demo',
  });
}

export function signOutLocalAccount() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export function updateUserSettings(userId, patch) {
  const users = getStoredUsers();
  const nextUsers = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          settings: {
            ...user.settings,
            ...patch,
          },
        }
      : user,
  );

  writeJson(USERS_KEY, nextUsers);
  return sanitizeUser(nextUsers.find((user) => user.id === userId) ?? null);
}

export function getDefaultUserData(initialMessages) {
  return {
    chatHistory: initialMessages,
    journalEntries: [],
    moodHistory: [],
    analytics: {
      sessions: 0,
      checkInDates: [],
    },
  };
}

export function loadUserAppData(userId, initialMessages) {
  return readJson(userDataKey(userId), getDefaultUserData(initialMessages));
}

export function persistUserAppData(userId, patch, initialMessages) {
  const current = loadUserAppData(userId, initialMessages);
  const next = {
    ...current,
    ...patch,
  };

  writeJson(userDataKey(userId), next);
  return next;
}
