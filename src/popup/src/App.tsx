import "./App.css";
import Browser from "./components/browser";
import { useState, useEffect } from "react";
import Home from "./pages/home";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// Wrapper component to access the theme context
const AppContent = ({
  user,
  setUser,
}: {
  user: { id: string; email?: string } | null;
  setUser: React.Dispatch<
    React.SetStateAction<{ id: string; email?: string } | null>
  >;
}) => {
  const { resolvedTheme } = useTheme();
  const handleLogout = () => setUser(null);

  const routes = [
    { path: "/", element: <Home user={user} onLogout={handleLogout} /> },
    // Add more routes as needed
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        resolvedTheme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {!user ? (
        <LoginPage onSuccess={setUser} />
      ) : (
        <Browser routeConfigs={routes} />
      )}
    </div>
  );
};

function App() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
