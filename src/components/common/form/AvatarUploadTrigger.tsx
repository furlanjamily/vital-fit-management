"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { cn } from "@/lib/cn";

type AvatarUploadTriggerProps = {
  name: string;
  avatarUrl?: string | null;
  onImageSelected: (dataUrl: string) => void;
  hint?: string;
  avatarClassName?: string;
  avatarTextClassName?: string;
};

export function AvatarUploadTrigger({
  name,
  avatarUrl,
  onImageSelected,
  hint = "Clique ou arraste uma imagem — sem foto, usamos as iniciais do nome",
  avatarClassName = "size-20",
  avatarTextClassName = "text-xl",
}: AvatarUploadTriggerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function readImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => onImageSelected(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    readImageFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    readImageFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-white/40",
          isDragging && "scale-105",
        )}
        aria-label="Enviar foto de perfil"
      >
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl ?? null}
          className={avatarClassName}
          textClassName={avatarTextClassName}
        />
        <span
          className={cn(
            "absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100",
            isDragging && "opacity-100",
          )}
        >
          <Camera className="size-5" />
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </button>
      <p className="text-center text-[10px] text-white/40">{hint}</p>
    </div>
  );
}
