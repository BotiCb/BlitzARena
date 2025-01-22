import axios, { AxiosRequestConfig } from "axios";
import AuthService from "../AuthService";

import { API_BASE_URL } from "./Endpoints";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  let token = await AuthService.getTokenAsync();

  if (token && AuthService.isTokenExpired(token)) {
    token = await AuthService.refreshTokenAsync();
  }

  if (token && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

class RestApiService {
  static async get(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<any> {
    const response = await apiClient.get(endpoint, config);
    return response.data;
  }

  static async post(
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    const response = await apiClient.post(endpoint, data, config);
    return response.data;
  }
}

export default RestApiService;
