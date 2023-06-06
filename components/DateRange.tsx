import {
  marginLeft,
  baseMarginYPx,
  tdHeightPx,
  YOffsetPx,
  fullheightPx,
  marginTopPx,
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
          const topOffset =
            event.start.getHours() * YOffsetPx +
            (event.start.getMinutes() * YOffsetPx) / 60;

          const leftOffset = DateTime.fromJSDate(event.start).weekday;

          const startDate = DateTime.fromJSDate(event.start).toFormat(
            "yyyy-MM-dd"
          );
          const endDate = DateTime.fromJSDate(event.end).toFormat("yyyy-MM-dd");

          const isSameDay = DateTime.fromISO(startDate).equals(
            DateTime.fromISO(endDate)
          );

          // IF SAME DAY
          if (isSameDay) {
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
                  marginTop: `${marginTopPx + baseMarginYPx + topOffset}px`,
                  marginLeft: `${leftOffset * marginLeft + 0.25}%`,
                  height: `${
                    (minutesDiff / 15) * tdHeightPx - baseMarginYPx
                  }px`,
                }}
              >
                {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                  " - " +
                  DateTime.fromJSDate(event.end).toFormat("HH:mm")}
              </div>
            );
          }
          // IF NOT SAME DAY
          if (!isSameDay) {
            // Get day only difference
            const dayStart = DateTime.fromJSDate(event.start).toFormat(
              "yyyy-MM-dd"
            );
            const dayEnd = DateTime.fromJSDate(event.end).toFormat(
              "yyyy-MM-dd"
            );
            const dayDiff = DateTime.fromISO(dayEnd).diff(
              DateTime.fromISO(dayStart),
              "days"
            ).days;

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
                      top: `${marginTopPx + baseMarginYPx + topOffset}px`,
                      left: `${leftOffset * marginLeft + 0.25}%`,
                      height: `${fullheightPx - topOffset - baseMarginYPx}px`,
                    }}
                  >
                    {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                      " - " +
                      "24:00"}
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
                      top: baseMarginYPx + marginTopPx,
                      left: `${(i + leftOffset) * marginLeft + 0.25}%`,
                      height: `${fullheightPx - baseMarginYPx}px`,
                    }}
                  >
                    {"00:00 - 24:00"}
                  </div>
                );
              } else if (
                DateTime.fromJSDate(event.end).toFormat("HH:mm") !== "00:00"
              ) {
                const lastDivBottomOffset =
                  DateTime.fromJSDate(event.end).hour * YOffsetPx +
                  (DateTime.fromJSDate(event.end).minute * YOffsetPx) / 60;

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
                      top: baseMarginYPx + marginTopPx,
                      left: `${(i + leftOffset) * marginLeft + 0.25}%`,
                      height: `${lastDivBottomOffset - baseMarginYPx}px`,
                    }}
                  >
                    {"00:00 - " +
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
