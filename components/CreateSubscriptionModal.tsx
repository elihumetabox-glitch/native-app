import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { icons } from "@/constants/icons";
import {posthog} from "@/src/lib/posthog";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onAdd,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billing, setBilling] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Design");

  const handleSubmit = () => {
    if (!name.trim() || !price.trim()) return;

    const parsedPrice = Number(price.trim());
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return;

    const newSub: Subscription = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing,
      category,
      icon: icons.wallet,
      status: "active",
      startDate: new Date().toISOString(),
      renewalDate: dayjs()
        .add(1, billing === "Monthly" ? "month" : "year")
        .toISOString(),
      color: "#f5c542",
    };

    onAdd(newSub);

    if (posthog) {
      posthog.capture('subscription_created', {
        subscription_frequency: billing,
        subscription_category: category,
      });
    }

    setName("");
    setPrice("");
    setBilling("Monthly");
    setCategory("Design");
    onClose();
  };

  const parsedPrice = Number(price);
  const isFormValid = name.trim() !== "" && Number.isFinite(parsedPrice) && parsedPrice > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="modal-overlay"
      >
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity
              onPress={onClose}
              className="modal-close"
              activeOpacity={0.7}
            >
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="modal-body" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View className="auth-field">
              <Text className="auth-label">Subscription Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix, Figma"
                placeholderTextColor="rgba(0,0,0,0.35)"
                className="auth-input"
              />
            </View>

            {/* Price */}
            <View className="auth-field">
              <Text className="auth-label">Price (USD)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 14.99"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            {/* Billing Cycle */}
            <View className="auth-field">
              <Text className="auth-label">Billing Cycle</Text>
              <View className="picker-row">
                <TouchableOpacity
                  onPress={() => setBilling("Monthly")}
                  className={clsx("picker-option", billing === "Monthly" && "picker-option-active")}
                  activeOpacity={0.7}
                >
                  <Text className={clsx("picker-option-text", billing === "Monthly" && "picker-option-text-active")}>
                    Monthly
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setBilling("Yearly")}
                  className={clsx("picker-option", billing === "Yearly" && "picker-option-active")}
                  activeOpacity={0.7}
                >
                  <Text className={clsx("picker-option-text", billing === "Yearly" && "picker-option-text-active")}>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category */}
            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx("category-chip", isSelected && "category-chip-active")}
                      activeOpacity={0.7}
                    >
                      <Text className={clsx("category-chip-text", isSelected && "category-chip-text-active")}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid}
              className={clsx("auth-button", !isFormValid && "auth-button-disabled")}
              activeOpacity={0.85}
            >
              <Text className="auth-button-text">Add Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
