import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Restore session
  React.useEffect(() => {
    const loadUser = async () => {
        try {
            // AsyncStorage is imported in file? No, need to import it.
            // Check imports first.
            const userJson = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem('userToken');
            
            if (userJson && token) {
                setUser(JSON.parse(userJson));
            }
        } catch (e) {
            console.error("Failed to restore auth state", e);
        } finally {
            setLoading(false);
        }
    };
    loadUser();
  }, []);

  const logout = async () => {
    setUser(null);
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
    } catch (e) {
        console.error("Logout failed", e);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
