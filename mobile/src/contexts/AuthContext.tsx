import React, { createContext, useContext, useEffect, useState } from 'react';

import AuthService from '~/services/AuthService';
import { UserInfoResponseDto } from '~/utils/types';

interface AuthContextType {
  userInfo: UserInfoResponseDto | null;
  isLoggedIn: boolean;
  refreshAuthContext: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfoResponseDto | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuthContext = async () => {
      setIsLoading(true);
      if (await AuthService.isLoggedIn()) {
        const user = await AuthService.getUserInfo();
        setUserInfo(user);
        setIsLoggedIn(!!user);
      }
      setIsLoading(false);
    };

    initializeAuthContext();

    const handleUserInfoChange = (userInfo: UserInfoResponseDto | null) => {
      setUserInfo(userInfo);
      setIsLoggedIn(!!userInfo);
    };

    AuthService.onUserInfoChange(handleUserInfoChange);

    return () => {
      AuthService.offUserInfoChange(handleUserInfoChange);
    };
  }, []);

  const refreshAuthContext = async () => {
    setIsLoading(true);
    const user = await AuthService.getUserInfo();
    setUserInfo(user);
    setIsLoggedIn(!!user);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ userInfo, isLoggedIn, refreshAuthContext, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
