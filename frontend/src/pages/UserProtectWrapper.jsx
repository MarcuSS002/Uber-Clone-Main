import React, { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiBaseUrl } from "../utils/api-config";
import { getStoredUser, clearStoredUser } from "../utils/auth-storage";

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user || getStoredUser()) {
      if (!user) {
        setUser(getStoredUser());
      }
      setIsLoading(false);
      return;
    }

    axios
      .get(`${apiBaseUrl}/users/profile`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data.user);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        localStorage.removeItem("token");
        clearStoredUser();
        navigate("/login");
      });
  }, [navigate, setUser, token, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserProtectWrapper;
