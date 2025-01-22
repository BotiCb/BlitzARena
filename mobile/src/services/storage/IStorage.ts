export type StorageKey = 'jwtToken' | 'refreshToken' | 'userInfo';

export interface IStorage {
  getItemAsync: (key: StorageKey) => Promise<string | null>;
  setItemAsync: (key: StorageKey, value: string) => Promise<void>;
  deleteItemAsync: (key: StorageKey) => Promise<void>;
}
