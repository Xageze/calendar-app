import React from "react";

type Props = {
  setMouseDown: React.Dispatch<React.SetStateAction<string>>;
  setMouseUp: React.Dispatch<React.SetStateAction<string>>;
  day: string;
  hour: string;
};

export const CustomTd: React.FC<Props> = ({
  setMouseDown,
  setMouseUp,
  day,
  hour,
}) => {
  return (
    <td
      onMouseDown={() => setMouseDown(day + " " + hour)}
      onMouseUp={() => setMouseUp(day + " " + hour)}
      className={"w-24 h-8 border hover:bg-gray-100 select-none"}
    ></td>
  );
};
