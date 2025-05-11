
import "./App.css";
import Browser from "./components/browser";
import Home from "./sections/home";
function App() {
  const routes = [
    { path: "/", element: <Home /> },
    // Add more routes as needed
  ];

  return (
    <>
      <Browser routeConfigs={routes} />
    </>
  );
}

export default App;
