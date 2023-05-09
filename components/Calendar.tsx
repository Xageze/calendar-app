"use client";

import React, { useState } from "react";
import { DateTime } from "luxon";

export const Calendar: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [osmDate, setOsmDate] = useState("");

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

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
      setOsmDate(`${weekdayStart} ${startHour}-${endHour}`);
    } else {
      if (startDateLuxon.hour >= endDateLuxon.hour && nbJourDiff === 1) {
        setOsmDate(`${weekdayStart} ${startHour}-${endHour}`);
      } else {
        setOsmDate(`${weekdayStart} ${startHour}-24:00; `);
        for (let i = 1; i < nbJourDiff; i++) {
          const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
            .plus({ days: i })
            .toFormat("EEE")
            .substring(0, 2);
          setOsmDate((prevValue) => prevValue + nextDay + ` 00:00-24:00; `);
        }
        setOsmDate((prevValue) => prevValue + `${weekdayEnd} 00:00-${endHour}`);
      }
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="mb-6">Calendrier</h1>
      <label>
        Start Date:
        <input
          type="datetime-local"
          value={startDate}
          onChange={handleStartDateChange}
          className="bg-gray-100 px-2 py-1 rounded-md"
        />
      </label>
      <br />
      <label>
        End Date:
        <input
          type="datetime-local"
          value={endDate}
          onChange={handleEndDateChange}
          className="bg-gray-100 px-2 py-1 rounded-md"
        />
      </label>
      <button
        onClick={() => getOsmDate(new Date(startDate), new Date(endDate))}
        className="mt-14 px-4 py-2 rounded-md bg-green-200 hover:bg-green-300"
      >
        Get OSM time
      </button>
      <div className="mt-10 space-y-5">
        <p>Start date : {startDate}</p>
        <p>End date : {endDate}</p>
        <p>Osm date : {osmDate}</p>
      </div>
    </div>
  );
};
