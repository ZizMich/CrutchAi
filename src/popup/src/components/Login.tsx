import React, { useState } from "react";

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
  onLogin: (
    provider: "google" | "apple" | "email",
    email?: string
  ) => Promise<void>;
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
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onLogin("email", email.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (provider: "google" | "apple") => {
    setIsSubmitting(true);
    try {
      await onLogin(provider);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="space-y-4">
      {error && error !== "Auth session missing!" && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        onClick={() => handleProviderLogin("google")}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.166,15.139,1,12.545,1C6.496,1,1.545,5.951,1.545,12s4.951,11,11,11s11-4.951,11-11c0-1.821-0.463-3.47-1.238-4.97H12.545z"
          />
        </svg>
        Continue with Google
      </button>

      <button
        onClick={() => handleProviderLogin("apple")}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.85 1.62-3.09 1.62s-2.06-.76-4.06-.76c-2.02 0-2.82.74-4.06.74-1.22 0-2.22-.34-3.06-1.59C3.39 18.11 3 15.79 3 13.38c0-2.09.63-4.08 1.8-5.47C5.78 6.71 7.5 5.63 9.56 5.5c1.09 0 2.06.74 3.06.76 1.56-.03 2.5-.89 4.37-.87 1.7.02 2.96.7 3.78 1.8-3.14 1.89-2.61 5.25 1.33 5.79-.17.48-.3.97-.45 1.41-1.2-.36-2.47-.6-3.96-.6-1.3 0-2.64.25-3.98.63-.8.22-1.6.53-2.39.54-.78 0-1.55-.27-2.34-.5-1.14-.32-2.3-.65-3.49-.5-1.11.15-2.07.5-2.88 1.05-.14.1-.15.2-.1.35.15.3.45.6.9.9.6.4 1.3.75 2.1 1.05.8.3 1.6.5 2.4.5.8 0 1.65-.25 2.55-.55 1.1-.35 2.3-.6 3.6-.6 1.2 0 2.35.25 3.45.6.9.3 1.8.55 2.7.55.8 0 1.55-.2 2.3-.5.75-.3 1.45-.65 2.1-1.05.45-.3.75-.6.9-.9.1-.15.05-.25-.1-.35-.05 0-.1-.05-.15-.1z" />
          <path d="M16.63 8.05c0-1.19.43-2.09 1.19-2.73.56-.5 1.26-.8 2.03-.85.08.74-.23 1.48-.69 2.03-.46.55-1.04.9-1.71 1-.06-.01-.13-.02-.2-.02-.67 0-1.35-.25-1.8-.7-.46-.45-.72-1.03-.72-1.64z" />
        </svg>
        Continue with Apple
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
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="you@example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending magic link..." : "Continue with Email"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowEmailInput(true)}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with Email
        </button>
      )}
    </div>
  );
};

export default Login;
