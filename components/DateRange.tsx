import {
  marginLeft,
  baseMarginYPx,
  tdHeightPx,
  YOffsetPx,
  fullheightPx,
} from "@/utils/calendarFront";
import handleClickDeleteDiv from "@/utils/handleClickDeleteDiv";
import clsx from "clsx";
import { DateTime } from "luxon";
import React from "react";

type Props = {
  goodInputValue: boolean;
  events: { start: Date; end: Date }[];
  oh: string;
  setOh: React.Dispatch<React.SetStateAction<string>>;
};

export const DateRange: React.FC<Props> = ({
  goodInputValue,
  events,
  oh,
  setOh,
}) => {
  return (
    <>
      {goodInputValue &&
        /* Date Range DIV Over my calendar  */
        events.map((event, index) => {
          // TODO Améliorer cette magouille ?
          const minuteOffsets = {
            0: 0,
            15: tdHeightPx,
            30: tdHeightPx * 2,
            45: tdHeightPx * 3,
          };

          const topOffset =
            event.start.getHours() * YOffsetPx +
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
                className={clsx(
                  "absolute cursor-pointer overflow-hidden",
                  "leading-3 text-xs text-center  font-semibold text-white",
                  "w-[12%] bg-rose-400 z-10",
                  "border border-rose-600 rounded-t-md rounded-b-md"
                )}
                style={{
                  marginTop: `${baseMarginYPx + topOffset}px`,
                  marginLeft: `${leftOffset * marginLeft + 0.25}%`,
                  height: `${
                    8 + (minutesDiff / 15) * tdHeightPx - baseMarginYPx
                  }px`,
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
                      "absolute cursor-pointer text-xs text-center font-semibold text-white w-[12%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      top: `${baseMarginYPx + topOffset}px`,
                      left: `${leftOffset * marginLeft + 0.25}%`,
                      height: `${fullheightPx - topOffset - baseMarginYPx}px`,
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
                      "absolute cursor-pointer text-xs text-center font-semibold text-white w-[12%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      top: baseMarginYPx,
                      left: `${(i + leftOffset) * marginLeft + 0.25}%`,
                      height: `${fullheightPx - baseMarginYPx}px`,
                    }}
                  >
                    {"00:00 C 00:00"}
                  </div>
                );
              } else if (
                DateTime.fromJSDate(event.end).toFormat("HH:mm") !== "00:00"
              ) {
                const lastDivBottomOffset =
                  DateTime.fromJSDate(event.end).hour * YOffsetPx +
                  minuteOffsets[event.end.getMinutes() as 0 | 15 | 30 | 45];

                elements.push(
                  // DIV CASE D
                  <div
                    key={i}
                    onClick={() => {
                      handleClickDeleteDiv(index, events, oh, setOh);
                    }}
                    className={
                      "absolute cursor-pointer text-xs text-center font-semibold text-white w-[12%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      top: baseMarginYPx,
                      left: `${(i + leftOffset) * marginLeft + 0.25}%`,
                      height: `${
                        tdHeightPx + lastDivBottomOffset - baseMarginYPx
                      }px`,
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
