import { DateTime } from "luxon";

// Create OSM Date format
function createOsmFormat(
  startDate: Date,
  endDate: Date,
  setOh: React.Dispatch<React.SetStateAction<string>>
) {
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  const startDateLuxon = DateTime.fromISO(startDateISO);
  const endDateLuxon = DateTime.fromISO(endDateISO);

  const weekdayStart = startDateLuxon.toFormat("EEE").substring(0, 2);
  const weekdayEnd = endDateLuxon.toFormat("EEE").substring(0, 2);
  const startHour = startDateLuxon.toFormat("HH:mm");
  const endHour = endDateLuxon.toFormat("HH:mm");

  const nbJourDiff = endDateLuxon
    .startOf("day")
    .diff(startDateLuxon.startOf("day"), "days").days;

  // If same day
  if (startDateLuxon.hasSame(endDateLuxon, "day")) {
    setOh((prev) => `${prev} ${weekdayStart} ${startHour}-${endHour},`);
  } else {
    // If start hour is after end hour AND one day diff
    if (
      startDateLuxon.hour >= endDateLuxon.hour &&
      nbJourDiff === 1 &&
      endDateLuxon.hour !== 0
    ) {
      setOh((prev) => `${prev} ${weekdayStart} ${startHour}-${endHour},`);
    } else {
      setOh((prev) => `${prev} ${weekdayStart} ${startHour}-24:00,`);
      for (let i = 1; i < nbJourDiff; i++) {
        const nextDay = DateTime.fromObject({ weekday: startDate.getDay() })
          .plus({ days: i })
          .toFormat("EEE")
          .substring(0, 2);
        setOh((prev) => prev + " " + nextDay + ` 00:00-24:00,`);
      }

      // If one day diff + end hour is 00:00 (case when you end at midnight and it skip to next day)
      if (endDateLuxon.hour === 0) {
      } else {
        setOh((prev) => `${prev} ${weekdayEnd} 00:00-${endHour},`);
      }
    }
  }
}

export default createOsmFormat;
