/**
 * Storage Service — abstraction layer over localStorage.
 * Swap this to Supabase by changing the implementation without touching any component.
 */

const PREFIX = "bizinsight_";

const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  // User-scoped storage (for multi-user support later)
  getUserKey(userId, key) {
    return `user_${userId}_${key}`;
  },

  getForUser(userId, key, fallback = null) {
    return this.get(this.getUserKey(userId, key), fallback);
  },

  setForUser(userId, key, value) {
    this.set(this.getUserKey(userId, key), value);
  },
};

export default storage;
