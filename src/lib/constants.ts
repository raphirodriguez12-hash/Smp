export const REPORT_RECIPIENT = "raphirodriguez12@icloud.com";

export const ROLES = {
  ADMIN: "ADMIN",
  SECRETAIRE: "SECRETAIRE",
  EMPLOYE: "EMPLOYE",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  SECRETAIRE: "Secrétaire",
  EMPLOYE: "Employé",
};

export const WEEKDAYS = [1, 2, 3, 4, 5]; // Monday to Friday (date-fns day indices)

export const APP_NAME = "SMP Pointage";
