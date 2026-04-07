import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isWeekend, startOfDay, getDay } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: fr });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE dd MMMM yyyy", { locale: fr });
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function normalizeDateToMidnight(date: Date): Date {
  return startOfDay(date);
}

export function getDayName(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE", { locale: fr });
}

export function getWeekdayStatus(date: Date): {
  isWeekday: boolean;
  message?: string;
} {
  if (isWeekend(date)) {
    const day = getDay(date);
    const name = day === 0 ? "dimanche" : "samedi";
    return {
      isWeekday: false,
      message: `Le pointage n'est pas disponible le ${name}.`,
    };
  }
  return { isWeekday: true };
}
