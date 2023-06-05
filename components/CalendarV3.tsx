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
  const [movingEvent, setMovingEvent] = useState<{
    start: Date;
    end: Date;
  }>();
  const [oh, setOh] = useState<string>("");
  const [isGoodOSMFormat, setGoodOSMFormat] = useState(true);

  /**
   * When MOUSE UP (release mouse click)
   * If mouseDown or mouseUp are both defined :
   *
   * Fill the Events array with the new event selected
   * Create OSM Format
   */
  useMemo(() => {
    if (!mouseDown || !mouseUp) return false;

    let dateRangeStart = DateTime.fromFormat(mouseDown, "EEEE T").toJSDate();
    let dateRangeEnd = DateTime.fromFormat(mouseUp, "EEEE T").toJSDate();

    // If you select a date range from end date to start date, it will swap them
    if (dateRangeStart > dateRangeEnd) {
      let tempDateRangeStart = dateRangeStart;
      dateRangeStart = dateRangeEnd;
      dateRangeEnd = tempDateRangeStart;
    }

    // Add 15 minutes to the end date
    dateRangeEnd = DateTime.fromJSDate(dateRangeEnd)
      .plus({ minutes: 15 })
      .toJSDate();

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

  /**
   * When Input Change (Writing in it)
   *
   * setOh -> Input Value
   * Manage error message if the input value is not in OSM Format
   * Fill Events Array with Events from the Input Value
   */
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    // Set Input Text
    setOh(e.target.value);

    // Create Events Array (+ Remove if there is multiple ";")
    const ohArray = e.target.value
      .split(";")
      .map((substring) => substring.trim())
      .filter((substring) => substring !== "");

    try {
      setGoodOSMFormat(true);
      setEvents(
        ohArray
          .filter((ohElement) => ohElement.trim() !== "")
          .map((ohElement) => {
            const EventFormat = new opening_hours(ohElement).getOpenIntervals(
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

  /**
   * At Each CalendarV3 Render :
   * Return TRUE if the TD is in the Date Range of Events else FALSE
   */
  function handleIsInDateRange(day: string, hour: string) {
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

  /**
   *  Return TRUE if the TD is in the Date Range of the "movingEvent" else FALSE
   *  Change bg color of CustomTd
   */
  function handleIsTDInMovingEventRange(day: string, hour: string) {
    if (mousePressed) {
      const tdDate = DateTime.fromFormat(day + " " + hour, "EEEE T").toJSDate();
      if (movingEvent === undefined) {
        return false;
      }
      if (movingEvent.start <= tdDate && tdDate <= movingEvent.end) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create a "movingEvent" when the click is pressed and the mouse moving
   */
  function handleMouseMove(day: string, hour: string) {
    setMovingEvent(undefined);
    if (mousePressed) {
      let dateRangeStart = DateTime.fromFormat(mouseDown, "EEEE T").toJSDate();
      let dateRangeEnd = DateTime.fromFormat(
        day + " " + hour,
        "EEEE T"
      ).toJSDate();

      // Most old date always the Start Date
      if (dateRangeStart > dateRangeEnd) {
        let tempDateRangeStart = dateRangeStart;
        dateRangeStart = dateRangeEnd;
        dateRangeEnd = tempDateRangeStart;
      }

      setMovingEvent({ start: dateRangeStart, end: dateRangeEnd });
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
          className="px-8 py-2 bg-rose-400 hover:bg-rose-500 border border-rose-500 hover:border-rose-600 text-white rounded-lg font-semibold"
          onClick={() => {
            setEvents([]);
            setOh("");
            setMovingEvent(undefined);
            setGoodOSMFormat(true);
          }}
        >
          Clear
        </button>
      </div>
      <p className="mb-10 text-sm font-semibold tracking-wider text-red-500">
        {isGoodOSMFormat ? "" : "Veuillez entrer un format OSM valide"}
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
          goodInputValue={isGoodOSMFormat}
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
                isInDateRange={handleIsInDateRange("Monday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Monday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Tuesday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Tuesday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Tuesday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Wednesday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Wednesday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Wednesday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Thursday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Thursday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Thursday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Friday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Friday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Friday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Saturday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Saturday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Saturday",
                  hour
                )}
                index={i}
              />
              <CustomTd
                setMouseDown={setMouseDown}
                setMouseUp={setMouseUp}
                setMousePressed={setMousePressed}
                handleMouseMove={handleMouseMove}
                day={"Sunday"}
                hour={hour}
                isInDateRange={handleIsInDateRange("Sunday", hour)}
                isTDInMovingEventRange={handleIsTDInMovingEventRange(
                  "Sunday",
                  hour
                )}
                index={i}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
