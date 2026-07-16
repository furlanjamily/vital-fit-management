"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { compressImageDataUrl } from "@/lib/image/compress-image-data-url";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function readImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;

    setIsProcessing(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const compressed = await compressImageDataUrl(dataUrl);
      onImageSelected(compressed);
    } catch {
      // Mantém o fluxo silencioso: o usuário pode tentar outra imagem.
    } finally {
      setIsProcessing(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void readImageFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    void readImageFile(event.dataTransfer.files?.[0]);
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler arquivo."));
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={isProcessing}
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
          isProcessing && "opacity-70",
        )}
        aria-label="Enviar foto de perfil"
        aria-busy={isProcessing}
      >
        <UserAvatar
          name={name}
          avatarUrl={avatarUrl ?? null}
          className={avatarClassName}
          textClassName={avatarTextClassName}
        />
        <span
          className={cn(
            "absolute inset-0 grid place-items-center rounded-full bg-white/25 opacity-0 transition group-hover:opacity-100",
            glassText.primary,
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
      <p className={cn("text-center text-[10px]", glassText.muted)}>{hint}</p>
    </div>
  );
}
