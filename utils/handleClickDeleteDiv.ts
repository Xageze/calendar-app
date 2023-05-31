import { DateTime } from "luxon";

function handleClickDeleteDiv(
  index: number,
  events: { start: Date; end: Date }[],
  oh: string[]
) {
  let ohOffset = 0;

  // If selected div is not the first one
  for (let i = 0; i < index; i++) {
    // for each event until it reach the selected one add the number of days between the start and the end to get offset
    const start = DateTime.fromJSDate(events[i].start).startOf("day");
    const end = DateTime.fromJSDate(events[i].end).startOf("day");

    if (end.diff(start, "days").days === 1 && end.hour === 0) {
      ohOffset += 1;
    } else ohOffset += 1 + end.diff(start, "days").days;
  }

  const start = DateTime.fromJSDate(events[index].start).startOf("day");
  const end = DateTime.fromJSDate(events[index].end).startOf("day");
  const deleteCount = end.diff(start, "days").days + 1;
  oh.splice(ohOffset, deleteCount);
  // console.log(ohOffset, deleteCount);
}

export default handleClickDeleteDiv;
