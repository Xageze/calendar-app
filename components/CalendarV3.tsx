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
    setMouseDown("");
    setMouseUp("");
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

    try {
      setGoodOSMFormat(true);
      const eventsOhFormat = new opening_hours(e.target.value).getOpenIntervals(
        DateTime.now().startOf("week").toJSDate(),
        DateTime.now().endOf("week").toJSDate()
      );
      // Create New Events Array from Oh Array
      const newEvents = [];
      for (let i = 0; i < eventsOhFormat.length; i++) {
        const event = {
          start: eventsOhFormat[i][0],
          end: eventsOhFormat[i][1],
        };
        newEvents.push(event);
      }
      setEvents(newEvents);
    } catch (error) {
      setGoodOSMFormat(false);
    }
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
        <p className="mb-10 text-sm font-semibold tracking-wider text-red-500">
          {isGoodOSMFormat ? "" : "Veuillez entrer un format OSM valide"}
        </p>
      </div>
      {/* CALENDAR DAYS, BODY, DATERANGE */}
      <div className="relative mt-14 w-[80%]">
        <DateRange
          goodInputValue={isGoodOSMFormat}
          events={events}
          oh={oh}
          setOh={setOh}
        />
        {/* DAYS */}
        <table className="w-full select-none">
          <thead>
            <tr>
              <th className="w-[12.5%]" />
              {days.map((day) => (
                <th key={day} className="w-[12.5%]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* BODY */}
        <table className="relative mb-10 w-full select-none">
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
    </div>
  );
};
