export const getAuthHeaders = (tokenKey = "token") => {
  const tokenKeys = Array.isArray(tokenKey) ? tokenKey : [tokenKey];
  const token = tokenKeys.find((key) => localStorage.getItem(key));
  const resolvedToken = token ? localStorage.getItem(token) : null;

  if (!resolvedToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${resolvedToken}`,
  };
};
