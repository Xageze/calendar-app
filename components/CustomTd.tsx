import React from "react";
import { clsx } from "clsx";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  setMousePressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleMouseMove: (day: string, hour: string) => void;
  day: string;
  hour: string;
  isInDateRange?: boolean;
  isTDInMovingEventRange?: boolean;
  index: number;
};

export const CustomTd: React.FC<Props> = ({
  setMouseDown,
  setMouseUp,
  setMousePressed,
  handleMouseMove,
  day,
  hour,
  isInDateRange,
  isTDInMovingEventRange,
  index,
}) => {
  return (
    <td
      onMouseDown={() => {
        isInDateRange
          ? null
          : (setMouseDown(day + " " + hour), setMousePressed(true));
      }}
      onMouseUp={() => {
        isInDateRange
          ? null
          : (setMouseUp(day + " " + hour), setMousePressed(false));
      }}
      onMouseOver={() => handleMouseMove(day, hour)}
      className={clsx(
        "w-[12.5%] h-2 select-none",
        isTDInMovingEventRange && "bg-gray-200",
        index % 4 === 0
          ? "border-t border-l border-r border-slate-300"
          : "border-t border-b border-l border-r border-l-slate-300 border-r-slate-300",
        index % 4 === 3 && "border-b-slate-300"
      )}
    />
  );
};
