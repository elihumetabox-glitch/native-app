import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSignUp, useAuth } from "@clerk/expo";
import { icons } from "@/constants/icons";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { isLoaded } = useAuth();

  // Registration step: 'form' | 'verification'
  const [step, setStep] = useState<"form" | "verification">("form");

  // Form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Verification code input
  const [verificationCode, setVerificationCode] = useState("");

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    verificationCode?: string;
  }>({});

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp.password({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
        return;
      }

      // If sign-up is already complete without verification
      if (signUp.status === "complete") {
        await signUp.finalize();
        router.replace("/(tabs)");
        return;
      }

      // Send email verification code
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(sendRes.error));
        return;
      }

      setStep("verification");
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setFieldErrors({
        verificationCode: "Please enter the 6-digit verification code.",
      });
      return;
    }

    if (!isLoaded || !signUp) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const verifyRes = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (verifyRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(verifyRes.error));
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize();
        router.replace("/(tabs)");
      } else {
        setErrorMessage(
          "Verification was incomplete. Please check the code and try again."
        );
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !isLoaded || !signUp) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const resendRes = await signUp.verifications.sendEmailCode();
      if (resendRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(resendRes.error));
        return;
      }
      setResendCooldown(45);
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: "#ea7a53",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={icons.logo}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "800",
                    color: "#081126",
                    fontFamily: "sans-extrabold",
                  }}
                >
                  Recurly
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "rgba(0, 0, 0, 0.45)",
                    fontFamily: "sans-semibold",
                  }}
                >
                  Smart Billing
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "#081126",
                textAlign: "center",
                fontFamily: "sans-extrabold",
              }}
            >
              {step === "form" ? "Create your account" : "Verify your email"}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(0, 0, 0, 0.6)",
                textAlign: "center",
                marginTop: 6,
                fontFamily: "sans-medium",
                maxWidth: 320,
              }}
            >
              {step === "form"
                ? "Start tracking and optimizing your recurring subscriptions"
                : `We sent a 6-digit confirmation code to ${email}`}
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={{
              backgroundColor: "#fff8e7",
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.08)",
              padding: 22,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            {/* Global Error Banner */}
            {errorMessage ? (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  borderColor: "#f87171",
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: "#b91c1c",
                    fontSize: 13,
                    fontFamily: "sans-medium",
                    textAlign: "center",
                  }}
                >
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* STEP 1: REGISTRATION DETAILS */}
            {step === "form" && (
              <View style={{ gap: 14 }}>
                {/* Names Row */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#081126",
                        marginBottom: 6,
                        fontFamily: "sans-semibold",
                      }}
                    >
                      First Name
                    </Text>
                    <TextInput
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (fieldErrors.firstName) {
                          setFieldErrors((p) => ({ ...p, firstName: undefined }));
                        }
                      }}
                      placeholder="Alex"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      style={{
                        backgroundColor: "#fff9e3",
                        borderWidth: 1,
                        borderColor: fieldErrors.firstName
                          ? "#dc2626"
                          : "rgba(0, 0, 0, 0.12)",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: "#081126",
                        fontFamily: "sans-medium",
                      }}
                    />
                    {fieldErrors.firstName ? (
                      <Text
                        style={{
                          color: "#dc2626",
                          fontSize: 11,
                          marginTop: 4,
                          fontFamily: "sans-medium",
                        }}
                      >
                        {fieldErrors.firstName}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#081126",
                        marginBottom: 6,
                        fontFamily: "sans-semibold",
                      }}
                    >
                      Last Name
                    </Text>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Morgan"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      style={{
                        backgroundColor: "#fff9e3",
                        borderWidth: 1,
                        borderColor: "rgba(0, 0, 0, 0.12)",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: "#081126",
                        fontFamily: "sans-medium",
                      }}
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#081126",
                      marginBottom: 6,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (fieldErrors.email) {
                        setFieldErrors((p) => ({ ...p, email: undefined }));
                      }
                    }}
                    placeholder="alex@example.com"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={{
                      backgroundColor: "#fff9e3",
                      borderWidth: 1,
                      borderColor: fieldErrors.email
                        ? "#dc2626"
                        : "rgba(0, 0, 0, 0.12)",
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: "#081126",
                      fontFamily: "sans-medium",
                    }}
                  />
                  {fieldErrors.email ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 11,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.email}
                    </Text>
                  ) : null}
                </View>

                {/* Password Field */}
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#081126",
                      marginBottom: 6,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    Password
                  </Text>
                  <View style={{ position: "relative" }}>
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (fieldErrors.password) {
                          setFieldErrors((p) => ({ ...p, password: undefined }));
                        }
                      }}
                      placeholder="At least 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={{
                        backgroundColor: "#fff9e3",
                        borderWidth: 1,
                        borderColor: fieldErrors.password
                          ? "#dc2626"
                          : "rgba(0, 0, 0, 0.12)",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingRight: 64,
                        paddingVertical: 12,
                        fontSize: 15,
                        color: "#081126",
                        fontFamily: "sans-medium",
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 12,
                        padding: 4,
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
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.password ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 11,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.password}
                    </Text>
                  ) : null}
                </View>

                {/* Confirm Password Field */}
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#081126",
                      marginBottom: 6,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    Confirm Password
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((p) => ({
                          ...p,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="Repeat your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{
                      backgroundColor: "#fff9e3",
                      borderWidth: 1,
                      borderColor: fieldErrors.confirmPassword
                        ? "#dc2626"
                        : "rgba(0, 0, 0, 0.12)",
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: "#081126",
                      fontFamily: "sans-medium",
                    }}
                  />
                  {fieldErrors.confirmPassword ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 11,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                {/* Submit Sign Up Button */}
                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading || !isLoaded}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: "#ea7a53",
                    borderRadius: 18,
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "700",
                        fontFamily: "sans-bold",
                      }}
                    >
                      Create account
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: EMAIL VERIFICATION */}
            {step === "verification" && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#081126",
                      marginBottom: 6,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    6-Digit Verification Code
                  </Text>
                  <TextInput
                    value={verificationCode}
                    onChangeText={(text) => {
                      setVerificationCode(text);
                      if (fieldErrors.verificationCode) {
                        setFieldErrors((p) => ({
                          ...p,
                          verificationCode: undefined,
                        }));
                      }
                    }}
                    placeholder="123456"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      backgroundColor: "#fff9e3",
                      borderWidth: 1,
                      borderColor: fieldErrors.verificationCode
                        ? "#dc2626"
                        : "rgba(0, 0, 0, 0.12)",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 20,
                      letterSpacing: 4,
                      textAlign: "center",
                      color: "#081126",
                      fontFamily: "sans-bold",
                    }}
                  />
                  {fieldErrors.verificationCode ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.verificationCode}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleVerifyCode}
                  disabled={loading || !isLoaded}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: "#ea7a53",
                    borderRadius: 18,
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 6,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "700",
                        fontFamily: "sans-bold",
                      }}
                    >
                      Verify & Activate
                    </Text>
                  )}
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 4,
                    paddingTop: 4,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setStep("form")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: "rgba(0,0,0,0.6)",
                        fontSize: 13,
                        fontFamily: "sans-semibold",
                      }}
                    >
                      Edit details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: resendCooldown > 0 ? "rgba(0,0,0,0.35)" : "#ea7a53",
                        fontSize: 13,
                        fontWeight: "700",
                        fontFamily: "sans-bold",
                      }}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Value Prop / Trust Guarantee */}
            <View
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: "rgba(0, 0, 0, 0.06)",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(0, 0, 0, 0.5)",
                  fontFamily: "sans-medium",
                }}
              >
                ✓ Free subscription tracking • No credit card required
              </Text>
            </View>
          </View>

          {/* Bottom Switcher */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              gap: 6,
            }}
          >
            <Text
              style={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: 14,
                fontFamily: "sans-medium",
              }}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: "#ea7a53",
                  fontSize: 14,
                  fontWeight: "700",
                  fontFamily: "sans-bold",
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
