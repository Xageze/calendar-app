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
  index: number;
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
  index,
}) => {
  return (
    <td
      onMouseDown={() => {
        inDateRange
          ? null
          : (setMouseDown(day + " " + hour), setMousePressed(true));
      }}
      onMouseUp={() => {
        inDateRange
          ? null
          : (setMouseUp(day + " " + hour), setMousePressed(false));
      }}
      onMouseOver={() => handleMouseMove(day, hour)}
      className={clsx(
        "w-[12.5%] h-2 select-none",
        isHovering && "bg-gray-200",
        inDateRange && "cursor-not-allowed",
        index % 4 === 0
          ? "border-t border-l border-r border-slate-300"
          : "border-t border-b border-l border-r border-l-slate-300 border-r-slate-300",
        index % 4 === 3 && "border-b-slate-300"
      )}
    />
  );
};
