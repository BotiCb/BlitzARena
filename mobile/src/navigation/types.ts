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
};

export type GameStackParamList = {
  Loading: undefined;
  Lobby: undefined;
};
