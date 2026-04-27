declare global {
  interface Window {
    __API_BASE_URL__?: string;
  }
}

const rawBaseUrl = window.__API_BASE_URL__ ?? '';

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export function buildApiUrl(path: string): string {
  if (!path.startsWith('/')) return path;
  if (path.startsWith('/api')) return `${API_BASE_URL}${path}`;
  return path;
}
