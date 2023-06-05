import React from "react";
import { clsx } from "clsx";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  setMousePressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleMouseMove: (day: string, hour: string) => void;
  day: string;
  hour: string;
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
  isTDInMovingEventRange,
  index,
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
