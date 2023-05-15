"use client";

import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { ChangeEvent, useEffect, useState } from "react";
import { DateTime } from "luxon";
import opening_hours from "opening_hours";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const oh = new opening_hours("Mo 08:00-14:00; Th 08:00-12:00");
// Get Events with good form for my calendar from OSM format opening_hours
const events = oh
  .getOpenIntervals(
    DateTime.now().startOf("week").toJSDate(),
    DateTime.now().endOf("week").toJSDate()
  )
  .map(([start, end]) => {
    return {
      title: "",
      start,
      end,
    };
  });

export const CalendarV2: React.FC = () => {
  const [updatedEvents, setUpdatedEvents] = useState(events);
  const [updatedOh, setUpdatedOh] = useState<opening_hours | string>(oh);

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
      setUpdatedOh(
        (prev) => prev + ` ${weekdayStart} ${startHour}-${endHour};`
      );
    } else {
      if (startDateLuxon.hour >= endDateLuxon.hour && nbJourDiff === 1) {
        setUpdatedOh(
          (prev) => prev + ` ${weekdayStart} ${startHour}-${endHour};`
        );
      } else {
        setUpdatedOh((prev) => prev + ` ${weekdayStart} ${startHour}-24:00;`);
        for (let i = 1; i < nbJourDiff; i++) {
          const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
            .plus({ days: i })
            .toFormat("EEE")
            .substring(0, 2);
          setUpdatedOh((prevValue) => prevValue + nextDay + ` 00:00-24:00,`);
        }
        setUpdatedOh(
          (prevValue) => prevValue + ` ${weekdayEnd} 00:00-${endHour};`
        );
      }
    }
  }

  function handleSelecting(range: { start: Date; end: Date }) {
    const { start, end } = range;

    setUpdatedEvents((prev) => [
      ...prev,
      {
        title: "",
        start,
        end,
      },
    ]);
    return true;
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setUpdatedOh(e.target.value);
    setUpdatedEvents([]);
    // set new Event from OS input value
    setUpdatedEvents(
      new opening_hours(e.target.value)
        .getOpenIntervals(
          DateTime.now().startOf("week").toJSDate(),
          DateTime.now().endOf("week").toJSDate()
        )
        .map(([start, end]) => {
          return {
            title: "",
            start,
            end,
          };
        })
    );
  }

  useEffect(() => {
    setUpdatedOh("");
    updatedEvents.forEach((event) => {
      getOsmDate(event.start, event.end);
    });
  }, [updatedEvents]);

  return (
    <div className="my-40 w-full">
      <div className="flex space-x-4">
        <input
          className="w-full mb-10 px-4 py-2 bg-gray-50 border border-black rounded-md text-center tracking-wider"
          value={updatedOh.toString()}
          onChange={(e) => {
            handleInputChange(e);
          }}
        />
        <button
          className="px-8 py-2 h-min bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-semibold"
          onClick={() => {
            setUpdatedEvents([]);
            setUpdatedOh("");
          }}
        >
          Clear
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={updatedEvents}
        startAccessor="start"
        endAccessor="end"
        showMultiDayTimes
        selectable
        onSelectSlot={(range) => handleSelecting(range)}
        onSelectEvent={(e) => {
          setUpdatedEvents((prev) => prev.filter((event) => event !== e));
        }}
        style={{ height: 700 }}
      />
    </div>
  );
};
