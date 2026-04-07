export type Role = "ADMIN" | "SECRETAIRE" | "EMPLOYE";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  arrivalTime: string;
  departureTime: string | null;
  totalMinutes: number | null;
  user?: {
    name: string;
    email: string;
  };
}

export interface TimesheetStatus {
  hasArrivedToday: boolean;
  hasDepartedToday: boolean;
  todayEntry: TimeEntry | null;
}

export interface ReportPeriod {
  from: string;
  to: string;
}
