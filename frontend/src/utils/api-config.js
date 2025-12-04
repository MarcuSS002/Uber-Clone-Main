/**
 * API configuration helper
 * Ensures VITE_BASE_URL is available at runtime
 * Falls back to location.origin if env var is missing (dev/test)
 */

export const getApiBaseUrl = () => {
  // In Vite, env vars are available at build time via import.meta.env
  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  if (!baseUrl || baseUrl === 'undefined') {
    console.warn(
      'VITE_BASE_URL not set. Falling back to location.origin. ' +
      'Set VITE_BASE_URL in Vercel Project Settings → Environment Variables.'
    );
    // Fall back to same origin (for testing) or localhost backend
    return import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : window.location.origin;
  }
  
  return baseUrl;
};

export const apiBaseUrl = getApiBaseUrl();
