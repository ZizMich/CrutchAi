import { useState, useCallback, useEffect } from "react";
import Login from "../components/Login";
import supabase from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";
import type { User, AuthProvider } from "../types/user";

/**
 * Helper function to perform Chrome OAuth flow for Google or Apple
 *
 * @param provider - The OAuth provider to use
 * @returns A Promise that resolves to the ID token
 * @throws Error if OAuth flow fails
 */
async function chromeOAuth(provider: "google" | "apple"): Promise<string> {
  // Force logout from Google before each OAuth flow to prevent cookie issues
  if (provider === "google") {
    try {
      window.open(
        "https://accounts.google.com/Logout",
        "_blank",
        "width=500,height=600"
      );
      // Wait 1 second for cookies to reset
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn("Failed to open Google logout window", error);
      // Continue anyway, as this is just a precautionary step
    }
  }

  return new Promise((resolve, reject) => {
    // Get OAuth configuration from manifest
    const manifest = chrome.runtime.getManifest() as {
      oauth2?: {
        client_id?: string;
        scopes?: string[];
      };
    };

    if (!manifest.oauth2?.client_id || !manifest.oauth2?.scopes) {
      reject(new Error("OAuth2 configuration missing in manifest.json"));
      return;
    }

    // Build OAuth URL
    const url = new URL("https://accounts.google.com/o/oauth2/auth");
    url.searchParams.set("client_id", manifest.oauth2.client_id);
    url.searchParams.set("response_type", "id_token");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set(
      "redirect_uri",
      `https://${chrome.runtime.id}.chromiumapp.org`
    );
    url.searchParams.set("scope", manifest.oauth2.scopes.join(" "));

    // Launch OAuth flow
    if (!chrome.identity) {
      reject(new Error("Chrome identity API is not available"));
      return;
    }

    chrome.identity.launchWebAuthFlow(
      { url: url.href, interactive: true },
      (redirectedTo) => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              "Authentication failed: " + chrome.runtime.lastError.message
            )
          );
          return;
        }

        if (!redirectedTo) {
          reject(new Error("No redirect URL returned from OAuth"));
          return;
        }

        try {
          const redirectUrl = new URL(redirectedTo);
          const params = new URLSearchParams(redirectUrl.hash.slice(1));
          const idToken = params.get("id_token");

          if (!idToken) {
            throw new Error("No id_token returned from OAuth");
          }

          resolve(idToken);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }
    );
  });
}

/**
 * Create a safe user object from Supabase user data
 *
 * @param userData - Raw user data from Supabase
 * @returns A sanitized User object
 */
function createSafeUser(userData: any): User {
  if (!userData) {
    throw new Error("No user data provided");
  }

  // Create base user with required fields
  const safeUser: User = {
    id: userData.id || "unknown-id",
    email: userData.email || undefined,
  };

  // Add other available fields
  if (userData.user_metadata?.name) {
    safeUser.name = userData.user_metadata.name;
  }

  if (userData.user_metadata?.avatar_url) {
    safeUser.avatarUrl = userData.user_metadata.avatar_url;
  }

  return safeUser;
}

/**
 * Props for the LoginPage component
 */
interface LoginPageProps {
  /**
   * Callback function to handle successful login
   * @param user - The authenticated user object
   */
  onSuccess: (user: User) => void;
}

/**
 * Success message displayed after logout
 */

/**
 * LoginPage component: handles authentication UI and logic for the Chrome extension popup.
 * Manages Supabase authentication and provides a responsive UI.
 *
 * @param props - Component props
 * @returns The LoginPage component
 * @module sections/LoginPage
 * @see AuthenticatedSection, UnauthenticatedSection
 * @todo Add unit/integration tests for all logic and UI states.
 */
export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check auth state on mount
   */
  useEffect(() => {
    let isMounted = true;

    const checkAuthState = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error) {
          if (
            error.message &&
            error.message.toLowerCase().includes("auth session is missing")
          ) {
            // This is an expected error when not logged in
            setError(null);
          } else {
            setError(error.message || "Authentication check failed");
          }
        } else if (data?.user) {
          onSuccess(createSafeUser(data.user));
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Authentication check failed"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthState();

    return () => {
      isMounted = false;
    };
  }, [onSuccess]);

  /**
   * Login handler for all providers
   */
  const handleLogin = useCallback(
    async (provider: AuthProvider, email?: string) => {
      setLoading(true);
      setError(null);

      try {
        if (provider === "email" && email) {
          // Email login with magic link
          const { data, error } = await supabase.auth.signInWithOtp({ email });

          if (error) throw error;

          if (data.user) {
            onSuccess(createSafeUser(data.user));
          } else {
            setError("Check your email for the login link");
          }
          return;
        }

        if (provider === "google" || provider === "apple") {
          // OAuth login
          let idToken: string;

          try {
            idToken = await chromeOAuth(provider);
          } catch (e) {
            throw new Error(e instanceof Error ? e.message : "OAuth failed");
          }

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider,
            token: idToken,
          });

          if (error) throw error;

          if (data.user) {
            onSuccess(createSafeUser(data.user));
          } else {
            throw new Error("No user returned from authentication provider");
          }
          return;
        }

        throw new Error(`Unsupported provider: ${provider}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <UnauthenticatedSection
      onLogin={handleLogin}
      loading={loading}
      error={error}
    />
  );
}

// --- Subcomponents ---

/**
 * Props for UnauthenticatedSection
 */
interface UnauthenticatedSectionProps {
  onLogin: (provider: AuthProvider, email?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * UI for unauthenticated users
 */
const UnauthenticatedSection: React.FC<UnauthenticatedSectionProps> = ({
  onLogin,
  loading,
  error,
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`container p-6 max-w-md mx-auto ${
        resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
      } rounded-lg shadow-md`}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        Welcome to CrutchAI
      </h1>
      <Login onLogin={onLogin} loading={loading} error={error} />
    </div>
  );
};
