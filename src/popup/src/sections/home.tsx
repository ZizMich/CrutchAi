import Toggle from "../components/ui/toggle";
//import Selector from "../components/ui/selector";
import React from "react";
import {usePreferences} from "../components/usePreferences"
export default function Home() {
  const [prefs, setPref] = usePreferences({ translate_to: "de", active:true });

  return (
    <div className="background-light">
      <div style={containerTopStyle}>
        <span style={labelStyle}>Turn on/off</span>
        <Toggle style={toggleStyle}></Toggle>
      </div>
      <button onClick={()=>setPref("translate_to","ru")}>biba</button>

      <button onClick={()=>console.log(prefs)}>biba</button>

      
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
