import { motion } from "framer-motion";
import React from "react";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  day: string;
  hour: string;
  inDateRange?: boolean;
};

export const CustomTd: React.FC<Props> = ({
  setMouseDown,
  setMouseUp,
  day,
  hour,
  inDateRange,
}) => {
  return (
    <motion.td
      onMouseDown={() => setMouseDown(day + " " + hour)}
      onMouseUp={() => setMouseUp(day + " " + hour)}
      className={"w-24 h-8 border hover:bg-gray-100 select-none"}
      style={inDateRange ? { backgroundColor: "#1B71FF" } : {}}
    ></motion.td>
  );
};
