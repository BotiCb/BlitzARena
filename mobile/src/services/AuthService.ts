import { AxiosResponse } from 'axios';
import { EventEmitter } from 'eventemitter3';
import { jwtDecode } from 'jwt-decode';

import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './restApi/Endpoints';
import { apiClient, refreshTokenApiClient } from './restApi/RestApiService';
import { LoginResponse, LoginResponseType, UserInfoResponseDto } from './restApi/dto/response.dto';
import { AsyncStore } from './storage/AsyncStorage';
import { SecureStore } from './storage/SecoreStore';

interface JwtPayload {
  exp: number;
}

const userStateChangeEventEmitter = new EventEmitter();

class AuthService {
  static async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('jwtToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    return !!token && !!refreshToken;
  }

  static async getCurrentUser(): Promise<UserInfoResponseDto | null> {
    try {
      const userInfoString = await AsyncStore.getItemAsync('userInfo');
      if (userInfoString) {
        return JSON.parse(userInfoString) as UserInfoResponseDto;
      } else {
        return null;
      }
    } catch (err: any) {
      console.log(err.response.status);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const { exp } = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return exp <= currentTime;
  }

  static async getTokenAsync(): Promise<string | null> {
    return SecureStore.getItemAsync('jwtToken');
  }

  static async getRefreshTokenAsync(): Promise<string | null> {
    return SecureStore.getItemAsync('refreshToken');
  }

  static async refreshTokenAsync(): Promise<string | null> {
    try {
      const response: AxiosResponse = await refreshTokenApiClient.post(AUTH_ENDPOINTS.REFRESH);
      await SecureStore.setItemAsync('jwtToken', response.data.access_token);
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);

      return response.data.access_token;
    } catch (err: any) {
      console.error(err.status);
      this.deleteUserData();
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);

      this.deleteUserData();
    } catch (err: any) {
      console.log(err.response.status);
    }
  }

  static async login(email: string, password: string): Promise<LoginResponseType> {
    if (!email || !password) {
      return LoginResponse.EMPTY_INPUT;
    }

    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      if (response.status === 200 && response.data?.access_token && response.data?.refresh_token) {
        await SecureStore.setItemAsync('jwtToken', response.data.access_token);
        await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);

        const userResponse: UserInfoResponseDto = (await apiClient.get(USER_ENDPOINTS.GET_PROFILE))
          .data;
        await AsyncStore.setItemAsync('userInfo', JSON.stringify(userResponse));

        userStateChangeEventEmitter.emit('userInfo', userResponse);

        return userResponse;
      }

      return LoginResponse.SERVER_ERROR;
    } catch (err: any) {
      console.log(err.response.status);

      if (err.response) {
        switch (err.response.status) {
          case 400:
            return LoginResponse.INVALID_INPUT;
          case 401:
            return LoginResponse.WRONG_CREDENTIALS;
          default:
            return LoginResponse.SERVER_ERROR;
        }
      }

      return LoginResponse.SERVER_ERROR;
    }
  }

  static async getUserInfo(): Promise<UserInfoResponseDto | null> {
    const userInfoString = await AsyncStore.getItemAsync('userInfo');
    return userInfoString ? JSON.parse(userInfoString) : null;
  }

  private static async deleteUserData(): Promise<void> {
    await SecureStore.deleteItemAsync('jwtToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStore.deleteItemAsync('userInfo');
    userStateChangeEventEmitter.emit('userInfo', null);
  }

  static onUserInfoChange(listener: (userInfo: UserInfoResponseDto | null) => void): void {
    userStateChangeEventEmitter.on('userInfo', listener);
  }

  static offUserInfoChange(listener: (userInfo: UserInfoResponseDto | null) => void): void {
    userStateChangeEventEmitter.off('userInfo', listener);
  }
}

export default AuthService;
