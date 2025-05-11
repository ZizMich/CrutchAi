import React, { Component } from "react";

interface ToggleProps extends React.HTMLAttributes<HTMLInputElement> {}

class Toggle extends Component<ToggleProps> {
  render() {
    const { style, className, ...otherProps } = this.props;
    return (
      <input
        type="checkbox"
        defaultChecked
        className="toggle"
        style={style}
        {...otherProps}
      />
    );
  }
}

export default Toggle;
