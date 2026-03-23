export const TOKEN_STORAGE_KEY = "batchit_token";
export const USER_STORAGE_KEY = "batchit_user";

export function readStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function readStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function storeSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}
