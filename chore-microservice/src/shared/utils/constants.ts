import { config } from "../config/config";

export const FASTAPI_BASE_URL = config.get('serviceUrls.gameSessionServiceUrl');
export const MODEL_TRAINING_API_BASE_URL = config.get('serviceUrls.modelTrainingServiceUrl');
