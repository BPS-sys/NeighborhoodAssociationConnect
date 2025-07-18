import Constants from 'expo-constants';
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  userName: string | null;
  RegionID: string | null;
  regionName: string | null;
  userRole: string | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [RegionID, setRegionID] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);


  const login = (id: string) => {
    setUserId(id);
    fetchUserInfo(id);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserId(null);
    setIsLoggedIn(false);
  };

  const fetchUserInfo = async (id: string) => {
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/user/${id}/info`, {
        headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
      });
      const data = await res.json();
      setUserName(data.name);
      setRegionID(data.RegionID);
      fetchRegionName(data.RegionID);
      setUserRole(data.role);
      console.log("ユーザー情報を取得しました", data);
      
    } catch (err) {
      console.error("ユーザー情報の取得に失敗しました", err);
    }
  };

  const fetchRegionName = async (regionId: string) => {
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/regions/names`, {
        headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
      });
      const data = await res.json();
      console.log("地域名の取得結果", data);
      const region = data.find((r: any) => r.id === regionId);
      if (region) {
        setRegionName(region.name);
      }
    } catch (err) {
      console.error("地域名の取得に失敗しました", err);
    }
  };


  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, userName, RegionID, regionName, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
