"use client";

import { CalendarV1 } from "@/components/CalendarV1";
import { CalendarV2 } from "@/components/CalendarV2";
import { CalendarV3 } from "@/components/CalendarV3";

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col items-center px-6">
      <CalendarV3 />
      <CalendarV2 />
      <CalendarV1 />
    </main>
  );
}
