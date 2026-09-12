import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { useSubscriptions } from "@/lib/subscriptionsStore";

export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions, updateSubscription } = useSubscriptions();

  const sub = subscriptions.find((s) => s.id === id);

  if (!sub) {
    return <Redirect href="/(tabs)" />;
  }

  const currentStatus = sub.status || "active";

  const handleToggleStatus = () => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateSubscription(sub.id, {
      status: newStatus,
    });
    Alert.alert(
      "Status Updated",
      `Subscription status changed to ${formatStatusLabel(newStatus)}.`
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel ${sub.name}?`,
      [
        { text: "No, Keep It", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            updateSubscription(sub.id, { status: "cancelled" });
            Alert.alert(
              "Subscription Cancelled",
              `${sub.name} has been marked as cancelled.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: "#fff8e7",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#081126",
                fontFamily: "sans-semibold",
              }}
            >
              ← Back
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#081126",
              fontFamily: "sans-bold",
            }}
          >
            Subscription Details
          </Text>

          <View style={{ width: 60 }} />
        </View>

        {/* Hero Card */}
        <View
          style={{
            backgroundColor: "#fff8e7",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.08)",
            padding: 24,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {sub.icon && (
            <Image
              source={sub.icon}
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                marginBottom: 12,
              }}
              resizeMode="contain"
            />
          )}

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#081126",
              fontFamily: "sans-bold",
              textAlign: "center",
            }}
          >
            {sub.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "rgba(0,0,0,0.6)",
              fontFamily: "sans-medium",
              marginTop: 2,
            }}
          >
            {sub.plan || sub.category}
          </Text>

          {/* Status Badge */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 10,
              backgroundColor:
                currentStatus === "active"
                  ? "rgba(22, 163, 74, 0.12)"
                  : currentStatus === "paused"
                  ? "rgba(234, 122, 83, 0.15)"
                  : "rgba(220, 38, 38, 0.12)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                fontFamily: "sans-bold",
                color:
                  currentStatus === "active"
                    ? "#16a34a"
                    : currentStatus === "paused"
                    ? "#ea7a53"
                    : "#dc2626",
              }}
            >
              {formatStatusLabel(currentStatus)}
            </Text>
          </View>
        </View>

        {/* Pricing Card */}
        <View
          style={{
            backgroundColor: "#ea7a53",
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.8)",
                textTransform: "uppercase",
                letterSpacing: 1,
                fontFamily: "sans-semibold",
              }}
            >
              Recurring Amount
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "#ffffff",
                fontFamily: "sans-extrabold",
                marginTop: 2,
              }}
            >
              {formatCurrency(sub.price, sub.currency)}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#ffffff",
                fontFamily: "sans-bold",
              }}
            >
              {sub.billing}
            </Text>
          </View>
        </View>

        {/* Details Table */}
        <View
          style={{
            backgroundColor: "#fff8e7",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            marginBottom: 24,
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
              Category
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#081126",
                fontFamily: "sans-semibold",
              }}
            >
              {sub.category || "General"}
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
              Payment Method
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#081126",
                fontFamily: "sans-semibold",
              }}
            >
              {sub.paymentMethod || "Default Card"}
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
              Start Date
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#081126",
                fontFamily: "sans-semibold",
              }}
            >
              {sub.startDate
                ? formatSubscriptionDateTime(sub.startDate)
                : "N/A"}
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
              Next Renewal
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#081126",
                fontFamily: "sans-semibold",
              }}
            >
              {sub.renewalDate
                ? formatSubscriptionDateTime(sub.renewalDate)
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          {currentStatus !== "cancelled" && (
            <TouchableOpacity
              onPress={handleToggleStatus}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#fff8e7",
                borderWidth: 1,
                borderColor: "rgba(0, 0, 0, 0.12)",
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#081126",
                  fontSize: 15,
                  fontWeight: "700",
                  fontFamily: "sans-bold",
                }}
              >
                {currentStatus === "active"
                  ? "Pause Subscription"
                  : "Resume Subscription"}
              </Text>
            </TouchableOpacity>
          )}

          {currentStatus !== "cancelled" && (
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.8}
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(220, 38, 38, 0.2)",
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#dc2626",
                  fontSize: 15,
                  fontWeight: "700",
                  fontFamily: "sans-bold",
                }}
              >
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
