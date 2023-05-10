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
  const [mouseDown, setMouseDown] = useState<string>("");
  const [mouseUp, setMouseUp] = useState<string>("");
  const [events, setEvents] = useState<{}[]>([]);
  const [oh, setOh] = useState<opening_hours | string>("");

  useMemo(() => {
    if (!mouseDown || !mouseUp) return false;
    const dateMouseDown = DateTime.fromFormat(mouseDown, "EEE HH'h'", {
      locale: "fr",
    });
    const dateMouseUp = DateTime.fromFormat(mouseUp, "EEE HH'h'", {
      locale: "fr",
    });

    setEvents((prev) => [
      ...prev,
      {
        start:
          dateMouseDown.toFormat("EEE", { locale: "en" }).substring(0, 2) +
          dateMouseUp.toFormat(" HH", { locale: "en" }),
        end:
          dateMouseUp.toFormat("EEE", { locale: "en" }).substring(0, 2) +
          // TODO Add minute ?
          dateMouseUp.toFormat(" HH", { locale: "en" }),
      },
    ]);

    getOsmDate(dateMouseDown.toJSDate(), dateMouseUp.toJSDate());

    return true;
    // TODO gérer tableau de dépendance
  }, [mouseUp]);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setOh(e.target.value);
    setEvents([]);
    // set new Event from OS input value
    setEvents(
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

  console.log(events);

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
          }}
        >
          Clear
        </button>
      </div>
      <table className="my-10">
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
            {hours.map((hour) => {
              return (
                <tr key={hour} className="">
                  <td className="w-10">{hour}</td>
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Lun"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Mar"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Mer"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Jeu"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Ven"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Sam"}
                    hour={hour}
                  />
                  <CustomTd
                    setMouseDown={setMouseDown}
                    setMouseUp={setMouseUp}
                    day={"Dim"}
                    hour={hour}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
