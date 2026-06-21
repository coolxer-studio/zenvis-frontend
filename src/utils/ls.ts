import { ls } from '@u/local-storage';

const key = 'aqfuzt-v2-';

export function getToken(): string {
  return ls.get(key + 'token') || '';
}

export function getSalt(): string {
  return ls.get(key + 'salt') || '';
}

export function setToken(token: string): void {
  ls.set(key + 'token', token);
}

export function setSalt(token: string): void {
  ls.set(key + 'salt', token);
}

export function getLang(): string {
  return ls.get(key + 'lang') || '';
}

export function setLang(lang: string): void {
  ls.set(key + 'lang', lang);
}

export function getOptionPermissions(): string {
  return ls.get(key + 'option-permissions') || '';
}

export function setOptionPermissions(permissions: string): void {
  ls.set(key + 'option-permissions', permissions);
}
