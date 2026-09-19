'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoginModalOpen: boolean;
  isAddEventModalOpen: boolean;
  userEmail: string;
  setUserEmail: (email: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openAddEventModal: () => void;
  closeAddEventModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoginModalOpen: false,
  isAddEventModalOpen: false,
  userEmail: '',
  setUserEmail: () => {},
  login: () => false,
  logout: () => {},
  openLoginModal: () => {},
  closeLoginModal: () => {},
  openAddEventModal: () => {},
  closeAddEventModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [userEmail, setUserEmailState] = useState<string>('yourname@gmail.com');

  useEffect(() => {
    const saved = localStorage.getItem('isLoggedIn');
    if (saved === 'true') {
      setIsLoggedIn(true);
    }
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmailState(savedEmail);
    }
  }, []);

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('userEmail', email);
  };

  // Change these values to update the portal credentials.
  const PORTAL_USERNAME = 'admin';
  const PORTAL_PASSWORD = 'aws-atm';

  const login = (username: string, password: string): boolean => {
    if (username.trim() === PORTAL_USERNAME && password === PORTAL_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    setIsAddEventModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openAddEventModal = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsAddEventModalOpen(true);
  };

  const closeAddEventModal = () => setIsAddEventModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoginModalOpen,
        isAddEventModalOpen,
        userEmail,
        setUserEmail,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        openAddEventModal,
        closeAddEventModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
