import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@ps_auth_token',
  USER: '@ps_user_data',
  ONBOARDED: '@ps_onboarded',
  LANGUAGE: '@ps_language',
};

export const storage = {
  // Token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  setToken: async (token) => {
    try {
      await AsyncStorage.setItem(KEYS.TOKEN, token);
    } catch (e) {
      console.error('Error saving token:', e);
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.TOKEN);
    } catch (e) {
      console.error('Error removing token:', e);
    }
  },

  // User
  getUser: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (e) {
      console.error('Error removing user:', e);
    }
  },

  // Clear all
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};

export default storage;
