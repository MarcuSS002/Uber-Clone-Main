/**
 * API configuration helper
 * Ensures VITE_BASE_URL is available at runtime
 * Falls back to location.origin if env var is missing (dev/test)
 */

export const getApiBaseUrl = () => {
  // In Vite, env vars are available at build time via import.meta.env
  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  if (!baseUrl || baseUrl === 'undefined') {
    const fallbackUrl = import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : 'https://backend-3-e1dm.onrender.com'; // Hardcode production backend URL as last resort
    
    console.warn(
      'VITE_BASE_URL not set. Falling back to:', fallbackUrl,
      'Set VITE_BASE_URL in Vercel Project Settings → Environment Variables for proper configuration.'
    );
    return fallbackUrl;
  }
  
  return baseUrl;
};

export const apiBaseUrl = getApiBaseUrl();
