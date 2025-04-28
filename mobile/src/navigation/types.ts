export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
};
export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

export type AppStackParamList = {
  CreateGame: undefined;
  Home: undefined;
  GameStack: {
    gameId: string;
    userSessionId: string;
  };
  JoinGame: undefined;
  Profile: undefined;
};

// types.ts
export type GameStackParamList = {
  GameMain: undefined; // Add this
  Loading: undefined;
  Lobby: undefined;
};
