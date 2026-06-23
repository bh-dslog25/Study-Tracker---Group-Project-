// ── Helpers cơ bản ────────────────────────────────────
export const loadJSON = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

export const removeJSON = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('localStorage remove failed:', e);
  }
};

// ── Helpers theo từng user (gắn userId vào key) ────────
// Dùng hàm này thay cho loadJSON/saveJSON ở Settings,
// Notifications, Appearance, Security... để tránh dữ liệu
// giữa các tài khoản bị lẫn lộn.

export const loadUserJSON = (key, userId, fallback = null) => {
  if (!userId) return fallback;
  return loadJSON(`${key}__${userId}`, fallback);
};

export const saveUserJSON = (key, userId, value) => {
  if (!userId) return;
  saveJSON(`${key}__${userId}`, value);
};

export const removeUserJSON = (key, userId) => {
  if (!userId) return;
  removeJSON(`${key}__${userId}`);
};

// ── Xóa toàn bộ dữ liệu của 1 user khi logout ─────────
// Quét toàn bộ localStorage, xóa mọi key có hậu tố __userId
export const clearUserData = (userId) => {
  if (!userId) return;
  const suffix = `__${userId}`;
  Object.keys(localStorage)
    .filter((k) => k.endsWith(suffix))
    .forEach((k) => localStorage.removeItem(k));
};