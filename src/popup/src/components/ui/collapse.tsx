import React from "react";
import type { ReactNode } from "react";

interface CollapseProps {
  title:String;
  children?: ReactNode;
}

const Collapse: React.FC<CollapseProps> = (props) => {
  return (
    <div className="collapse bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div className="collapse-title font-semibold" style={{color:"black"}}>
        {props.title}
      </div>
      <div className="collapse-content text-sm">
        {props.children}
      </div>
    </div>
  );
};

export default Collapse;