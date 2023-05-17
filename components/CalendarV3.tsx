import React, { ChangeEvent, useMemo, useState } from "react";
import opening_hours from "opening_hours";
import { CustomTd } from "./CustomTd";
import { DateTime } from "luxon";

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
  const [oh, setOh] = useState<string[]>([""]);
  const [goodInputValue, setGoodInputValue] = useState(true);

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
    setOh(e.target.value.split(";"));

    try {
      setGoodInputValue(true);
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
    } catch (error) {
      setGoodInputValue(false);
      console.log(error);
    }
  }

  // Change TD Color if TD is in events Date Range
  function handleinDateRange(day: string, hour: string) {
    const tdDate = DateTime.fromFormat(day + " " + hour, "EEEE T").toJSDate();

    if (events.length === 0) {
      return false;
    }

    for (let i = 0; i < events.length; i++) {
      if (events[i].start <= tdDate && tdDate <= events[i].end) {
        return true;
      }
    }
    return false;
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

  // TODO
  // Recreate Events And OH when delete an event
  function handleClickDeleteEvent() {}

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
      setOh((prev) => [...prev, `${weekdayStart} ${startHour}-${endHour}`]);
    } else {
      if (startDateLuxon.hour >= endDateLuxon.hour && nbJourDiff === 1) {
        setOh((prev) => [...prev, `${weekdayStart} ${startHour}-${endHour}`]);
      } else {
        setOh((prev) => [...prev, `${weekdayStart} ${startHour}-24:00`]);
        for (let i = 1; i < nbJourDiff; i++) {
          const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
            .plus({ days: i })
            .toFormat("EEE")
            .substring(0, 2);
          setOh((prev) => [...prev, nextDay + ` 00:00-24:00`]);
        }
        setOh((prev) => [...prev, `${weekdayEnd} 00:00-${endHour}`]);
      }
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex space-x-10 pt-10 w-[80%]">
        <input
          className="w-full px-4 py-2 bg-gray-50 border border-black rounded-md text-center tracking-wider"
          value={oh.join(";")}
          onChange={(e) => {
            handleInputChange(e);
          }}
        />
        <button
          className="px-8 py-2 h-min bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"
          onClick={() => {
            setEvents([]);
            setOh([]);
            setHoveringEvent(undefined);
            setGoodInputValue(true);
          }}
        >
          Clear
        </button>
      </div>
      <p className="mb-10 text-sm font-semibold tracking-wider text-red-500">
        {goodInputValue ? "" : "Veuillez entrer un format OSM valide"}
      </p>

      {/* CALENDAR HEADER */}
      <table className="w-[80%] bg-purple-400/20">
        <thead>
          <tr>
            <th className="w-[12.5%]" />
            {days.map((day) => (
              <th key={day} className="w-[12.5%] text-xs sm:text-sm">
                {day}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      {/* CALENDAR BODY */}
      <table className="relative mb-10 w-[80%]">
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
                  events.splice(index, 1);
                  setEvents([...events]);
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
                      events.splice(index, 1);
                      setEvents([...events]);
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
                      events.splice(index, 1);
                      setEvents([...events]);
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
                      events.splice(index, 1);
                      setEvents([...events]);
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
                inDateRange={handleinDateRange("Monday", hour)}
                isHovering={handleTDHoverColor("Monday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Tuesday"}
                hour={hour}
                inDateRange={handleinDateRange("Tuesday", hour)}
                isHovering={handleTDHoverColor("Tuesday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Wednesday"}
                hour={hour}
                inDateRange={handleinDateRange("Wednesday", hour)}
                isHovering={handleTDHoverColor("Wednesday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Thursday"}
                hour={hour}
                inDateRange={handleinDateRange("Thursday", hour)}
                isHovering={handleTDHoverColor("Thursday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Friday"}
                hour={hour}
                inDateRange={handleinDateRange("Friday", hour)}
                isHovering={handleTDHoverColor("Friday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Saturday"}
                hour={hour}
                inDateRange={handleinDateRange("Saturday", hour)}
                isHovering={handleTDHoverColor("Saturday", hour)}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Sunday"}
                hour={hour}
                inDateRange={handleinDateRange("Sunday", hour)}
                isHovering={handleTDHoverColor("Sunday", hour)}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
