import {
  BarChart3,
  Dumbbell,
  Grid2X2,
  HelpCircle,
  LineChart,
  Settings,
  UsersRound,
} from "lucide-react";
import type {
  Challenge,
  ClassItem,
  MenuItem,
  ModalField,
  PopularClass,
  SceneBackgroundConfig,
} from "@/components/landing/hero/types";

export const sceneBackground: SceneBackgroundConfig = {
  image: "/system-background.png",
  position: "center center",
  overlay: "transparent",
  blur: "0px",
  brightness: 0.96,
};

export const sidebarMenu: MenuItem[] = [
  { icon: Grid2X2, label: "Dashboard", active: true },
  { icon: UsersRound, label: "Community", badge: "3" },
  { icon: LineChart, label: "Analytics" },
  { icon: UsersRound, label: "Members" },
];

export const classMenu: ClassItem[] = [
  { label: "Crossfit", count: "2" },
  { label: "TRX", count: "11" },
  { label: "Yoga", count: "2" },
];

export const utilityMenu: MenuItem[] = [
  { icon: HelpCircle, label: "Help" },
  { icon: Settings, label: "Setting" },
];

export const popularClasses: PopularClass[] = [
  {
    title: "Routine Workout",
    subtitle: "Morning studio",
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=86",
  },
  {
    title: "Bodybuilding",
    subtitle: "Squat training",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=86",
  },
];

export const memberBars = [44, 82, 92, 68, 72, 76, 34];
export const barMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
export const timelineDays = ["S 27", "M 28", "T 29", "W 30", "T 31", "F 27", "S 28", "S 29"];

export const challenges: Challenge[] = [
  { title: "Food Challenge", subtitle: "100 days", progress: 63 },
  { title: "Lose weight to 10kg", subtitle: "80 days", progress: 26 },
];

export const modalFields: ModalField[] = [
  { label: "Class", value: "Bodybuilding" },
  { label: "Date", value: "Monday, 23 April" },
  { label: "Location", value: "Salon 2" },
  { label: "Trainers", value: "3 selected" },
];

export const sceneStats = [
  { icon: BarChart3, label: "310 members", tone: "blue" },
  { icon: Dumbbell, label: "42 live plans", tone: "pink" },
];

export const profileAvatar =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=88";

export const trainerAvatars = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
];

export const memberAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
];
