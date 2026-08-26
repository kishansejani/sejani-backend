import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'family_auth_token';

// Live Render Production Backend URL (Runs 24/7 in cloud independent of laptop)
export const LIVE_BACKEND_URL = 'https://sejani-backend.onrender.com/api';

// For Web testing on localhost, route directly to local Laravel backend (port 8005)
const isLocalWeb = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalWeb 
  ? 'http://localhost:8005/api'
  : (Platform.select({
      web: LIVE_BACKEND_URL,
      android: LIVE_BACKEND_URL,
      ios: LIVE_BACKEND_URL,
      default: LIVE_BACKEND_URL,
    }) || LIVE_BACKEND_URL);

// In-memory token storage fallback for web/testing
let inMemoryToken: string | null = null;

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return inMemoryToken || localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return inMemoryToken;
    }
  },

  async setToken(token: string): Promise<void> {
    inMemoryToken = token;
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to securely store token:', e);
    }
  },

  async removeToken(): Promise<void> {
    inMemoryToken = null;
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to remove token:', e);
    }
  },
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Automatically attach Bearer token
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Global handling for 401 & 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);

export default api;
