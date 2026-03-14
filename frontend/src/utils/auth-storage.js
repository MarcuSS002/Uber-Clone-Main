const USER_DATA_KEY = "user-data";
const CAPTAIN_DATA_KEY = "captain-data";

const readJson = (key) => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

export const getStoredUser = () => readJson(USER_DATA_KEY);

export const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_DATA_KEY);
    return;
  }

  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_DATA_KEY);
};

export const getStoredCaptain = () => readJson(CAPTAIN_DATA_KEY);

export const setStoredCaptain = (captain) => {
  if (!captain) {
    localStorage.removeItem(CAPTAIN_DATA_KEY);
    return;
  }

  localStorage.setItem(CAPTAIN_DATA_KEY, JSON.stringify(captain));
};

export const clearStoredCaptain = () => {
  localStorage.removeItem(CAPTAIN_DATA_KEY);
};
