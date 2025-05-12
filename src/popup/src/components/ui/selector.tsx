import React, { Component } from "react";

interface SelectorProps {
    options:String[],
    default:number,
    onSelect: ()=>void
}

class Selector extends Component<SelectorProps> {
  render() {
    const {onSelect} = this.props;
    return (
        <fieldset className="fieldset" style={{width:"100%"}}>
        <legend className="fieldset-legend">Browsers</legend>
        <select onSelect={onSelect} defaultValue="Pick a browser" className="select">
            <option disabled={true}>Pick a browser</option>
            <option>Chrome</option>
            <option>FireFox</option>
            <option>Safari</option>
        </select>
        <span className="label">Optional</span>
        </fieldset>
    );
  }
}

export default Selector;
