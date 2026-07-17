"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import type { ReactNode } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { useLocalWeather } from "@/hooks/useLocalWeather";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

function renderWeatherIcon(weatherCode: number, isDay: boolean): ReactNode {
  const className = "size-4";

  if (weatherCode === 0) return isDay ? <Sun className={className} /> : <Moon className={className} />;
  if (weatherCode <= 2)
    return isDay ? <CloudSun className={className} /> : <CloudMoon className={className} />;
  if (weatherCode === 3) return <Cloud className={className} />;
  if (weatherCode === 45 || weatherCode === 48) return <CloudFog className={className} />;
  if (weatherCode >= 51 && weatherCode <= 57) return <CloudDrizzle className={className} />;
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82))
    return <CloudRain className={className} />;
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86)
    return <CloudSnow className={className} />;
  if (weatherCode >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
}

function formatToday(): string {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(now);
  const dayMonth = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(now);

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  // pt-BR short month comes as "jul." — strip the dot and capitalize
  const cleanDayMonth = dayMonth.replace(".", "");

  return `${capitalizedWeekday}, ${cleanDayMonth}`;
}

export function HeaderDateWeather() {
  const hydrated = useHydrated();
  const { data, loading } = useLocalWeather();

  if (!hydrated) {
    return (
      <span className="mt-1 block h-5 w-44 animate-pulse rounded-md bg-white/8" />
    );
  }

  return (
    <div className={cn(glassTextStyles.pageSubtitle, "w-full mt-1 flex gap-2.5")}>
      <span>{formatToday()}</span>

      {loading ? (
        <span className="h-4 w-14 animate-pulse rounded-md bg-white/8" />
      ) : data ? (
        <span className={cn("flex items-center gap-1.5 font-semibold", glassText.secondary)}>
          {renderWeatherIcon(data.weatherCode, data.isDay)}
          {data.temperature}°C
        </span>
      ) : null}
    </div>
  );
}
