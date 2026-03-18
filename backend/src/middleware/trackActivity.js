import supabase from '../config/supabase.js';

// ─── In-memory throttle: only update DB once per hour per user ──────────
const lastUpdated = new Map();
const THROTTLE_MS = 60 * 60 * 1000; // 1 hour

// ─── Max map size to prevent memory leak ────────────────────────────────
const MAX_MAP_SIZE = 10000;

export function trackActivity(req, res, next) {
  if (!req.user?.id) return next();

  const userId = req.user.id;
  const now = Date.now();
  const lastTime = lastUpdated.get(userId);

  if (lastTime && (now - lastTime) < THROTTLE_MS) {
    return next(); // skip, updated recently
  }

  // Prevent memory leak
  if (lastUpdated.size >= MAX_MAP_SIZE) {
    // Clear oldest half of entries
    const entries = Array.from(lastUpdated.entries())
      .sort((a, b) => a[1] - b[1]);
    const toRemove = entries.slice(0, Math.floor(MAX_MAP_SIZE / 2));
    for (const [key] of toRemove) {
      lastUpdated.delete(key);
    }
  }

  lastUpdated.set(userId, now);

  // Fire-and-forget: don't block the request
  supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .then(() => {})
    .catch(() => {}); // silently ignore

  next();
}
