/**
 * API configuration helper
 * Uses VITE_BASE_URL when provided.
 * Falls back to local backend in dev and the current Render backend in production.
 */

export const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL?.trim();

  if (!baseUrl || baseUrl === "undefined") {
    const fallbackUrl = import.meta.env.DEV
      ? "http://localhost:5000"
      : "https://uber-clone-backend-mksa.onrender.com";

    console.warn(
      "VITE_BASE_URL not set. Falling back to:",
      fallbackUrl,
      "Set VITE_BASE_URL in Vercel Project Settings -> Environment Variables for proper configuration.",
    );

    return fallbackUrl;
  }

  return baseUrl;
};

export const apiBaseUrl = getApiBaseUrl();
