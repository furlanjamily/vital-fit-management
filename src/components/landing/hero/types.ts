import type { LucideIcon } from "lucide-react";

export type SceneBackgroundConfig = {
  image: string;
  position: string;
  overlay: string;
  blur: string;
  brightness: number;
};

export type MenuItem = {
  icon: LucideIcon;
  label: string;
  badge?: string;
  active?: boolean;
};

export type ClassItem = {
  label: string;
  count: string;
};

export type PopularClass = {
  title: string;
  subtitle: string;
  image: string;
};

export type Challenge = {
  title: string;
  subtitle: string;
  progress: number;
};

export type ModalField = {
  label: string;
  value: string;
};
