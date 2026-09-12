import React, { useState } from "react";
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
import { useSignIn, useAuth } from "@clerk/expo";
import { icons } from "@/constants/icons";
import { getFriendlyAuthErrorMessage } from "@/lib/authErrors";
import { posthog } from "@/src/lib/posthog";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { isLoaded } = useAuth();

  // Mode: 'signin' | 'forgot_password_request' | 'forgot_password_verify'
  const [authMode, setAuthMode] = useState<
    "signin" | "forgot_password_request" | "forgot_password_verify"
  >("signin");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI / Async State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Field validation
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    resetCode?: string;
    newPassword?: string;
  }>({});

  const validateSignIn = (): boolean => {
    const errors: typeof fieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateSignIn()) return;
    if (!isLoaded || !signIn) return;

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(getFriendlyAuthErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog?.capture("user_signed_in", { method: "password" });
        router.replace("/(tabs)");
      } else {
        setErrorMessage(
          "Additional verification is required to access your account."
        );
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setFieldErrors({ email: "Please enter a valid email address." });
      return;
    }

    if (!isLoaded || !signIn) return;

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const createRes = await signIn.create({
        identifier: trimmedEmail.toLowerCase(),
      });
      if (createRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(createRes.error));
        return;
      }

      const sendRes = await signIn.resetPasswordEmailCode.sendCode();
      if (sendRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(sendRes.error));
        return;
      }

      setAuthMode("forgot_password_verify");
      setInfoMessage(`We've sent a 6-digit reset code to ${trimmedEmail}`);
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasswordReset = async () => {
    const errors: typeof fieldErrors = {};
    if (!resetCode.trim()) {
      errors.resetCode = "Please enter the 6-digit reset code.";
    }
    if (!newPassword || newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!isLoaded || !signIn) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({
        code: resetCode.trim(),
      });
      if (verifyRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(verifyRes.error));
        return;
      }

      const submitRes = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (submitRes.error) {
        setErrorMessage(getFriendlyAuthErrorMessage(submitRes.error));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog?.capture("password_reset_completed");
        router.replace("/(tabs)");
      } else {
        setErrorMessage(
          "Password reset could not be completed. Please try again."
        );
      }
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
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
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
                fontSize: 30,
                fontWeight: "800",
                color: "#081126",
                textAlign: "center",
                fontFamily: "sans-extrabold",
              }}
            >
              {authMode === "signin" ? "Welcome back" : "Reset Password"}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "rgba(0, 0, 0, 0.6)",
                textAlign: "center",
                marginTop: 6,
                fontFamily: "sans-medium",
                maxWidth: 320,
              }}
            >
              {authMode === "signin"
                ? "Sign in to continue managing your subscriptions"
                : authMode === "forgot_password_request"
                ? "Enter your account email to receive a recovery code"
                : "Enter the code sent to your email and choose a new password"}
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

            {/* Global Info Banner */}
            {infoMessage ? (
              <View
                style={{
                  backgroundColor: "#dcfce7",
                  borderColor: "#86efac",
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: "#15803d",
                    fontSize: 13,
                    fontFamily: "sans-medium",
                    textAlign: "center",
                  }}
                >
                  {infoMessage}
                </Text>
              </View>
            ) : null}

            {/* SIGN IN FORM */}
            {authMode === "signin" && (
              <View style={{ gap: 16 }}>
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
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="Enter your email"
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
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#081126",
                      fontFamily: "sans-medium",
                    }}
                  />
                  {fieldErrors.email ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 12,
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
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: "#081126",
                        fontFamily: "sans-semibold",
                      }}
                    >
                      Password
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setErrorMessage(null);
                        setInfoMessage(null);
                        setFieldErrors({});
                        setAuthMode("forgot_password_request");
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#ea7a53",
                          fontFamily: "sans-bold",
                        }}
                      >
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ position: "relative" }}>
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter your password"
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
                        paddingHorizontal: 16,
                        paddingRight: 64,
                        paddingVertical: 14,
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
                        top: 14,
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
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.password}
                    </Text>
                  ) : null}
                </View>

                {/* Submit Sign In Button */}
                <TouchableOpacity
                  onPress={handleSignIn}
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
                      Sign in
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* FORGOT PASSWORD - STEP 1 (REQUEST CODE) */}
            {authMode === "forgot_password_request" && (
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
                    Registered Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                      backgroundColor: "#fff9e3",
                      borderWidth: 1,
                      borderColor: fieldErrors.email
                        ? "#dc2626"
                        : "rgba(0, 0, 0, 0.12)",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      color: "#081126",
                      fontFamily: "sans-medium",
                    }}
                  />
                  {fieldErrors.email ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.email}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleRequestPasswordReset}
                  disabled={loading}
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
                      Send Reset Code
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage(null);
                    setInfoMessage(null);
                    setAuthMode("signin");
                  }}
                  activeOpacity={0.7}
                  style={{ alignItems: "center", paddingVertical: 6 }}
                >
                  <Text
                    style={{
                      color: "rgba(0,0,0,0.6)",
                      fontSize: 14,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    Back to Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* FORGOT PASSWORD - STEP 2 (VERIFY CODE & SET NEW PASSWORD) */}
            {authMode === "forgot_password_verify" && (
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
                    6-Digit Reset Code
                  </Text>
                  <TextInput
                    value={resetCode}
                    onChangeText={(text) => {
                      setResetCode(text);
                      if (fieldErrors.resetCode) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          resetCode: undefined,
                        }));
                      }
                    }}
                    placeholder="e.g. 123456"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{
                      backgroundColor: "#fff9e3",
                      borderWidth: 1,
                      borderColor: fieldErrors.resetCode
                        ? "#dc2626"
                        : "rgba(0, 0, 0, 0.12)",
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 18,
                      letterSpacing: 4,
                      textAlign: "center",
                      color: "#081126",
                      fontFamily: "sans-bold",
                    }}
                  />
                  {fieldErrors.resetCode ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.resetCode}
                    </Text>
                  ) : null}
                </View>

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
                    New Password
                  </Text>
                  <View style={{ position: "relative" }}>
                    <TextInput
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (fieldErrors.newPassword) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            newPassword: undefined,
                          }));
                        }
                      }}
                      placeholder="At least 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      style={{
                        backgroundColor: "#fff9e3",
                        borderWidth: 1,
                        borderColor: fieldErrors.newPassword
                          ? "#dc2626"
                          : "rgba(0, 0, 0, 0.12)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingRight: 64,
                        paddingVertical: 14,
                        fontSize: 15,
                        color: "#081126",
                        fontFamily: "sans-medium",
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      activeOpacity={0.7}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: 14,
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
                        {showNewPassword ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.newPassword ? (
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: "sans-medium",
                      }}
                    >
                      {fieldErrors.newPassword}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleVerifyPasswordReset}
                  disabled={loading}
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
                      Save & Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage(null);
                    setInfoMessage(null);
                    setAuthMode("forgot_password_request");
                  }}
                  activeOpacity={0.7}
                  style={{ alignItems: "center", paddingVertical: 4 }}
                >
                  <Text
                    style={{
                      color: "rgba(0,0,0,0.6)",
                      fontSize: 14,
                      fontFamily: "sans-semibold",
                    }}
                  >
                    Request a new code
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Trust Guarantee / Security Badge */}
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
                🔒 Bank-grade 256-bit encryption • Privacy protected
              </Text>
            </View>
          </View>

          {/* Bottom Switcher */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 24,
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
              New to Recurly?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
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
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
