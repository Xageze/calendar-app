import React, { ChangeEvent, useMemo, useState } from "react";
import { CustomTd } from "./CustomTd";
import { DateTime } from "luxon";
import opening_hours from "opening_hours";

const days = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const hours: string[] = [];
for (let hour = 0; hour < 24; hour++) {
  const hourString = hour.toString().padStart(2, "0");
  for (let minute = 0; minute < 60; minute += 15) {
    const minuteString = minute.toString().padStart(2, "0");
    hours.push(hourString + ":" + minuteString);
  }
}
hours.push("24:00");

export const CalendarV3: React.FC = () => {
  const [mousePressed, setMousePressed] = useState(false);
  const [mouseDown, setMouseDown] = useState("");
  const [mouseUp, setMouseUp] = useState("");
  const [events, setEvents] = useState<{ start: Date; end: Date }[]>([]);
  const [hoveringEvent, setHoveringEvent] = useState<{
    start: Date;
    end: Date;
  }>();
  const [oh, setOh] = useState<opening_hours | string>("");

  // Create OSM & Events array when click release (MouseUp)
  useMemo(() => {
    if (!mouseDown || !mouseUp) return false;

    let dateRangeStart = DateTime.fromFormat(mouseDown, "EEEE T").toJSDate();
    let dateRangeEnd = DateTime.fromFormat(mouseUp, "EEEE T").toJSDate();

    if (dateRangeStart > dateRangeEnd) {
      let tempDateRangeStart = dateRangeStart;
      dateRangeStart = dateRangeEnd;
      dateRangeEnd = tempDateRangeStart;
    }

    setEvents((prev) => [
      ...prev,
      {
        start: dateRangeStart,
        end: dateRangeEnd,
      },
    ]);
    getOsmDate(dateRangeStart, dateRangeEnd);

    return;
    // TODO gérer tableau de dépendance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseUp]);

  // Create OSM when Input Change
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setOh(e.target.value);

    // set new Event from OS input value
    setEvents(
      new opening_hours(e.target.value)
        .getOpenIntervals(
          DateTime.now().startOf("week").toJSDate(),
          DateTime.now().endOf("week").toJSDate()
        )
        .map(([start, end]) => {
          return {
            start,
            end,
          };
        })
    );
  }

  // Change TD Color if TD is in Hovering Event Date Range
  function handleTDHoverColor(day: string, hour: string) {
    if (mousePressed) {
      const tdDate = DateTime.fromFormat(day + " " + hour, "EEEE T").toJSDate();

      if (hoveringEvent === undefined) {
        return false;
      }

      if (hoveringEvent.start <= tdDate && tdDate <= hoveringEvent.end) {
        return true;
      }
    }
    return false;
  }

  // Create Hover Date Range when the mouse move hover TD && mousePressed
  function handleMouseMove(day: string, hour: string) {
    if (mousePressed) {
      let dateRangeStart = DateTime.fromFormat(mouseDown, "EEEE T").toJSDate();
      let dateRangeEnd = DateTime.fromFormat(
        day + " " + hour,
        "EEEE T"
      ).toJSDate();

      if (dateRangeStart > dateRangeEnd) {
        let tempDateRangeStart = dateRangeStart;
        dateRangeStart = dateRangeEnd;
        dateRangeEnd = tempDateRangeStart;
      }

      setHoveringEvent({ start: dateRangeStart, end: dateRangeEnd });
    }
  }

  // Create OSM Date format
  function getOsmDate(startDate: Date, endDate: Date) {
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();

    const startDateLuxon = DateTime.fromISO(startDateISO);
    const endDateLuxon = DateTime.fromISO(endDateISO);

    const weekdayStart = startDateLuxon.toFormat("EEE").substring(0, 2);
    const weekdayEnd = endDateLuxon.toFormat("EEE").substring(0, 2);
    const startHour = startDateLuxon.toFormat("HH:mm");
    const endHour = endDateLuxon.toFormat("HH:mm");

    const nbJourDiff = parseInt(
      endDateLuxon.diff(startDateLuxon, "days").days.toFixed(0)
    );
    if (startDateLuxon.hasSame(endDateLuxon, "day")) {
      setOh((prev) => prev + `${weekdayStart} ${startHour}-${endHour}; `);
    } else {
      if (startDateLuxon.hour >= endDateLuxon.hour && nbJourDiff === 1) {
        setOh((prev) => prev + `${weekdayStart} ${startHour}-${endHour}; `);
      } else {
        setOh((prev) => prev + `${weekdayStart} ${startHour}-24:00; `);
        for (let i = 1; i < nbJourDiff; i++) {
          const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
            .plus({ days: i })
            .toFormat("EEE")
            .substring(0, 2);
          setOh((prevValue) => prevValue + nextDay + ` 00:00-24:00; `);
        }
        setOh((prevValue) => prevValue + `${weekdayEnd} 00:00-${endHour}; `);
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex space-x-10 py-10 w-[80%]">
        <input
          className="w-full mb-10 px-4 py-2 bg-gray-50 border border-black rounded-md text-center tracking-wider"
          value={oh.toString()}
          onChange={(e) => {
            handleInputChange(e);
          }}
        />
        <button
          className="px-8 py-2 h-min bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"
          onClick={() => {
            setEvents([]);
            setOh("");
            setHoveringEvent(undefined);
          }}
        >
          Clear
        </button>
      </div>

      {/* CALENDAR HEADER */}
      <table className="w-[80%] bg-purple-400/20">
        <thead>
          <tr>
            <th className="w-[12.5%]" />
            {days.map((day) => (
              <th key={day} className="text-xs sm:text-sm">
                {day}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      {/* CALENDAR BODY */}
      <table className="relative w-[80%]">
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

            return (
              <div
                key={index}
                className={
                  "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                }
                style={{
                  marginTop: `${topOffset}px`,
                  marginLeft: `${leftOffset * 12.5 + 0.5}%`,
                  height: `${28 + (minutesDiff / 15) * 28}px`,
                }}
              >
                {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                  " - " +
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
            for (let index = 0; index <= dayDiff; index++) {
              if (index === 0) {
                elements.push(
                  <div
                    key={index}
                    className={
                      "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      top: `${topOffset}px`,
                      left: `${leftOffset * 12.5 + 0.5}%`,
                      height: `${2716 - topOffset}px`,
                    }}
                  >
                    {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                      " - " +
                      "00:00"}
                  </div>
                );
              } else if (index !== dayDiff) {
                elements.push(
                  <div
                    key={index}
                    className={
                      "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      left: `${(index + leftOffset) * 12.5 + 0.5}%`,
                      height: `${2716}px`,
                    }}
                  >
                    {"00:00 - 00:00"}
                  </div>
                );
              } else {
                const lastDivBottomOffset =
                  DateTime.fromJSDate(event.end).hour * 112 +
                  minuteOffsets[event.end.getMinutes() as 0 | 15 | 30 | 45];

                elements.push(
                  <div
                    key={index}
                    className={
                      "absolute text-xs text-center font-semibold text-white w-[11.5%] bg-rose-400 z-10 border border-rose-600 rounded-t-md rounded-b-md"
                    }
                    style={{
                      left: `${(index + leftOffset) * 12.5 + 0.5}%`,
                      height: `${28 + lastDivBottomOffset}px`,
                    }}
                  >
                    {DateTime.fromJSDate(event.start).toFormat("HH:mm") +
                      " - " +
                      DateTime.fromJSDate(event.end).toFormat("HH:mm")}
                  </div>
                );
              }
            }
            return elements;
          }
        })}
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td className="w-[12.5%]">{hour.endsWith("00") && hour}</td>
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Monday"}
                hour={hour}
                isHovering={handleTDHoverColor("Monday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Tuesday"}
                hour={hour}
                isHovering={handleTDHoverColor("Tuesday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Wednesday"}
                hour={hour}
                isHovering={handleTDHoverColor("Wednesday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Thursday"}
                hour={hour}
                isHovering={handleTDHoverColor("Thursday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Friday"}
                hour={hour}
                isHovering={handleTDHoverColor("Friday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Saturday"}
                hour={hour}
                isHovering={handleTDHoverColor("Saturday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Sunday"}
                hour={hour}
                isHovering={handleTDHoverColor("Sunday", hour)}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
