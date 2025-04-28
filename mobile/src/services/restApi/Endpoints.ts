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
  GET_PLAYERS_IN_GAME: (gameId: string) => `${ROUTES.USERS}/ingameinfo/${gameId}`,
  GET_PLAYER_BY_SESSION_ID: (sessionId: string) =>
    `${ROUTES.USERS}/ingameinfo/session-id/${sessionId}`,
  UPDATE_PROFILE: `${ROUTES.USERS}`,
};

export const GAME_ENDPOINTS = {
  CREATE: `${ROUTES.GAME}/create`,
  JOIN: (gameId: string) => `${ROUTES.GAME}/${gameId}/join`,
  GET_TF_LITE_MODEL: (gameId: string) => `${ROUTES.GAME}/${gameId}/tflite-model`,
};

export const MODEL_TRAINING_ENDPOINTS = {
  UPLOAD_PHOTO: (gameId: string) => `${ROUTES.GAME}/${gameId}/model-training/upload-photo`,
};
