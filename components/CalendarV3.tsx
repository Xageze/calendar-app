import React, { ChangeEvent, useMemo, useState } from "react";
import { CustomTd } from "./CustomTd";
import { DateTime } from "luxon";
import { DateRange } from "./DateRange";
import opening_hours from "opening_hours";
import createOsmFormat from "@/utils/createOsmFormat";

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

export const CalendarV3: React.FC = () => {
  const [mousePressed, setMousePressed] = useState(false);
  const [mouseDown, setMouseDown] = useState("");
  const [mouseUp, setMouseUp] = useState("");
  const [events, setEvents] = useState<{ start: Date; end: Date }[]>([]);
  const [hoveringEvent, setHoveringEvent] = useState<{
    start: Date;
    end: Date;
  }>();
  const [oh, setOh] = useState<string>("");
  const [goodOSMFormat, setGoodOSMFormat] = useState(true);

  // Create OSM & Events array when click release (MouseUp)
  useMemo(() => {
    if (!mouseDown || !mouseUp) return false;

    let dateRangeStart = DateTime.fromFormat(mouseDown, "EEEE T").toJSDate();
    // Add 15 minutes to end date to make it end correctly
    let dateRangeEnd = DateTime.fromFormat(mouseUp, "EEEE T")
      .plus({ minutes: 15 })
      .toJSDate();

    // If you select a date range from end date to start date, it will swap them
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

    createOsmFormat(dateRangeStart, dateRangeEnd, setOh);
    return;
    // TODO gérer tableau de dépendance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseUp]);

  // Create OSM when Input Change
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    // Set Input Text
    setOh(e.target.value);

    // Create Events Array
    const ohArray = e.target.value.split(";");
    try {
      setGoodOSMFormat(true);
      setEvents(
        ohArray
          .filter((yay) => yay.trim() !== "")
          .map((yay) => {
            const EventFormat = new opening_hours(yay).getOpenIntervals(
              DateTime.now().startOf("week").toJSDate(),
              DateTime.now().endOf("week").toJSDate()
            );
            return { start: EventFormat[0][0], end: EventFormat[0][1] };
          })
      );
    } catch (error) {
      setGoodOSMFormat(false);
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

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* OSM INPUT + CLEAR BUTTON */}
      <div className="flex space-x-4 pt-10 w-[80%]">
        <input
          className="w-full px-4 py-2 bg-gray-50 border border-black rounded-md text-center tracking-wider"
          value={oh}
          onChange={(e) => {
            handleInputChange(e);
          }}
        />

        <button
          className="px-8 py-2 bg-green-400 hover:bg-green-500 border border-green-500 hover:border-green-600 text-white rounded-lg font-semibold"
          onClick={() => {
            setEvents([]);
            setOh("");
            setHoveringEvent(undefined);
            setGoodOSMFormat(true);
          }}
        >
          Clear
        </button>
      </div>
      <p className="mb-10 text-sm font-semibold tracking-wider text-red-500">
        {goodOSMFormat ? "" : "Veuillez entrer un format OSM valide"}
      </p>

      {/* CALENDAR HEADER */}
      <table className="w-[80%]">
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
        <DateRange
          goodInputValue={goodOSMFormat}
          events={events}
          oh={oh}
          setOh={setOh}
        />
        <tbody>
          {hours.map((hour, i) => (
            <tr key={hour}>
              <td
                className="relative font-semibold w-[12.5%] leading-[0px] border-l border-slate-300"
                style={
                  i % 4 === 0
                    ? { borderTop: "1px solid rgb(203 213 225)" }
                    : {} && i % 4 === 3
                    ? { borderBottom: "1px solid rgb(203 213 225)" }
                    : {}
                }
              >
                <span className="absolute top-2 left-0.5">
                  {hour.endsWith("00") && hour}
                </span>
              </td>
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Monday"}
                hour={hour}
                inDateRange={handleinDateRange("Monday", hour)}
                isHovering={handleTDHoverColor("Monday", hour)}
                index={i}
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
                index={i}
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
                index={i}
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
                index={i}
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
                index={i}
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
                index={i}
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
                index={i}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
