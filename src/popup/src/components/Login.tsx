import React, { useState, useCallback } from "react";
import { FcGoogle } from "react-icons/fc"; // Google icon with official colors
import { BsApple } from "react-icons/bs"; // Apple icon
import { MdEmail } from "react-icons/md"; // Email icon
import { useTranslation } from "react-i18next";

/**
 * Authentication providers supported by the application
 */
export type AuthProvider = "google" | "apple" | "email";

/**
 * Login component: renders authentication UI for Google, Apple, and Email sign-in.
 * Used in the Chrome extension popup. Handles loading and error states.
 * @module components/Login
 * @todo Add unit tests for all auth flows and UI states.
 */

/**
 * Props for the Login component
 */
export interface LoginProps {
  /**
   * Called when the user initiates login with a provider or email
   * @param provider - Auth provider (google, apple, email)
   * @param email - Email address (if provider is email)
   */
  onLogin: (provider: AuthProvider, email?: string) => Promise<void>;
  /**
   * Whether a login request is in progress
   */
  loading: boolean;
  /**
   * Error message to display, or null
   */
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, loading, error }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  /**
   * Validates email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles email form submission
   */
  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedEmail = email.trim();

      // Validate email
      if (!trimmedEmail) {
        setEmailError("Email is required");
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      setEmailError(null);
      setIsSubmitting(true);

      try {
        await onLogin("email", trimmedEmail);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, onLogin]
  );

  /**
   * Handles provider button clicks
   */
  const handleProviderLogin = useCallback(
    async (provider: AuthProvider) => {
      setIsSubmitting(true);
      try {
        await onLogin(provider);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onLogin]
  );

  const isLoading = loading || isSubmitting;

  return (
    <div className="space-y-4" role="form" aria-label="Authentication form">
      {error && error !== "Auth session missing!" && (
        <div
          className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <button
        onClick={() => handleProviderLogin("google")}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FcGoogle className="w-5 h-5" aria-hidden="true" />
        <span>Continue with Google</span>
      </button>

      <button
        onClick={() => handleProviderLogin("apple")}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <BsApple className="w-5 h-5" aria-hidden="true" />
        <span>Continue with Apple</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {showEmailInput ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("common.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null); // Clear error when user types
              }}
              disabled={isLoading}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="you@example.com"
              required
            />
            {emailError && (
              <p
                id="email-error"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                aria-live="polite"
              >
                {emailError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span>{t("common.loading")}</span>
            ) : (
              <>
                <MdEmail className="w-5 h-5" aria-hidden="true" />
                <span>{t("common.submit")}</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowEmailInput(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MdEmail className="w-5 h-5" aria-hidden="true" />
          <span>Continue with Email</span>
        </button>
      )}
    </div>
  );
};

export default Login;
