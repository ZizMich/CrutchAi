import { useState, useCallback, useEffect } from "react";
import Login from "../components/Login";
import supabase from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";

/**
 * User object returned from authentication
 */
export interface User {
  id: string;
  email?: string;
  [key: string]: any; // Allow any additional properties
}


/**
 * Helper to perform Chrome OAuth flow for Google or Apple
 */
async function chromeOAuth(provider: "google" | "apple"): Promise<string> {
  // Принудительный logout из Google перед каждым OAuth
  if (provider === "google") {
    window.open(
      "https://accounts.google.com/Logout",
      "_blank",
      "width=500,height=600"
    );
    // Ждем 1 секунду, чтобы успел сброситься cookie
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return new Promise((resolve, reject) => {
    const manifest = chrome.runtime.getManifest() as { oauth2?: { client_id?: string; scopes?: string[] } };
    if (!manifest.oauth2?.client_id || !manifest.oauth2?.scopes) {
      reject(new Error("OAuth2 config missing in manifest.json"));
      return;
    }
    const url = new URL("https://accounts.google.com/o/oauth2/auth");
    url.searchParams.set("client_id", manifest.oauth2.client_id);
    url.searchParams.set("response_type", "id_token");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set(
      "redirect_uri",
      `https://${chrome.runtime.id}.chromiumapp.org`
    );
    url.searchParams.set("scope", manifest.oauth2.scopes.join(" "));
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
          if (!idToken) throw new Error("No id_token returned from OAuth");
          resolve(idToken);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
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
 * LoginPage component: handles authentication UI and logic
 * @param props - Component props
 * @returns The LoginPage component
 */
/**
 * LoginPage component: handles authentication UI and logic for the Chrome extension popup.
 * Handles Supabase and mock authentication, and provides a responsive UI.
 *
 * @param props - Component props
 * @returns The LoginPage component
 * @module sections/LoginPage
 * @see AuthenticatedSection, UnauthenticatedSection
 * @todo Add unit/integration tests for all logic and UI states.
 */
export default function LoginPage({ onSuccess }: LoginPageProps) {
  /**
   * State variables for the component
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  /**
   * Check auth state on mount
   */
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) {
          if (
            error.message &&
            error.message.toLowerCase().includes("auth session is missing")
          ) {
            setError(null); // Явно сбрасываем ошибку!
          } else {
            setError(error.message || "Ошибка при проверке авторизации");
          }
        } else if (data?.user) {
          const safeUser = {
            ...data.user,
            id: data.user.id ?? "no-id",
            email: data.user.email ?? "no-email@example.com",
          };
          onSuccess(safeUser);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [onSuccess]);

  /**
   * Logout handler
   */

  /**
   * Login handler for all providers
   */
  const handleLogin = useCallback(
    async (provider: "google" | "apple" | "email", email?: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!supabase) throw new Error("Supabase client not initialized");
        if (provider === "email" && email) {
          const { data, error } = await supabase.auth.signInWithOtp({ email });
          if (error) throw error;
          if (data.user) {
            // Type assertion for the user object
            const user = data.user as { id?: string; email?: string; [key: string]: any };
            
            // Create a new object with only the properties we need
            const safeUser: User = {
              id: user.id || "no-id",
              email: user.email || undefined
            };
            
            // Copy any additional properties from the user object
            Object.assign(safeUser, user);
            onSuccess(safeUser);
          } else {
            setError("No user returned from Supabase after sign-in");
          }
          return;
        }
        if (provider === "google" || provider === "apple") {
          let idToken: string;
          try {
            idToken = await chromeOAuth(provider);
          } catch (e: unknown) {
            if (e instanceof Error) {
  setError(e.message || "OAuth failed");
} else {
  setError("OAuth failed");
}
            return;
          }
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider,
            token: idToken,
          });
          if (error) throw error;
          if (data.user) {
            // Type assertion for the user object
            const user = data.user as { id?: string; email?: string; [key: string]: any };
            
            // Create a new object with only the properties we need
            const safeUser: User = {
              id: user.id || "no-id",
              email: user.email || undefined
            };
            
            // Copy any additional properties from the user object
            Object.assign(safeUser, user);
            onSuccess(safeUser);
          } else {
            setError("No user returned from Supabase after sign-in");
          }
          return;
        }
        throw new Error("Unsupported provider");
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message || "Logout failed");
        } else {
          setError("Login failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>Загрузка...</div>
    );
  }
  // Показываем UnauthenticatedSection всегда, если не loading
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
  onLogin: (
    provider: "google" | "apple" | "email",
    email?: string
  ) => Promise<void>;
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
    <div className={`container p-6 max-w-md mx-auto ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md`}>
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to CrutchAI</h1>
      <Login onLogin={onLogin} loading={loading} error={error} />
    </div>
  );
};
