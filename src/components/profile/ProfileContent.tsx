import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  challenges,
  profileAvatar,
} from "@/components/landing/hero/data/heroScene.mock";

const calendarDays = [
  "",
  "",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

const selectedDays = new Set(["3", "4", "5", "6", "7"]);

export function ProfileContent() {
  return (
    <>
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <p className="text-xs font-semibold text-white/70">Profile</p>
        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-extrabold text-[#171a16]">
          EDIT
        </span>
      </div>

      <div className="shrink-0 text-center">
        <div
          className="mx-auto size-[82px] rounded-full border border-white/80 bg-cover bg-center ring-2 ring-white/20"
          style={{ backgroundImage: `url(${profileAvatar})` }}
        />
        <p className="mt-3 text-sm font-semibold text-white">Jakob Dorwart</p>
        <p className="text-[10px] text-white/44">Gym Manager</p>
      </div>

      <div className="mt-4 grid shrink-0 grid-cols-3 gap-1 rounded-2xl text-center">
        {["Age 32", "10 years", "Manager"].map((item) => (
          <span
            key={item}
            className="rounded-xl border border-white/8 bg-black/20 px-1.5 py-3 text-[9px] font-semibold text-white/56"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 shrink-0 rounded-[20px] border border-white/10 bg-black/12 p-3">
        <div className="mb-3 flex items-center justify-between">
          <ChevronLeft className="size-3.5 text-white/52" />
          <p className="text-xs font-semibold text-white/72">April</p>
          <ChevronRight className="size-3.5 text-white/52" />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-white/30">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
        <div className="relative mt-2 grid grid-cols-7 gap-1 text-center text-[8px] text-white/42">
          <span className="absolute left-[calc((100%/7)*1+2px)] top-[24px] h-[18px] w-[calc((100%/7)*5-4px)] rounded-full bg-[#176dff]" />
          {calendarDays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={
                selectedDays.has(day)
                  ? "relative z-10 py-1 font-bold text-white"
                  : "relative z-10 py-1"
              }
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 shrink-0">
        <p className="mb-3 text-xs font-semibold text-white/70">Challenges</p>
        <div className="grid gap-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.title}
              className="flex items-center justify-between rounded-[18px] border border-white/9 bg-white/5 px-3 py-3"
            >
              <div>
                <p className="text-[9px] text-white/34">{challenge.subtitle}</p>
                <p className="text-[10px] font-semibold text-white/66">
                  {challenge.title}
                </p>
              </div>
              <div
                className="grid size-10 shrink-0 place-items-center rounded-full p-1"
                style={{
                  background: `conic-gradient(#2777ff 0 ${challenge.progress}%, rgba(255,255,255,0.16) ${challenge.progress}% 100%)`,
                }}
              >
                <div className="grid size-full place-items-center rounded-full bg-[#171916]/86 text-[8px] font-bold text-white">
                  {challenge.progress}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
