import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from '../api/axios';
import storage from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Register push notifications when user is authenticated
  useEffect(() => {
    if (token && user) {
      registerPushNotifications();
    }
  }, [token, user]);

  const registerPushNotifications = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        // Upload token to backend profile
        await api.put('/auth/profile', { fcmToken: pushToken });
        console.log('Push token uploaded successfully:', pushToken);
      }
    } catch (err) {
      console.error('Error registering push notifications:', err);
    }
  };

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verify token is still valid
        try {
          const response = await api.get('/auth/me');
          if (response.data?.user) {
            setUser(response.data.user);
            await storage.setUser(response.data.user);
          }
        } catch {
          // Token expired, clear auth
          await logout();
        }
      }
    } catch (e) {
      console.error('Error loading auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);

      await storage.setToken(newToken);
      await storage.setUser(userData);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      setUser(newUser);

      await storage.setToken(newToken);
      await storage.setUser(newUser);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await storage.clearAll();
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await api.put('/auth/profile', updatedData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      await storage.setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      const { token: newToken } = response.data;
      setToken(newToken);
      await storage.setToken(newToken);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (err) {
      console.log('Error fetching Expo push token:', err.message);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

export default AuthContext;
