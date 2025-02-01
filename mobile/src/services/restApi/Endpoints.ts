export const API_BASE_URL = 'http://192.168.0.186:3000';

const ROUTES = {
  AUTH: '/auth',
  USERS: '/users',
  GAME: '/game',
};

export const AUTH_ENDPOINTS = {
  LOGIN: `${ROUTES.AUTH}/login`,
  REGISTER: `${ROUTES.AUTH}/register`,
  LOGOUT: `${ROUTES.AUTH}/logout`,
  REFRESH: `${ROUTES.AUTH}/refresh-token`,
};

export const USER_ENDPOINTS = {
  GET_PROFILE: `${ROUTES.USERS}/profile`,
};

export const GAME_ENDPOINTS = {
  CREATE: `${ROUTES.GAME}/create`,
};
