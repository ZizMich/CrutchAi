import Toggle from "../components/ui/toggle";
import Selector from "../components/ui/selector";
import React from "react";
import { usePreferences } from "../components/usePreferences";
import Collapse from "../components/ui/collapse";
import TextInput from "../components/ui/textinput";
export default function Home() {
  const [prefs, setPref] = usePreferences({
    translate_to: "German",
    customPrompt:"",
    useCustomPrompt: false,
  });

  return (
    <div className="background-light">
      <div style={containerTopStyle}>
        <span style={labelStyle}>Turn on/off</span>
        <Toggle style={toggleStyle}></Toggle>
      </div>
      <Selector
        options={["German", "English", "Spanish", "French"]}
        onSelect={(sel) => {
          setPref("translate_to", sel);
        }}
        default={0}
      ></Selector>
      <Collapse title="Advanced setting">
        <div style={containerTopStyle}>
          <span style={labelStyle1}>use custom prompt</span>
          <Toggle
            style={toggleStyle}
            checked={prefs.useCustomPrompt}
            onToggle={(e) => {
              setPref("useCustomPrompt", e);
            }}
          />
        </div>

        <TextInput onDoneTyping={(value)=>{setPref("customPrompt",value); console.log(value)}} default={prefs.customPrompt} title={"Custom promt"}></TextInput>
      </Collapse>
    </div>
  );
}

const toggleStyle: React.CSSProperties = {
  marginLeft: "auto", // Push the toggle to the right
};

const labelStyle: React.CSSProperties = {
  color: "black",
  fontSize: 14,
  fontWeight: "bold",
  // No need for marginRight if toggle is pushed with marginLeft
};
const labelStyle1: React.CSSProperties = {
  color: "black",
  fontSize: 14,

  // No need for marginRight if toggle is pushed with marginLeft
};
const containerTopStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center", // Align items vertically in the center
  padding: "10px", // Optional padding for spacing
};
