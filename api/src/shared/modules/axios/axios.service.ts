import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { config } from 'src/shared/config/config';
import { FASTAPI_BASE_URL, MODEL_TRAINING_API_BASE_URL } from 'src/shared/utils/constants';

@Injectable()
export class AxiosService {
  apiClient = axios.create({
    baseURL: FASTAPI_BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });


  modelTrainingApiClient = axios.create({
    baseURL: MODEL_TRAINING_API_BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  constructor(private jwtService: JwtService) {
    this.apiClient.interceptors.request.use(async (config) => {
      let token = await this.createToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.modelTrainingApiClient.interceptors.request.use(async (config) => {
      let token = await this.createToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    })
  }

  private async createToken(): Promise<string> {
    return await this.jwtService.signAsync(
      { service: 'nestJs' },
      {
        expiresIn: '15m',
        secret: config.get('auth.servicejwtSecret'),
      }
    );
  }
}
