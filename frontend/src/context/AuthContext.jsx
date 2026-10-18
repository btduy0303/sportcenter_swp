import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sportcenter_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sportcenter_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sportcenter_user', JSON.stringify(user));
      localStorage.setItem('sportcenter_email', user.email);
      localStorage.setItem('sportcenter_name', user.fullName);
      localStorage.setItem('sportcenter_role', user.role);
    } else {
      localStorage.removeItem('sportcenter_user');
      localStorage.removeItem('sportcenter_email');
      localStorage.removeItem('sportcenter_name');
      localStorage.removeItem('sportcenter_role');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sportcenter_token', token);
    } else {
      localStorage.removeItem('sportcenter_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      const jwt = res.jwtToken || res.token;
      if (jwt) {
        localStorage.setItem('sportcenter_token', jwt);
        setToken(jwt);
      }

      let userInfo = {
        id: res.id || res.userId || null,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      };

      try {
        const profile = await api.getMyProfile();
        if (profile) {
          userInfo = {
            ...userInfo,
            ...profile,
            id: profile.id || userInfo.id,
          };
        }
      } catch {
        // Fallback to basic credentials returned from login
      }

      setUser(userInfo);
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      return await api.register(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sportcenter_token');
    localStorage.removeItem('sportcenter_user');
  };

  const switchDemoRole = async (roleCode) => {
    const accounts = {
      MANAGER: { email: 'manager@test.local', pass: 'luongbahung123', name: 'Center Manager' },
      RECEPTIONIST: { email: 'receptionist02@example.com', pass: 'Reception@123', name: 'Nguyen Thi Receptionist' },
      MEMBER: { email: 'member001@example.com', pass: '12345678', name: 'Luong Ba Hung' },
      COACH: { email: 'coach01@example.com', pass: 'Coach@12345', name: 'Nguyen Van Coach' },
    };
    const target = accounts[roleCode] || accounts.MANAGER;
    try {
      await login(target.email, target.pass);
    } catch {
      setUser({
        id: 1,
        email: target.email,
        fullName: target.name,
        role: roleCode,
      });
      setToken(`mock-token-${roleCode}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
        isManager: user?.role === 'MANAGER',
        isReceptionist: user?.role === 'RECEPTIONIST',
        isMember: user?.role === 'MEMBER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
