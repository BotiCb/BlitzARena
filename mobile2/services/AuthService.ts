import { jwtDecode } from "jwt-decode";
import RestApiService from "./restApi/RestApiService";
import { SecureStore } from "./storage/SecoreStore";
import { AUTH_ENDPOINTS } from "./restApi/Endpoints";

interface JwtPayload {
  exp: number;
}

class AuthService {
  static async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync("jwtToken");
    if (!token) {
      return false;
    }
    return true;
  }

  static isTokenExpired(token: string): boolean {
    const { exp } = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return exp <= currentTime;
  }

  static async getTokenAsync(): Promise<string | null> {
    return SecureStore.getItemAsync("jwtToken");
  }

  static async refreshTokenAsync(): Promise<string | null> {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await RestApiService.post(AUTH_ENDPOINTS.REFRESH, {
      Headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.status !== 200) {
      return null;
    }
    await SecureStore.setItemAsync("jwtToken", response.access_token);
    await SecureStore.setItemAsync("refreshToken", response.refresh_token);

    return response.access_token;
  }

  static async logout(): Promise<Boolean> {
    const token = await SecureStore.getItemAsync("jwtToken");
    const response = await RestApiService.post(AUTH_ENDPOINTS.LOGOUT, {
      token,
    });
    if (response.status !== 200) {
      return false;
    }
    await SecureStore.deleteItemAsync("jwtToken");
    await SecureStore.deleteItemAsync("refreshToken");

    return true;
  }

  static async login(email: string, password: string): Promise<boolean> {
    const response = await RestApiService.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    if (response.status !== 200) {
      return false;
    }
    await SecureStore.setItemAsync("jwtToken", response.access_token);
    await SecureStore.setItemAsync("refreshToken", response.refresh_token);
    return true;
  }
}
export default AuthService;
