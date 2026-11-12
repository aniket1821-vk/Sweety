
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sweety_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("sweety_user");
      localStorage.removeItem("sweety_token");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("sweety_token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await api.get("/readings");

        const savedUser = localStorage.getItem("sweety_user");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          localStorage.removeItem("sweety_token");
          setUser(null);
        }
      } catch {
        localStorage.removeItem("sweety_token");
        localStorage.removeItem("sweety_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const { token, user: loggedInUser } = response.data.data;

    localStorage.setItem("sweety_token", token);
    localStorage.setItem("sweety_user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
