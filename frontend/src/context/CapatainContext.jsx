import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiBaseUrl } from "../utils/api-config";
import {
  getStoredCaptain,
  setStoredCaptain,
  clearStoredCaptain,
} from "../utils/auth-storage";
import { getAuthHeaders } from "../utils/auth-headers";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptainState] = useState(() => getStoredCaptain());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setCaptain = useCallback((captainData) => {
    setCaptainState(captainData);

    if (captainData) {
      setStoredCaptain(captainData);
      return;
    }

    clearStoredCaptain();
  }, []);

  const updateCaptain = useCallback((captainData) => {
    setCaptain(captainData);
  }, [setCaptain]);

  const value = {
    captain,
    setCaptain,
    isLoading,
    setIsLoading,
    error,
    setError,
    updateCaptain,
  };

  // On mount, try to restore captain from saved token (login or signup)
  useEffect(() => {
    const tryLoadCaptain = async () => {
      const token =
        localStorage.getItem("captain-token") || localStorage.getItem("token");
      if (!token) return;
      if (captain) return;

      setIsLoading(true);
      try {
        const res = await axios.get(`${apiBaseUrl}/captains/profile`, {
          withCredentials: true,
          headers: getAuthHeaders(["captain-token", "token"]),
        });
        if (res?.data?.captain) {
          setCaptain(res.data.captain);
        }
      } catch (err) {
        console.error(
          "Failed to restore captain from token:",
          err?.response?.data || err.message || err,
        );
        setError("Failed to restore session");
        // If token is invalid/expired, remove it
        // keep this conservative: only remove if server responded 401
        if (err?.response?.status === 401) {
          localStorage.removeItem("captain-token");
          localStorage.removeItem("token");
          clearStoredCaptain();
        }
      } finally {
        setIsLoading(false);
      }
    };

    tryLoadCaptain();
  }, [captain, setCaptain]);

  return (
    <CaptainDataContext.Provider value={value}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
