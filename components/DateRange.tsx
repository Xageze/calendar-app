import handleClickDeleteDiv from "@/utils/handleClickDeleteDiv";
import { DateTime } from "luxon";
import React from "react";

type Props = {
  events: { start: Date; end: Date }[];
  oh: string;
  setOh: React.Dispatch<React.SetStateAction<string>>;
};

export const DateRange: React.FC<Props> = ({ events, oh, setOh }) => {
  return (
    <>
      {/* Date Range DIV Over my calendar  */}
      {events.map((event, index) => {
        // TODO Améliorer cette magouille ?
        const minuteOffsets = {
          0: 0,
          15: 28,
          30: 56,
          45: 84,
        };

        const topOffset =
          event.start.getHours() * 112 +
          minuteOffsets[event.start.getMinutes() as 0 | 15 | 30 | 45];

        const leftOffset = DateTime.fromJSDate(event.start).weekday;

        // IF SAME DAY
        if (event.start.getDay() === event.end.getDay()) {
          const minutesDiff = DateTime.fromJSDate(event.end).diff(
            DateTime.fromJSDate(event.start),
            "minutes"
          ).minutes;
          // DIV CASE A
          return (
            <div
              key={index}
              onClick={() => {
                handleClickDeleteDiv(index, events, oh, setOh);
              }}
              className={
                "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
              }
              style={{
                marginTop: `${5 + topOffset}px`,
                marginLeft: `${leftOffset * 12.5 + 0.5}%`,
                height: `${28 + (minutesDiff / 15) * 28 - 10}px`,
              }}
            >
              {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                " A " +
                DateTime.fromJSDate(event.end).toFormat("HH:mm")}
            </div>
          );
        }
        // IF NOT SAME DAY
        if (event.start.getDay() !== event.end.getDay()) {
          const dayDiff =
            DateTime.fromJSDate(event.end).weekday -
            DateTime.fromJSDate(event.start).weekday;

          const elements = [];
          for (let i = 0; i <= dayDiff; i++) {
            if (i === 0) {
              elements.push(
                // DIV CASE B
                <div
                  key={i}
                  onClick={() => {
                    handleClickDeleteDiv(index, events, oh, setOh);
                  }}
                  className={
                    "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                  }
                  style={{
                    top: `${5 + topOffset}px`,
                    left: `${leftOffset * 12.5 + 0.5}%`,
                    height: `${2706 - topOffset}px`,
                  }}
                >
                  {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                    " B " +
                    "00:00"}
                </div>
              );
            } else if (i !== dayDiff) {
              elements.push(
                // DIV CASE C
                <div
                  key={i}
                  onClick={() => {
                    handleClickDeleteDiv(index, events, oh, setOh);
                  }}
                  className={
                    "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                  }
                  style={{
                    top: "5px",
                    left: `${(i + leftOffset) * 12.5 + 0.5}%`,
                    height: `${2706}px`,
                  }}
                >
                  {"00:00 C 00:00"}
                </div>
              );
            } else if (
              DateTime.fromJSDate(event.end).toFormat("HH:mm") !== "00:00"
            ) {
              const lastDivBottomOffset =
                DateTime.fromJSDate(event.end).hour * 112 +
                minuteOffsets[event.end.getMinutes() as 0 | 15 | 30 | 45];

              elements.push(
                // DIV CASE D
                <div
                  key={i}
                  onClick={() => {
                    handleClickDeleteDiv(index, events, oh, setOh);
                  }}
                  className={
                    "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                  }
                  style={{
                    top: "5px",
                    left: `${(i + leftOffset) * 12.5 + 0.5}%`,
                    height: `${28 + lastDivBottomOffset - 10}px`,
                  }}
                >
                  {"00:00 D " +
                    DateTime.fromJSDate(event.end).toFormat("HH:mm")}
                </div>
              );
            }
          }
          return elements;
        }
      })}
    </>
  );
};
