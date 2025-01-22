import * as Store from 'expo-secure-store';

import { IStorage, StorageKey } from './IStorage';

export const SecureStore: IStorage = {
  getItemAsync: async (key: StorageKey): Promise<string | null> => {
    try {
      const item = await Store.getItemAsync(key, { keychainAccessible: Store.AFTER_FIRST_UNLOCK });
      return item;
    } catch (error) {
      console.error(error);
    }
    return null;
  },

  setItemAsync: async (key: StorageKey, value: string): Promise<void> => {
    try {
      await Store.setItemAsync(key, value, { keychainAccessible: Store.AFTER_FIRST_UNLOCK });
    } catch (error) {
      console.error(error);
    }
  },

  deleteItemAsync: async (key: StorageKey): Promise<void> => {
    try {
      await Store.deleteItemAsync(key);
    } catch (error) {
      console.error(error);
    }
  },
};
