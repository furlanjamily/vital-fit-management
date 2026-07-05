import { Bell, Mail, MoveUpRight } from "lucide-react";
import {
  barMonths,
  memberBars,
  popularClasses,
  timelineDays,
} from "@/components/landing/hero/data/heroScene.mock";
import { cn } from "@/lib/cn";

export function DashboardContent() {
  return (
    <>
      <div className="flex shrink-0 items-start justify-between">
        <div>
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Welcome Jakob!
          </h1>
          <p className="mt-1 text-sm text-white/48">11 July, Thursday</p>
        </div>
        <div className="flex items-center gap-2 text-white/72">
          {[Bell, Mail].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="grid size-9 place-items-center rounded-full border border-white/14 bg-white/7 transition hover:bg-white/13 hover:text-white"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid min-h-0 flex-[1.2] gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex min-h-0 flex-col rounded-[22px] border border-white/12 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Members counting</p>
              <p className="mt-1 text-[11px] text-white/38">Weekly member flow</p>
            </div>
            <span className="rounded-full bg-white/88 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1a1d19]">
              Weekly
            </span>
          </div>

          <div className="relative min-h-[190px] flex-1 overflow-hidden rounded-[18px] bg-black/10 px-3 pb-4 pt-9">
            <div className="absolute inset-x-4 bottom-10 top-8 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="border-t border-dashed border-white/16" />
              ))}
            </div>
            <div className="absolute left-[43%] top-5 z-20 rounded-xl border border-white/22 bg-[#b7b0a6]/70 px-4 py-2 text-center text-[10px] font-bold text-white shadow-[0_16px_42px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <p className="text-[9px] text-white/62">April</p>
              310 members
              <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#b7b0a6]/70" />
            </div>
            <div className="relative z-10 flex h-full items-end gap-3">
              {memberBars.map((height, index) => (
                <div
                  key={barMonths[index]}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-[13px] rounded-b-md",
                      index === 3
                        ? "bg-[#2777ff] shadow-[0_0_34px_rgba(39,119,255,0.52)]"
                        : "bg-white/90",
                    )}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] font-medium text-white/34">
                    {barMonths[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-[22px] border border-white/12 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="mb-4 flex shrink-0 items-center justify-between">
            <p className="text-sm font-semibold text-white">Popular Classes</p>
            <MoveUpRight className="size-4 text-white/70" />
          </div>

          <div className="grid flex-1 content-start gap-3">
            {popularClasses.map((item) => (
              <div
                key={item.title}
                className="relative h-[90px] overflow-hidden rounded-[16px] border border-white/12 bg-cover bg-center p-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(5,5,5,0.64), rgba(5,5,5,0.08)), url(${item.image})`,
                }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/28 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <p className="text-xs font-semibold text-white">{item.title}</p>
                  <p className="text-[10px] text-white/52">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-between">
            <div className="flex -space-x-2">
              {["JD", "AN", "KS", "+20"].map((avatar) => (
                <span
                  key={avatar}
                  className="grid size-7 place-items-center rounded-full border border-white/28 bg-white/13 text-[9px] font-bold text-white"
                >
                  {avatar}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-[#176dff] px-4 py-2 text-[10px] font-bold text-white shadow-[0_14px_36px_rgba(23,109,255,0.34)]"
            >
              See all members
            </button>
          </div>
        </section>
      </div>

      <section className="mt-5 flex min-h-0 flex-1 flex-col rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <p className="text-sm font-semibold text-white">Timeline</p>
          <span className="rounded-full bg-white/86 px-3 py-1 text-[9px] font-extrabold uppercase text-[#1a1d19]">
            Apr, 2027
          </span>
        </div>
        <div className="relative min-h-[150px] flex-1 overflow-hidden rounded-[18px] bg-black/12">
          <div className="absolute inset-x-0 top-0 grid grid-cols-8 border-b border-white/10">
            {timelineDays.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className={cn(
                  "h-[54px] border-r border-white/8 px-3 py-3 text-[10px] font-semibold text-white/50",
                  index === 4 && "text-[#7aaaff]",
                )}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="absolute left-[47%] top-0 h-full w-px bg-[#2777ff] shadow-[0_0_28px_rgba(39,119,255,0.76)]" />
          <div className="absolute left-[18%] top-[66px] flex -space-x-2">
            {["A", "M"].map((avatar) => (
              <span
                key={avatar}
                className="grid size-6 place-items-center rounded-full border border-white/40 bg-[#b8aaa0]/80 text-[9px] font-bold text-white shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              >
                {avatar}
              </span>
            ))}
          </div>
          <div className="absolute left-[18%] top-[92px] w-[23%] rounded-r-2xl border-l-4 border-[#c7ff38] bg-black/26 px-4 py-3 backdrop-blur-xl">
            <p className="text-xs font-semibold text-white">Body Balance</p>
            <p className="text-[10px] text-white/48">8 AM - 9 AM</p>
          </div>
          <div className="absolute left-[43%] top-[80px] flex -space-x-2">
            {["J", "K", "S"].map((avatar) => (
              <span
                key={avatar}
                className="grid size-6 place-items-center rounded-full border border-white/40 bg-[#b8aaa0]/80 text-[9px] font-bold text-white shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              >
                {avatar}
              </span>
            ))}
          </div>
          <div className="absolute left-[43%] top-[108px] w-[42%] rounded-r-2xl border-l-4 border-[#c7ff38] bg-black/28 px-4 py-3 backdrop-blur-xl">
            <p className="text-xs font-semibold text-white">Cycling</p>
            <p className="text-[10px] text-white/48">8 AM to 10 AM</p>
          </div>
        </div>
      </section>
    </>
  );
}
