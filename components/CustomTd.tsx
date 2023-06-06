import React from "react";
import { clsx } from "clsx";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  setIsMousePressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleMouseMove: (day: string, hour: string) => void;
  day: string;
  hour: string;
  isTDInMovingEventRange?: boolean;
  index: number;
};

export const CustomTd: React.FC<Props> = ({
  index,
  day,
  hour,
  setMouseDown,
  setMouseUp,
  setIsMousePressed,
  handleMouseMove,
  isTDInMovingEventRange,
}) => {
  return (
    <td
      onMouseDown={() => {
        setMouseDown(day + " " + hour), setIsMousePressed(true);
      }}
      onMouseUp={() => {
        setMouseUp(day + " " + hour), setIsMousePressed(false);
      }}
      onMouseOver={() => handleMouseMove(day, hour)}
      className={clsx(
        "w-[12.5%] h-2 select-none",
        isTDInMovingEventRange && "bg-rose-300",
        // Heure Pile
        index % 4 === 0
          ? isTDInMovingEventRange
            ? index === 0
              ? "border-l border-r border-t border-slate-300"
              : "border-l border-r border-slate-300"
            : "border-l border-r border-t border-slate-300"
          : // Les autres heures (15, 30, 45)
          isTDInMovingEventRange
          ? "border-l border-r border-slate-300"
          : "border-t border-b border-l border-r border-l-slate-300 border-r-slate-300 ",
        index % 4 === 3 &&
          (isTDInMovingEventRange
            ? index === 95
              ? "border-b border-b-slate-300"
              : null
            : "border-b-slate-300")
      )}
    />
  );
};
