import "@/global.css";
import {
  FlatList,
  Image,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
import { useUser } from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const CATEGORIES = [
  "Design",
  "Developer Tools",
  "AI Tools",
  "Entertainment",
  "Productivity",
];

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    HOME_SUBSCRIPTIONS
  );
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  // New Subscription Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billing, setBilling] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Design");
  const [paymentMethod, setPaymentMethod] = useState("Visa ending in 4242");

  const { user } = useUser();

  const displayName =
    user?.firstName || user?.fullName || HOME_USER.name;
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  const handleAddSubscription = () => {
    if (!name.trim() || !price.trim()) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const newSub: Subscription = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing,
      category,
      paymentMethod,
      icon: icons.wallet,
      status: "active",
      startDate: new Date().toISOString(),
      renewalDate: dayjs().add(1, billing === "Monthly" ? "month" : "year").toISOString(),
      color: "#f5c542",
    };

    setSubscriptions([newSub, ...subscriptions]);
    setName("");
    setPrice("");
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
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
              >
                <Image source={icons.add} className="home-add-icon" />
              </TouchableOpacity>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
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

      {/* Add Subscription Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="modal-overlay"
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="modal-close"
                activeOpacity={0.7}
              >
                <Text className="modal-close-text">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="modal-body" showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View className="gap-2">
                <Text className="text-sm font-sans-semibold text-primary">
                  Subscription Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix, Figma"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-base font-sans-medium text-primary"
                />
              </View>

              {/* Price & Currency */}
              <View className="gap-2">
                <Text className="text-sm font-sans-semibold text-primary">
                  Price (USD)
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 14.99"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="decimal-pad"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-base font-sans-medium text-primary"
                />
              </View>

              {/* Billing Cycle */}
              <View className="gap-2">
                <Text className="text-sm font-sans-semibold text-primary">
                  Billing Cycle
                </Text>
                <View className="picker-row">
                  <TouchableOpacity
                    onPress={() => setBilling("Monthly")}
                    className={`picker-option ${
                      billing === "Monthly" ? "picker-option-active" : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`picker-option-text ${
                        billing === "Monthly"
                          ? "picker-option-text-active"
                          : ""
                      }`}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setBilling("Yearly")}
                    className={`picker-option ${
                      billing === "Yearly" ? "picker-option-active" : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`picker-option-text ${
                        billing === "Yearly"
                          ? "picker-option-text-active"
                          : ""
                      }`}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View className="gap-2">
                <Text className="text-sm font-sans-semibold text-primary">
                  Category
                </Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={`category-chip ${
                          isSelected ? "category-chip-active" : ""
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`category-chip-text ${
                            isSelected ? "category-chip-text-active" : ""
                          }`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleAddSubscription}
                className="my-4 items-center rounded-2xl bg-accent py-4"
                activeOpacity={0.85}
              >
                <Text className="text-base font-sans-bold text-white">
                  Add Subscription
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
