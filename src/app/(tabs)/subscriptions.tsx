import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useRouter } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

type FilterStatus = "all" | "active" | "paused" | "cancelled";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    return HOME_SUBSCRIPTIONS.filter((sub) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.category &&
          sub.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalMonthlySpend = useMemo(() => {
    return HOME_SUBSCRIPTIONS.filter((s) => s.status === "active").reduce(
      (acc, s) => {
        if (s.billing === "Monthly") return acc + s.price;
        if (s.billing === "Yearly") return acc + s.price / 12;
        return acc + s.price;
      },
      0
    );
  }, []);

  const activeCount = HOME_SUBSCRIPTIONS.filter(
    (s) => s.status === "active"
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={() => (
          <View className="mb-4">
            {/* Header Title */}
            <View className="mb-4">
              <Text className="text-3xl font-sans-extrabold text-primary">
                Subscriptions
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                {activeCount} active subscriptions • {formatCurrency(totalMonthlySpend)}/mo
              </Text>
            </View>

            {/* Spend Summary Banner */}
            <View
              style={{
                backgroundColor: "#fff8e7",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
                padding: 16,
                marginBottom: 16,
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
                    color: "rgba(0,0,0,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontFamily: "sans-semibold",
                  }}
                >
                  Monthly Active Total
                </Text>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "800",
                    color: "#081126",
                    fontFamily: "sans-extrabold",
                    marginTop: 2,
                  }}
                >
                  {formatCurrency(totalMonthlySpend)}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(234, 122, 83, 0.12)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#ea7a53",
                    fontFamily: "sans-bold",
                  }}
                >
                  {HOME_SUBSCRIPTIONS.length} Total
                </Text>
              </View>
            </View>

            {/* Search Input */}
            <View className="mb-4">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions or category..."
                placeholderTextColor="rgba(0,0,0,0.4)"
                style={{
                  backgroundColor: "#fff8e7",
                  borderWidth: 1,
                  borderColor: "rgba(0, 0, 0, 0.08)",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: "#081126",
                  fontFamily: "sans-medium",
                }}
              />
            </View>

            {/* Status Filter Chips */}
            <View className="flex-row gap-2 mb-4">
              {FILTERS.map((f) => {
                const isActive = statusFilter === f.value;
                return (
                  <TouchableOpacity
                    key={f.value}
                    onPress={() => setStatusFilter(f.value)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive
                        ? "#ea7a53"
                        : "rgba(0, 0, 0, 0.1)",
                      backgroundColor: isActive
                        ? "rgba(234, 122, 83, 0.12)"
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        fontFamily: "sans-semibold",
                        color: isActive ? "#ea7a53" : "rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-base font-sans-medium text-muted-foreground text-center">
              No subscriptions found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
