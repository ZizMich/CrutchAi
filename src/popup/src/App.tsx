import "./App.css";
import Browser from "./components/browser";
import { useState, useEffect, useMemo, memo } from "react";
import Home from "./pages/home";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider } from "./context/ThemeContext";
import type { User } from "./types/user";
import type { RouteConfig } from "./components/browser";

/**
 * Wrapper component that accesses context providers
 */
const AppContent = memo(
  ({
    user,
    setUser,
  }: {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
  }) => {
    /**
     * Handle user logout
     */
    const handleLogout = () => setUser(null);

    /**
     * Application routes configuration
     */
    const routes = useMemo<RouteConfig[]>(
      () => [
        { path: "/", element: <Home user={user} onLogout={handleLogout} /> },
        // Add more routes as needed
      ],
      [user, handleLogout]
    );

    /**
     * Show login screen if no user is authenticated
     */
    if (!user) {
      return <LoginPage onSuccess={setUser} />;
    }

    /**
     * Otherwise show the main application
     */
    return <Browser routeConfigs={routes} />;
  }
);

// Display name for debugging
AppContent.displayName = "AppContent";

/**
 * Main application component
 * Manages global state and applies theme
 */
function App() {
  // User authentication state
  const [user, setUser] = useState<User | null>(null);

  // Flag to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag after first render to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show nothing during initial render to prevent hydration mismatch
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider>
      <AppContent user={user} setUser={setUser} />
    </ThemeProvider>
  );
}

export default App;
