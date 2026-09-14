import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // The splash pattern image is 440 x 551
  const imageWidth = Math.min(width, 440);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      {/* Top Graphic Area matching 440 x 551 dimension */}
      <View style={styles.imageWrapper}>
        <Image
          source={require("@/assets/images/splash-pattern.png")}
          style={[
            styles.splashImage,
            {
              width: imageWidth,
              height: (imageWidth * 551) / 440,
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Content Area */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Gain Financial Clarity
          </Text>
          <Text style={styles.subtitle}>
            Track, analyze and cancel with ease
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/sign-up")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ea7a53",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  splashImage: {
    maxWidth: 440,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  textContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    fontFamily: "sans-extrabold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: "sans-medium",
    textAlign: "center",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#ffffff",
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#081126",
    fontFamily: "sans-bold",
  },
});
