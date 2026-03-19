import { useState } from 'react';
import { motion } from 'framer-motion';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export default function AuthShell({ onCreateAccount, onSignIn, onDemoAccess, isSubmitting, error }) {
  const [mode, setMode] = useState('create');
  const [form, setForm] = useState(initialForm);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === 'create') {
      await onCreateAccount(form);
    } else {
      await onSignIn(form);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070F] px-6 py-8 text-white sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,80,255,0.22),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(55,176,255,0.14),transparent_24%),linear-gradient(180deg,#05070F_0%,#071120_100%)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.82fr)] lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-cyan-100/70 backdrop-blur-xl">
            MindOrbit Live
          </div>
          <h1 className="mt-8 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl">
            Your companion gets more useful when it remembers you gently.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200/72">
            Create a private local account to keep your conversations, journal entries,
            mood patterns, reminders, and voice preferences in one calmer place.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              'Streaming conversation with live response states',
              'Voice input, voice playback, and mobile-safe controls',
              'Per-user insights, journaling history, and reminders',
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200/72 backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[34px] border border-white/10 bg-[rgba(10,15,30,0.7)] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.48)] backdrop-blur-[18px] sm:p-7"
        >
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            {[
              ['create', 'Create account'],
              ['signin', 'Sign in'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex-1 rounded-full px-4 py-2 text-sm transition ${
                  mode === value
                    ? 'bg-white text-slate-950'
                    : 'text-white/70 hover:bg-white/6'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'create' && (
              <label className="block">
                <span className="mb-2 block text-sm text-white/72">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="w-full rounded-[20px] border border-white/10 bg-slate-950/32 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  placeholder="How should MindOrbit greet you?"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm text-white/72">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-[20px] border border-white/10 bg-slate-950/32 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/72">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="w-full rounded-[20px] border border-white/10 bg-slate-950/32 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                placeholder="Choose a private password"
              />
            </label>

            {error ? (
              <div className="rounded-[18px] border border-rose-300/14 bg-rose-400/8 px-4 py-3 text-sm text-rose-100/82">
                {error}
              </div>
            ) : null}

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 20px 55px rgba(70,130,255,0.38)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 px-6 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(72,113,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Preparing your space...'
                : mode === 'create'
                  ? 'Create local account'
                  : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">Fast access</p>
            <p className="mt-2 text-sm leading-7 text-slate-200/68">
              Try the full experience with a demo workspace first, then switch to your
              own account later.
            </p>
            <button
              type="button"
              onClick={onDemoAccess}
              className="mt-4 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/86 transition hover:bg-white/10"
            >
              Continue with demo workspace
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
