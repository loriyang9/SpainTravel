/**
 * API configuration for split deployment
 * Frontend: GitHub Pages | Backend: Zeabur
 */

// API base URL — points to the Zeabur backend
// In development, defaults to empty string (same-origin proxy)
// In production, set VITE_API_BASE_URL to your Zeabur domain
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Resolve an asset URL returned by the API.
 * URLs starting with "/" (e.g. "/attached_assets/...") are relative to the backend server.
 * Full URLs (https://...) are returned as-is.
 */
export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return url;
}
