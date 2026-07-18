import { Plus, X } from "lucide-react";
import { Button } from "@/components/common/button/Button";
import { GhostButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  memberAvatars,
  modalFields,
  trainerAvatars,
} from "@/components/landing/hero/data/hero-scene.mock";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

function StackedAvatars({ avatars }: { avatars: string[] }) {
  return (
    <div className="flex -space-x-2">
      {avatars.map((avatar) => (
        <span
          key={avatar}
          className="size-7 rounded-full border border-white/42 bg-cover bg-center shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
          style={{ backgroundImage: `url(${avatar})` }}
        />
      ))}
      <span className={cn("grid size-7 place-items-center rounded-full border border-dashed border-white/30 bg-white/8", glassText.secondary)}>
        <Plus className="size-3" />
      </span>
    </div>
  );
}

export function FrontFloatingModal() {
  const fieldMap = Object.fromEntries(modalFields.map((field) => [field.label, field.value]));

  return (
    <GlassPanel
      variant="strong"
      intensity="high"
      className="w-[90vw] rounded-[24px] p-4 shadow-[0_44px_130px_rgba(33,22,14,0.56),0_24px_60px_rgba(0,0,0,0.24)] sm:w-[400px]"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/12 pb-3">
        <div className={cn("flex items-center gap-4 text-[10px]", glassText.secondary)}>
          <span>Class</span>
          <span>Body</span>
        </div>
        <X className={cn("size-3.5", glassText.secondary)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["Bodybuilding", "Body balance"].map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-white/86 px-3 py-1 text-[10px] font-bold text-[#1c1f1b]"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-[64px_1fr] items-center gap-3">
          <p className={cn(glassText.muted, "text-[10px] font-semibold")}>Date</p>
          <div className={cn("rounded-xl border border-white/14 bg-white/8 px-3 py-2 text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]", glassText.secondaryElevated)}>
            {fieldMap.Date}
          </div>
        </div>
        <div className="grid grid-cols-[64px_1fr] items-center gap-3">
          <p className={cn(glassText.muted, "text-[10px] font-semibold")}>Location</p>
          <div className={cn("w-fit rounded-xl border border-white/14 bg-white/8 px-3 py-2 text-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]", glassText.secondaryElevated)}>
            {fieldMap.Location}
          </div>
        </div>
        <div className="grid grid-cols-[64px_1fr] items-center gap-3">
          <p className={cn(glassText.muted, "text-[10px] font-semibold")}>Trainers</p>
          <StackedAvatars avatars={trainerAvatars} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[64px_1fr] items-center gap-3">
        <p className={cn(glassText.muted, "text-[10px] font-semibold")}>Members</p>
        <StackedAvatars avatars={memberAvatars} />
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <GhostButton
          size="sm"
          className={cn(
            "font-semibold hover:bg-transparent hover:text-glass-primary",
            glassText.secondary,
          )}
        >
          Cancel
        </GhostButton>
        <Button type="button" variant="primary" size="sm">
          OK
        </Button>
      </div>
    </GlassPanel>
  );
}
