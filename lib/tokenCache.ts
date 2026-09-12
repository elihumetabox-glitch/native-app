import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { TokenCache } from "@clerk/expo";

const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string) {
      try {
        if (Platform.OS === "web") {
          if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage.getItem(key);
          }
          return null;
        }
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error("Failed to retrieve token from secure store", error);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        if (Platform.OS === "web") {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
          return;
        }
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error("Failed to save token to secure store", error);
      }
    },
    async clearToken(key: string) {
      try {
        if (Platform.OS === "web") {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.removeItem(key);
          }
          return;
        }
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error("Failed to clear token from secure store", error);
      }
    },
  };
};

export const tokenCache = createTokenCache();
