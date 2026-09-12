/**
 * Human-friendly auth error mapping for Recurly.
 * Strips any internal or generic vendor/Clerk terminology.
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  // If error has Clerk-specific errors array
  let clerkErrors = error?.errors || error?.clerkError?.errors;
  if (!clerkErrors && error?.code) {
    clerkErrors = [error];
  }
  if (Array.isArray(clerkErrors) && clerkErrors.length > 0) {
    const first = clerkErrors[0];
    const code = first.code || "";
    const longMessage = first.longMessage || first.message || "";

    switch (code) {
      case "form_identifier_not_found":
      case "form_password_incorrect":
        return "Invalid email or password.";
      case "form_identifier_exists":
        return "An account with this email address already exists.";
      case "form_password_pwned":
        return "This password was found in a public security breach. Please choose a stronger, unique password.";
      case "form_password_length_too_short":
        return "Password must be at least 8 characters long.";
      case "form_param_format_invalid":
        if (longMessage.toLowerCase().includes("email")) {
          return "Please enter a valid email address.";
        }
        return "One or more fields have an invalid format.";
      case "form_code_incorrect":
        return "The verification code entered is incorrect.";
      case "verification_expired":
        return "The verification code has expired. Please request a new code.";
      case "too_many_attempts":
        return "Too many attempts. For your security, please wait a few moments before trying again.";
      case "session_exists":
        return "You are already signed in.";
      default:
        if (longMessage) {
          // Remove any Clerk-specific phrasing if present
          return cleanGenericPhrasing(longMessage);
        }
    }
  }

  if (typeof error?.message === "string") {
    return cleanGenericPhrasing(error.message);
  }

  return "Unable to complete request. Please check your internet connection.";
}

function cleanGenericPhrasing(msg: string): string {
  return msg
    .replace(/clerk/gi, "Recurly")
    .replace(/identifier/gi, "email")
    .trim();
}
