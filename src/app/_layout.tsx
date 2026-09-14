import { SplashScreen, Stack } from "expo-router";
import "@/global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ClerkProvider, useUser } from "@clerk/expo";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";
import { posthog } from "@/src/lib/posthog";
import { tokenCache } from "@/lib/tokenCache";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

function PostHogErrorFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-center font-sans-bold text-lg text-black">
        Something went wrong. Please restart the app.
      </Text>
    </View>
  );
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const [lastUserId, setLastUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    if (user?.id) {
      const personProperties: Record<string, string> = {};
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName || user.firstName;

      if (email) personProperties.email = email;
      if (name) personProperties.name = name;

      posthog?.identify(user.id, { $set: personProperties });
    } else if (lastUserId) {
      posthog?.reset();
    }

    setLastUserId(user?.id);
  }, [isLoaded, user?.id]);

  return null;
}

/**
 * Loads the application fonts and renders the route stack inside the Clerk and
 * optional PostHog providers. Font-loading errors are rethrown.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const content = <Stack screenOptions={{headerShown: false}}/>;

  return (
    <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider
            client={posthog}>
          <PostHogErrorBoundary fallback={PostHogErrorFallback}>
            <PostHogIdentity />
            {content}
          </PostHogErrorBoundary>
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
