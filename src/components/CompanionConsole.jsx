import { motion } from 'framer-motion';

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[22px] border border-white/8 bg-slate-950/22 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs leading-6 text-slate-300/60">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-7 w-12 rounded-full transition ${
          checked ? 'bg-cyan-400/80' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  );
}

export default function CompanionConsole({
  user,
  metrics,
  settings,
  installAvailable,
  notificationPermission,
  onInstall,
  onToggleVoice,
  onToggleNotifications,
  onSignOut,
}) {
  return (
    <div className="grid content-start gap-6">
      <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/56">Account</p>
        <h3 className="mt-3 text-2xl font-medium text-white">{user?.name}</h3>
        <p className="mt-1 text-sm text-slate-300/66">{user?.email}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Conversations', metrics.conversationCount],
            ['Journal Entries', metrics.journalCount],
            ['Check-ins', metrics.moodCount],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[22px] border border-white/8 bg-slate-950/22 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
              <p className="mt-2 text-2xl text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <Toggle
            label="Voice playback"
            hint="Let MindOrbit read new AI replies aloud after they arrive."
            checked={settings.voicePlaybackEnabled}
            onChange={onToggleVoice}
          />
          <Toggle
            label="Daily check-in reminders"
            hint={`Current browser permission: ${notificationPermission}.`}
            checked={settings.notificationsEnabled}
            onChange={onToggleNotifications}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {installAvailable ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onInstall}
              className="rounded-full border border-cyan-200/18 bg-cyan-300/10 px-5 py-3 text-sm text-cyan-50"
            >
              Install app
            </motion.button>
          ) : null}

          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/82 transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
