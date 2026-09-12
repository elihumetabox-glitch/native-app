import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";

const SafeAreaView = styled(RNSafeAreaView);

export default function InsightsScreen() {
  // Compute monthly, yearly, and category stats
  const { totalMonthly, totalYearly, categoryStats, highestSub } =
    useMemo(() => {
      let monthly = 0;
      const categories: { [cat: string]: number } = {};
      let highest = HOME_SUBSCRIPTIONS[0];

      HOME_SUBSCRIPTIONS.forEach((sub) => {
        const cost =
          sub.billing === "Yearly" ? sub.price / 12 : sub.price;

        if (sub.status === "active") {
          monthly += cost;
          const cat = sub.category || "Other";
          categories[cat] = (categories[cat] || 0) + cost;

          if (cost > (highest?.price || 0)) {
            highest = sub;
          }
        }
      });

      const catList = Object.entries(categories).map(([name, amount]) => ({
        name,
        amount,
        percent: monthly > 0 ? Math.round((amount / monthly) * 100) : 0,
      }));

      return {
        totalMonthly: monthly,
        totalYearly: monthly * 12,
        categoryStats: catList,
        highestSub: highest,
      };
    }, []);

  const categoryColors: { [key: string]: string } = {
    Design: "#ea7a53",
    "Developer Tools": "#8fd1bd",
    "AI Tools": "#f5c542",
    Other: "#b8d4e3",
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View className="mb-6">
          <Text className="text-3xl font-sans-extrabold text-primary">
            Insights
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
            Visual breakdown of your recurring commitments
          </Text>
        </View>

        {/* Projected Spend Card */}
        <View
          style={{
            backgroundColor: "#fff8e7",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.08)",
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "rgba(0,0,0,0.5)",
              textTransform: "uppercase",
              letterSpacing: 1,
              fontFamily: "sans-semibold",
              marginBottom: 12,
            }}
          >
            Projected Commitments
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Monthly Run Rate
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
                {formatCurrency(totalMonthly)}
              </Text>
            </View>

            <View style={{ width: 1, height: 40, backgroundColor: "rgba(0,0,0,0.1)" }} />

            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(0,0,0,0.6)",
                  fontFamily: "sans-medium",
                }}
              >
                Yearly Estimate
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  color: "#ea7a53",
                  fontFamily: "sans-extrabold",
                  marginTop: 2,
                }}
              >
                {formatCurrency(totalYearly)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#081126",
              marginBottom: 12,
              fontFamily: "sans-bold",
            }}
          >
            Spend by Category
          </Text>

          <View
            style={{
              backgroundColor: "#fff8e7",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.08)",
              padding: 16,
              gap: 16,
            }}
          >
            {categoryStats.map((item) => {
              const color = categoryColors[item.name] || "#ea7a53";
              return (
                <View key={item.name} style={{ gap: 6 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: color,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#081126",
                          fontFamily: "sans-semibold",
                        }}
                      >
                        {item.name}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: "#081126",
                        fontFamily: "sans-bold",
                      }}
                    >
                      {formatCurrency(item.amount)} ({item.percent}%)
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "rgba(0,0,0,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${item.percent}%`,
                        backgroundColor: color,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Highest Expense Highlight */}
        {highestSub && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#081126",
                marginBottom: 12,
                fontFamily: "sans-bold",
              }}
            >
              Highest Single Expense
            </Text>

            <View
              style={{
                backgroundColor: "#fff8e7",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(0, 0, 0, 0.08)",
                padding: 18,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#081126",
                    fontFamily: "sans-bold",
                  }}
                >
                  {highestSub.name}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(0,0,0,0.55)",
                    fontFamily: "sans-medium",
                    marginTop: 2,
                  }}
                >
                  {highestSub.plan || highestSub.category} • {highestSub.billing}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#ea7a53",
                  fontFamily: "sans-extrabold",
                }}
              >
                {formatCurrency(highestSub.price, highestSub.currency)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
