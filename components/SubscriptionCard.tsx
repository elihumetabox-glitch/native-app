import { View, Text, Image, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { clsx } from "clsx";
import { icons } from "@/constants/icons";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  startDate,
  status,
  onCancelPress,
  isCancelling,
  onChangePlanPress,
}: SubscriptionCardProps) => {
  const fallBack = "Not provided";
  const resolvedIcon =
    typeof icon === "string" ? { uri: icon } : icon || icons.wallet;

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={resolvedIcon} className="sub-icon" resizeMode="contain" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment info:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  *****8530
                </Text>
              </View>
              <TouchableOpacity className="list-action">
                <Text className="text-sm font-sans-semibold text-primary">
                  Manage
                </Text>
              </TouchableOpacity>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Plan details:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  {plan || fallBack}
                </Text>
              </View>
              <TouchableOpacity className="list-action" onPress={onChangePlanPress}>
                <Text className="text-sm font-sans-semibold text-primary">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {category?.trim() || plan?.trim() || fallBack}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {startDate
                    ? formatSubscriptionDateTime(startDate)
                    : fallBack}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal Date:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : fallBack}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : fallBack}
                </Text>
              </View>
            </View>
          </View>
          {onCancelPress && status !== "cancelled" && (
            <TouchableOpacity
              onPress={onCancelPress}
              disabled={isCancelling}
              className="mt-4 bg-red-100 p-3 rounded-xl items-center"
            >
              <Text className="text-red-500 font-bold">
                {isCancelling ? "Cancelling..." : "Cancel Subscription"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
