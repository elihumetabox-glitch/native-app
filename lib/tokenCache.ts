import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { TokenCache } from "@clerk/expo";

const createTokenCache = (): TokenCache | undefined => {
  if (Platform.OS === "web") {
    return undefined;
  }
  return {
    async getToken(key: string) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error("Failed to retrieve token from secure store", error);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error("Failed to save token to secure store", error);
        throw error;
      }
    },
    async clearToken(key: string) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error("Failed to clear token from secure store", error);
        throw error;
      }
    },
  };
};

export const tokenCache = createTokenCache();
