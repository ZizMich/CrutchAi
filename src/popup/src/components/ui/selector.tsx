import React, { Component } from "react";

interface SelectorProps {
  options: string[];
  default: number;
  onSelect: (value: string) => void;
}

export default class Selector extends Component<SelectorProps> {
  render() {
    const { options, default: defaultIndex, onSelect } = this.props;
    return (
      <fieldset className="fieldset" style={{ width: "90%" }}>
        <legend className="fieldset-legend">Language</legend>
        <select
          style={{ color: "black" }}
          onChange={(e) => onSelect(e.target.value)}
   
          defaultValue={options[defaultIndex]}
          className="select"
        >
          {options.map((opt, idx) => (
            <option style={{ color: "black" }} key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="label">Optional</span>
      </fieldset>
    );
  }
}
