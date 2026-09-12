import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import images from "@/constants/images";
import dayjs from "dayjs";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = !isLoaded
    ? "Loading..."
    : user
    ? user.fullName || user.firstName || "Recurly Member"
    : "Unavailable";

  const emailAddress = !isLoaded
    ? "Loading..."
    : user
    ? user.primaryEmailAddress?.emailAddress || "No email"
    : "Unavailable";

  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  const createdAt = !isLoaded
    ? "Loading..."
    : user
    ? user.createdAt
      ? dayjs(user.createdAt).format("MMMM YYYY")
      : "Unknown"
    : "Unavailable";

  const verificationStatus = !isLoaded
    ? "Loading..."
    : user
    ? user.primaryEmailAddress?.verification?.status === "verified"
      ? "Verified"
      : "Unverified"
    : "Unavailable";

  const performSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err: any) {
      console.error("Sign out error", err);
      Alert.alert(
        "Sign Out Failed",
        err?.message || "Failed to sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Are you sure you want to log out of Recurly?")
      ) {
        performSignOut();
      }
      return;
    }

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Recurly?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: performSignOut,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View className="mb-6">
          <Text className="text-3xl font-sans-extrabold text-primary">
            Settings
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
            Manage your account & subscription preferences
          </Text>
        </View>

        {/* Profile Card */}
        <View
          style={{
            backgroundColor: "#fff8e7",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.08)",
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Image
              source={avatarSource}
              style={{
                width: 68,
                height: 68,
                borderRadius: 22,
                backgroundColor: "#ea7a53",
              }}
            />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#081126",
                    fontFamily: "sans-bold",
                  }}
                >
                  {displayName}
                </Text>
                <View
                  style={{
                    backgroundColor: !isLoaded || !user 
                      ? "rgba(0, 0, 0, 0.05)"
                      : user.primaryEmailAddress?.verification?.status === "verified"
                      ? "rgba(22, 163, 74, 0.12)"
                      : "rgba(234, 179, 8, 0.12)",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: !isLoaded || !user 
                        ? "rgba(0, 0, 0, 0.4)"
                        : user.primaryEmailAddress?.verification?.status === "verified"
                        ? "#16a34a"
                        : "#ca8a04",
                      fontFamily: "sans-bold",
                    }}
                  >
                    {verificationStatus}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  marginTop: 3,
                  fontFamily: "sans-medium",
                }}
              >
                {emailAddress}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(0, 0, 0, 0.4)",
                  marginTop: 4,
                  fontFamily: "sans-regular",
                }}
              >
                Member since {createdAt}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#081126",
              marginBottom: 12,
              fontFamily: "sans-bold",
            }}
          >
            Account Details
          </Text>

          <View
            style={{
              backgroundColor: "#fff8e7",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0, 0, 0, 0.06)",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Full Name
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#081126",
                  fontFamily: "sans-semibold",
                }}
              >
                {displayName}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0, 0, 0, 0.06)",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Primary Email
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#081126",
                  fontFamily: "sans-semibold",
                }}
              >
                {emailAddress}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Verification
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#16a34a",
                  fontFamily: "sans-semibold",
                }}
              >
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#081126",
              marginBottom: 12,
              fontFamily: "sans-bold",
            }}
          >
            Preferences
          </Text>

          <View
            style={{
              backgroundColor: "#fff8e7",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0, 0, 0, 0.06)",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Default Currency
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#081126",
                  fontFamily: "sans-semibold",
                }}
              >
                USD ($)
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Renewal Notifications
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#ea7a53",
                  fontFamily: "sans-semibold",
                }}
              >
                Enabled
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
          style={{
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            borderWidth: 1,
            borderColor: "rgba(220, 38, 38, 0.2)",
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            opacity: signingOut ? 0.6 : 1,
          }}
        >
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text
              style={{
                color: "#dc2626",
                fontSize: 16,
                fontWeight: "700",
                fontFamily: "sans-bold",
              }}
            >
              Log Out
            </Text>
          )}
        </TouchableOpacity>

        {/* Version branding */}
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.4)",
              fontFamily: "sans-medium",
            }}
          >
            Recurly v1.0.0 • Smart Billing
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
