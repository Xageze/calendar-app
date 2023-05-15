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
const hours = [
  "00h",
  "01h",
  "02h",
  "03h",
  "04h",
  "05h",
  "06h",
  "07h",
  "08h",
  "09h",
  "10h",
  "11h",
  "12h",
  "13h",
  "14h",
  "15h",
  "16h",
  "17h",
  "18h",
  "19h",
  "20h",
  "21h",
  "22h",
  "23h",
  "24h",
];

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

    let dateRangeStart = DateTime.fromFormat(
      mouseDown,
      "EEEE HH'h'"
    ).toJSDate();

    let dateRangeEnd = DateTime.fromFormat(mouseUp, "EEEE HH'h'").toJSDate();

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

  // Change TD Color if TD is in events Date Range
  function handleinDateRange(day: string, hour: string) {
    hour = hour.substring(0, 2);
    const tdDate = DateTime.fromFormat(day + " " + hour, "EEEE HH").toJSDate();

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
    hour = hour.substring(0, 2);
    const tdDate = DateTime.fromFormat(day + " " + hour, "EEEE HH").toJSDate();

    if (hoveringEvent === undefined) {
      return false;
    }

    if (hoveringEvent.start <= tdDate && tdDate <= hoveringEvent.end) {
      return true;
    }
    return false;
  }

  // Create Hover Date Range when the mouse move hover TD && mousePressed
  function handleMouseMove(day: string, hour: string) {
    if (mousePressed) {
      let dateRangeStart = DateTime.fromFormat(
        mouseDown,
        "EEEE HH'h'"
      ).toJSDate();
      let dateRangeEnd = DateTime.fromFormat(
        day + " " + hour,
        "EEEE HH'h'"
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
      setOh((prev) => prev + ` ${weekdayStart} ${startHour}-${endHour};`);
    } else {
      if (startDateLuxon.hour >= endDateLuxon.hour && nbJourDiff === 1) {
        setOh((prev) => prev + ` ${weekdayStart} ${startHour}-${endHour};`);
      } else {
        setOh((prev) => prev + ` ${weekdayStart} ${startHour}-24:00;`);
        for (let i = 1; i < nbJourDiff; i++) {
          const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
            .plus({ days: i })
            .toFormat("EEE")
            .substring(0, 2);
          setOh((prevValue) => prevValue + nextDay + ` 00:00-24:00;`);
        }
        setOh((prevValue) => prevValue + ` ${weekdayEnd} 00:00-${endHour};`);
      }
    }
  }

  return (
    <div>
      <div className="flex space-x-10 mt-10">
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
      <table className="my-4">
        <thead>
          <tr>
            <th className="w-10"></th>
            {days.map((day) => (
              <th key={day} className="w-24">
                {day}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      <div>
        <table>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="w-10">{hour}</td>
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
    </div>
  );
};
