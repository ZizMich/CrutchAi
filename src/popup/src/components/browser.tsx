import React, { memo } from "react";
import { HashRouter, Routes, Route, RouteProps } from "react-router-dom";

/**
 * Configuration for a route in the application
 */
export interface RouteConfig extends Pick<RouteProps, "path"> {
  /** Path for the route */
  path: string;
  /** React element to render for this route */
  element: React.ReactElement;
}

/**
 * Props for the Browser component
 */
interface BrowserProps {
  /** Array of route configurations */
  routeConfigs: RouteConfig[];
}

/**
 * Browser component that sets up the application routing
 *
 * Uses HashRouter for better compatibility with Chrome extensions
 *
 * @param props - Component properties
 * @returns The Router component with configured routes
 */
const Browser: React.FC<BrowserProps> = ({ routeConfigs }) => {
  return (
    <HashRouter>
      <Routes>
        {routeConfigs.map((config, index) => (
          <Route
            key={config.path || index}
            path={config.path}
            element={config.element}
          />
        ))}
      </Routes>
    </HashRouter>
  );
};

export default memo(Browser);
