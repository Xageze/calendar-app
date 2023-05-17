import React from "react";
import { clsx } from "clsx";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  setMousePressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleMouseMove: (day: string, hour: string) => void;
  day: string;
  hour: string;
  isHovering?: boolean;
};

export const CustomTd: React.FC<Props> = ({
  setMouseDown,
  setMouseUp,
  setMousePressed,
  handleMouseMove,
  day,
  hour,
  isHovering,
}) => {
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
        "w-[12.5%] h-7 border hover:cursor-pointer select-none",
        isHovering && "bg-purple-100"
      )}
    />
  );
};
