import React from "react";
import { clsx } from "clsx";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  setMousePressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleMouseMove: (day: string, hour: string) => void;
  day: string;
  hour: string;
  inDateRange?: boolean;
  isHovering?: boolean;
};

export const CustomTd: React.FC<Props> = ({
  setMouseDown,
  setMouseUp,
  setMousePressed,
  handleMouseMove,
  day,
  hour,
  inDateRange,
  isHovering,
}) => {
  isHovering && console.log("isHovering");
  return (
    <td
      onMouseDown={() => {
        setMouseDown(day + " " + hour), setMousePressed(true);
      }}
      onMouseUp={() => {
        setMouseUp(day + " " + hour), setMousePressed(false);
      }}
      onMouseOver={() => handleMouseMove(day, hour)}
      className={clsx(
        "w-24 h-6 border hover:cursor-pointer select-none",
        isHovering && "bg-purple-100"
      )}
      style={inDateRange ? { backgroundColor: "#FFC289" } : {}}
    ></td>
  );
};
