import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff9e3",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#ea7a53",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={icons.logo}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#081126",
                  fontFamily: "sans-extrabold",
                }}
              >
                Recurly
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "rgba(0, 0, 0, 0.6)",
                  fontFamily: "sans-semibold",
                }}
              >
                Subscription Tracker
              </Text>
            </View>
          </View>

          {/* Hero Pitch */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#081126",
              textAlign: "center",
              lineHeight: 40,
              fontFamily: "sans-extrabold",
              marginBottom: 12,
            }}
          >
            Take Control of Your Subscriptions
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "rgba(0, 0, 0, 0.65)",
              textAlign: "center",
              lineHeight: 24,
              fontFamily: "sans-medium",
              maxWidth: 320,
            }}
          >
            Track renewals, discover hidden costs, and optimize your monthly
            spending with effortless clarity.
          </Text>
        </View>

        {/* Value Prop Cards */}
        <View style={{ gap: 14, marginVertical: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff8e7",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
              padding: 16,
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#8fd1bd",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={icons.activity}
                style={{ width: 22, height: 22, tintColor: "#081126" }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#081126",
                  fontFamily: "sans-bold",
                }}
              >
                Renewal Reminders
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.55)",
                  fontFamily: "sans-regular",
                }}
              >
                Never get surprised by unexpected recurring charges.
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff8e7",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
              padding: 16,
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#ea7a53",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={icons.wallet}
                style={{ width: 22, height: 22, tintColor: "#ffffff" }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#081126",
                  fontFamily: "sans-bold",
                }}
              >
                Expense Insights
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.55)",
                  fontFamily: "sans-regular",
                }}
              >
                Categorized breakdowns of your software and service stack.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#ea7a53",
              borderRadius: 18,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.85}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
                fontFamily: "sans-bold",
              }}
            >
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "transparent",
              borderWidth: 1.5,
              borderColor: "rgba(8, 17, 38, 0.2)",
              borderRadius: 18,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text
              style={{
                color: "#081126",
                fontSize: 15,
                fontWeight: "600",
                fontFamily: "sans-semibold",
              }}
            >
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
