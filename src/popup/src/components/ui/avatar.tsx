import React from "react";
import type { ReactNode } from "react";

interface AvatarProps {
  image: string;
}

const Avatar: React.FC<AvatarProps> = (props) => {
  return (
    <>
      <div className="avatar">
        <div className="w-24 rounded-full" style={{borderWidth:"2px", borderColor:"black", width:50, height:50}}>
          <img src={props.image} />
        </div>
      </div>
    </>
  );
};

export default Avatar;
