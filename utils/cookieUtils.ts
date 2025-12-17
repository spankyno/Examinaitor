import { HistoryItem } from '../types';

const HISTORY_COOKIE_NAME = 'examinaitor_history';
const CONSENT_COOKIE_NAME = 'examinaitor_consent';

export const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const saveHistory = (item: HistoryItem) => {
  const existingStr = getCookie(HISTORY_COOKIE_NAME);
  let history: HistoryItem[] = existingStr ? JSON.parse(existingStr) : [];
  
  // Add new item to start
  history.unshift(item);
  
  // Keep only last 10 to prevent cookie overflow
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  setCookie(HISTORY_COOKIE_NAME, JSON.stringify(history), 365);
};

export const getHistory = (): HistoryItem[] => {
  const str = getCookie(HISTORY_COOKIE_NAME);
  return str ? JSON.parse(str) : [];
};

export const hasConsented = (): boolean => {
  return getCookie(CONSENT_COOKIE_NAME) === 'true';
};

export const giveConsent = () => {
  setCookie(CONSENT_COOKIE_NAME, 'true', 365);
};