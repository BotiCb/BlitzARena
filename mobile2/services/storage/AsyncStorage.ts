import AsyncStorage from "@react-native-async-storage/async-storage";

import { IStorage, StorageKey } from "./IStorage";

export const AsyncStore: IStorage = {
  getItemAsync: async (key: StorageKey): Promise<string | null> => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  setItemAsync: async (key: StorageKey, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(error);
    }
  },
  deleteItemAsync: async (key: StorageKey): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  },
};
