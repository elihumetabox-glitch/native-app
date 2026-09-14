import "@/global.css";
import {
  FlatList,
  Image,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {
  HOME_USER,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import { useUser } from "@clerk/expo";
import { useSubscriptions } from "@/lib/subscriptionsStore";
import { posthog } from "@/src/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

/**
 * Renders the home tab with the account summary, upcoming renewals,
 * subscription list, and add-subscription modal.
 */
export default function App() {
  const { subscriptions, addSubscription } = useSubscriptions();

  const { totalBalance, nextRenewalDate } = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.status === "active");
    const total = activeSubscriptions.reduce((sum, s) => sum + s.price, 0);
    const earliestRenewal = activeSubscriptions.reduce((earliest, s) => {
      if (!s.renewalDate) return earliest;
      if (!earliest || dayjs(s.renewalDate).isBefore(dayjs(earliest))) {
        return s.renewalDate;
      }
      return earliest;
    }, null as string | null);
    return { totalBalance: total, nextRenewalDate: earliestRenewal };
  }, [subscriptions]);
  
  const upcomingSubscriptions = useMemo(() => {
    return subscriptions
      .filter(
        (s) =>
          s.status === "active" &&
          s.renewalDate &&
          dayjs(s.renewalDate).diff(dayjs()) > 0
      )
      .map((s) => ({
        id: s.id,
        icon: s.icon,
        name: s.name,
        price: s.price,
        currency: s.currency,
        daysLeft: Math.ceil(dayjs(s.renewalDate).diff(dayjs(), "day", true)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);
  
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useUser();

  const displayName =
    user?.firstName || user?.fullName || HOME_USER.name;
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
        <FlatList
          keyboardDismissMode="on-drag"
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={avatarSource} className="home-avatar" />
                  <Text className="home-user-name">{displayName}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                  accessibilityLabel="Add New Subscription"
                  accessibilityRole="button"
                >
                  <Image source={icons.add} className="home-add-icon" />
                </TouchableOpacity>
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(totalBalance)}
                  </Text>
                  {nextRenewalDate && (
                    <Text className="home-balance-date">
                      {dayjs(nextRenewalDate).format("MM/DD")}
                    </Text>
                  )}
                </View>
              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming" onPress={() => router.push("/(tabs)/insights")} />

                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                />
              </View>

              <ListHeading title="All Subscriptions" onPress={() => router.push("/(tabs)/subscriptions")} />
            </>
          )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
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
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty-state">No subscriptions yet</Text>
          }
          contentContainerClassName="pb-30"
        />

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(newSub) => {
          addSubscription(newSub);
          posthog?.capture("subscription_added", {
            billing: newSub.billing,
            category: newSub.category,
          });
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
