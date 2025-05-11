import Toggle from "../components/ui/toggle";
import React from "react";

export default function Home() {
  return (
    <div className="background-light">
      <div style={containerTopStyle}>
        <span style={labelStyle}>Turn on/off</span>
        <Toggle style={toggleStyle}></Toggle>
      </div>
      
    </div>
  );
}

const toggleStyle: React.CSSProperties = {
  marginLeft: "auto", // Push the toggle to the right
};

const labelStyle: React.CSSProperties = {
  color: "black",
  fontSize:14,
  fontWeight:"bold",
  // No need for marginRight if toggle is pushed with marginLeft
};

const containerTopStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center", // Align items vertically in the center
  padding: "10px", // Optional padding for spacing
};
