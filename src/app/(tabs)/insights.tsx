import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from "nativewind";
import BarChart from "@/components/BarChart";
import { router } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

export default function InsightsScreen() {
  const chartData = [
    { day: 'Mon', value: 35 },
    { day: 'Tue', value: 30 },
    { day: 'Wed', value: 22 },
    { day: 'Thr', value: 40, isHighlight: true },
    { day: 'Fri', value: 33 },
    { day: 'Sat', value: 18 },
    { day: 'Sun', value: 24 },
  ];

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
        <View className="mb-6 items-center">
            <Text className="text-xl font-bold">Monthly Insights</Text>
        </View>

        <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">Upcoming</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/insights")}>
                    <Text className="text-gray-500">View all</Text>
                </TouchableOpacity>
            </View>
            <BarChart data={chartData} />
        </View>

        <View className="bg-orange-50 rounded-2xl p-5 mb-6">
             <Text className="text-gray-500 mb-1">Expenses</Text>
             <Text className="text-3xl font-bold mb-1">-$424.63</Text>
             <View className="flex-row justify-between">
                <Text className="text-gray-500">March 2026</Text>
                <Text className="text-green-500 font-bold">+12%</Text>
             </View>
        </View>

        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">History</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/subscriptions")}>
                <Text className="text-gray-500">View all</Text>
            </TouchableOpacity>
        </View>

        <View className="bg-yellow-200 rounded-2xl p-4 mb-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-full mr-3" />
                <View>
                    <Text className="font-bold">Claude</Text>
                    <Text className="text-gray-500 text-xs">June 25, 12:00</Text>
                </View>
            </View>
            <Text className="font-bold">$9.84</Text>
        </View>

        <View className="bg-teal-200 rounded-2xl p-4 mb-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-full mr-3" />
                <View>
                    <Text className="font-bold">Canva</Text>
                    <Text className="text-gray-500 text-xs">June 30, 16:00</Text>
                </View>
            </View>
            <Text className="font-bold">$43.89</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
