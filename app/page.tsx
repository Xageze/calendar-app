import { Calendar } from "@/components/Calendar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="h-full w-full pt-20 flex flex-col justify-center items-center">
      <Calendar />
    </main>
  );
}
