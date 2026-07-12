import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  challenges,
  profileAvatar,
} from "@/components/landing/hero/data/hero-scene.mock";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

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
        <p className={cn(glassText.secondary, "text-xs font-semibold")}>Profile</p>
        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-extrabold text-[#171a16]">
          EDIT
        </span>
      </div>

      <div className="shrink-0 text-center">
        <div
          className="mx-auto size-[82px] rounded-full border border-white/80 bg-cover bg-center ring-2 ring-white/20"
          style={{ backgroundImage: `url(${profileAvatar})` }}
        />
        <p className={cn(glassTextStyles.panelTitle, "mt-3 text-sm")}>Jakob Dorwart</p>
        <p className={glassTextStyles.entityEmail}>Gym Manager</p>
      </div>

      <div className="mt-4 grid shrink-0 grid-cols-3 gap-1 rounded-2xl text-center">
        {["Age 32", "10 years", "Manager"].map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-xl border border-white/8 bg-white/8 px-1.5 py-3 text-[9px] font-semibold",
              glassText.secondary,
            )}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 shrink-0 rounded-[20px] border border-white/10 bg-white/8 p-3">
        <div className="mb-3 flex items-center justify-between">
          <ChevronLeft className={cn("size-3.5", glassText.secondary)} />
          <p className={cn(glassText.secondary, "text-xs font-semibold")}>April</p>
          <ChevronRight className={cn("size-3.5", glassText.secondary)} />
        </div>
        <div className={cn("grid grid-cols-7 gap-1 text-center text-[8px]", glassText.muted)}>
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
        <div className={cn("relative mt-2 grid grid-cols-7 gap-1 text-center text-[8px]", glassText.muted)}>
          <span className="absolute left-[calc((100%/7)*1+2px)] top-[24px] h-[18px] w-[calc((100%/7)*5-4px)] rounded-full bg-[#176dff]" />
          {calendarDays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={
                selectedDays.has(day)
                  ? cn("relative z-10 py-1 font-bold", glassText.primary)
                  : "relative z-10 py-1"
              }
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 shrink-0">
        <p className={cn(glassText.secondary, "mb-3 text-xs font-semibold")}>Challenges</p>
        <div className="grid gap-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.title}
              className="flex items-center justify-between rounded-[18px] border border-white/9 bg-white/5 px-3 py-3"
            >
              <div>
                <p className={cn("text-[9px]", glassText.muted)}>{challenge.subtitle}</p>
                <p className={cn("text-[10px] font-semibold", glassText.secondary)}>
                  {challenge.title}
                </p>
              </div>
              <div
                className="grid size-10 shrink-0 place-items-center rounded-full p-1"
                style={{
                  background: `conic-gradient(#9333EA 0 ${challenge.progress}%, rgba(255,255,255,0.16) ${challenge.progress}% 100%)`,
                }}
              >
                <div className={cn("grid size-full place-items-center rounded-full bg-white/15 text-[8px] font-bold", glassText.primary)}>
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
