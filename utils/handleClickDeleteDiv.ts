import { DateTime } from "luxon";

function handleClickDeleteDiv(
  index: number,
  events: { start: Date; end: Date }[],
  oh: string,
  setOh: React.Dispatch<React.SetStateAction<string>>
) {
  let ohOffset = 0;

  // If selected div is not the first one
  for (let i = 0; i < index; i++) {
    // All div before the selected one
    const dayStart = DateTime.fromJSDate(events[i].start).startOf("day");
    const dateEnd = DateTime.fromJSDate(events[i].end);
    const dayEnd = DateTime.fromJSDate(events[i].end).startOf("day");

    // If end at midnight
    if (dateEnd.hour === 0) {
      ohOffset += dayEnd.diff(dayStart, "days").days;
    } else if (dayStart.hour > dayEnd.hour) {
      ohOffset += 1 + dayEnd.diff(dayStart, "days").days;
    } else if (dayStart.hour <= dayEnd.hour) {
      ohOffset += 1;
    }
  }

  // Clicked DIV
  const dateStart = DateTime.fromJSDate(events[index].start);
  const dayStart = DateTime.fromJSDate(events[index].start).startOf("day");
  const dateEnd = DateTime.fromJSDate(events[index].end);
  const dayEnd = DateTime.fromJSDate(events[index].end).startOf("day");

  let deleteCount = 1;

  // If One day diff but start hour > end hour

  if (
    dayEnd.diff(dayStart, "days").days === 1 &&
    dateStart.hour >= dateEnd.hour
  ) {
  } else deleteCount += dayEnd.diff(dayStart, "days").days;

  // Create Events Array
  const ohArray = oh.split(";");

  // Remove the selected div from the Oh string
  ohArray.splice(ohOffset, deleteCount);

  // Recreate a full string from the ohArray
  const newOh = ohArray.join(";").trim();
  setOh(newOh);

  // Remove Event from Events[]
  events.splice(index, 1);
}

export default handleClickDeleteDiv;
