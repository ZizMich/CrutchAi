import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom"; // ✅ change here

interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

const Browser: React.FC<{ routeConfigs: RouteConfig[] }> = ({ routeConfigs }) => {
  return (
    <HashRouter> 
      <Routes>
        {routeConfigs.map((config, index) => (
          <Route key={index} path={config.path} element={config.element} />
        ))}
      </Routes>
    </HashRouter>
  );
};

export default Browser;
