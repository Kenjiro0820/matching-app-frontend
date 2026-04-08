import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("loginUser");
    if (!raw) return;

    try {
      setLoginUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("loginUser");
    }
  }, []);

  function login(user) {
    setLoginUser(user);
    localStorage.setItem("loginUser", JSON.stringify(user));
  }

  function logout() {
    setLoginUser(null);
    localStorage.removeItem("loginUser");
  }

  const value = useMemo(
    () => ({
      loginUser,
      isLoggedIn: !!loginUser,
      login,
      logout,
    }),
    [loginUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
