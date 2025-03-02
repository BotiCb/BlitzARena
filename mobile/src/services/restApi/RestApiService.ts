import axios from 'axios';

import AuthService from '../AuthService';

import { API_BASE_URL } from '~/utils/constants/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  let token = await AuthService.getTokenAsync();
  if (token) {
    if (AuthService.isTokenExpired(token)) {
      try {
        token = await AuthService.refreshTokenAsync();
        console.warn('JWT Token refreshed');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const refreshTokenApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

refreshTokenApiClient.interceptors.request.use(async (config) => {
  const token = await AuthService.getRefreshTokenAsync();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
