import ExcelJS from "exceljs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatTime, formatDuration } from "@/lib/utils";

interface TimeEntryWithUser {
  id: string;
  userId: string;
  date: Date;
  arrivalTime: Date;
  departureTime: Date | null;
  totalMinutes: number | null;
  user: {
    name: string;
    email: string;
  };
}

interface ReportPeriod {
  from: Date;
  to: Date;
}

export async function generateTimesheetReport(
  entries: TimeEntryWithUser[],
  period: ReportPeriod
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SMP Pointage";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Pointages SMP", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  const SMP_BLUE = "1E3A5F";
  const SMP_LIGHT_BLUE = "E8F0FE";
  const HEADER_TEXT = "FFFFFF";
  const BORDER_COLOR = "CCCCCC";

  // Title section
  sheet.mergeCells("A1:G1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "SMP — Rapport de Pointage";
  titleCell.font = { name: "Calibri", size: 18, bold: true, color: { argb: SMP_BLUE } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 35;

  sheet.mergeCells("A2:G2");
  const periodCell = sheet.getCell("A2");
  const fromStr = format(period.from, "dd MMMM yyyy", { locale: fr });
  const toStr = format(period.to, "dd MMMM yyyy", { locale: fr });
  periodCell.value = `Période : du ${fromStr} au ${toStr}`;
  periodCell.font = { name: "Calibri", size: 11, color: { argb: "666666" } };
  periodCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(2).height = 22;

  sheet.addRow([]); // Empty row 3

  // Column headers
  const headerRow = sheet.addRow([
    "Nom complet",
    "Email",
    "Date",
    "Jour",
    "Arrivée",
    "Départ",
    "Total Heures",
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SMP_BLUE },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });
  headerRow.height = 25;

  // Sort entries by user name then date
  const sorted = [...entries].sort((a, b) => {
    const nameCompare = a.user.name.localeCompare(b.user.name);
    if (nameCompare !== 0) return nameCompare;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Track totals per user
  const userTotals = new Map<string, { name: string; email: string; minutes: number }>();

  sorted.forEach((entry, index) => {
    const date = new Date(entry.date);
    const dayName = format(date, "EEEE", { locale: fr });
    const dateStr = format(date, "dd/MM/yyyy");
    const arrivalStr = formatTime(entry.arrivalTime);
    const departureStr = entry.departureTime ? formatTime(entry.departureTime) : "En cours";
    const totalStr = formatDuration(entry.totalMinutes);

    const row = sheet.addRow([
      entry.user.name,
      entry.user.email,
      dateStr,
      dayName.charAt(0).toUpperCase() + dayName.slice(1),
      arrivalStr,
      departureStr,
      totalStr,
    ]);

    const isEvenRow = index % 2 === 0;
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEvenRow ? "FFFFFF" : SMP_LIGHT_BLUE },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
    });
    // Left-align name and email
    row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
    row.height = 20;

    // Accumulate totals
    if (!userTotals.has(entry.userId)) {
      userTotals.set(entry.userId, { name: entry.user.name, email: entry.user.email, minutes: 0 });
    }
    const ut = userTotals.get(entry.userId)!;
    ut.minutes += entry.totalMinutes ?? 0;
  });

  // Summary section
  sheet.addRow([]);
  const summaryHeaderRow = sheet.addRow(["RÉCAPITULATIF PAR EMPLOYÉ"]);
  sheet.mergeCells(`A${summaryHeaderRow.number}:G${summaryHeaderRow.number}`);
  const summaryHeaderCell = summaryHeaderRow.getCell(1);
  summaryHeaderCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: HEADER_TEXT } };
  summaryHeaderCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SMP_BLUE } };
  summaryHeaderCell.alignment = { horizontal: "center", vertical: "middle" };
  summaryHeaderRow.height = 22;

  const summaryColHeaderRow = sheet.addRow(["Employé", "Email", "", "", "", "", "Total Heures"]);
  summaryColHeaderRow.eachCell((cell, colNumber) => {
    if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: HEADER_TEXT } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2D5A8E" } };
      cell.alignment = { horizontal: colNumber === 7 ? "center" : "left", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };
    }
  });

  let grandTotalMinutes = 0;
  Array.from(userTotals.values()).forEach((ut, index) => {
    grandTotalMinutes += ut.minutes;
    const row = sheet.addRow([ut.name, ut.email, "", "", "", "", formatDuration(ut.minutes)]);
    row.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
        cell.font = { name: "Calibri", size: 10, bold: colNumber === 7 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: index % 2 === 0 ? "FFFFFF" : SMP_LIGHT_BLUE },
        };
        cell.alignment = { horizontal: colNumber === 7 ? "center" : "left", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: BORDER_COLOR } },
          left: { style: "thin", color: { argb: BORDER_COLOR } },
          bottom: { style: "thin", color: { argb: BORDER_COLOR } },
          right: { style: "thin", color: { argb: BORDER_COLOR } },
        };
      }
    });
    row.height = 20;
  });

  // Grand total row
  const grandTotalRow = sheet.addRow(["TOTAL GÉNÉRAL", "", "", "", "", "", formatDuration(grandTotalMinutes)]);
  sheet.mergeCells(`A${grandTotalRow.number}:F${grandTotalRow.number}`);
  grandTotalRow.eachCell((cell, colNumber) => {
    if (colNumber === 1 || colNumber === 7) {
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_TEXT } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SMP_BLUE } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "medium", color: { argb: SMP_BLUE } },
        left: { style: "medium", color: { argb: SMP_BLUE } },
        bottom: { style: "medium", color: { argb: SMP_BLUE } },
        right: { style: "medium", color: { argb: SMP_BLUE } },
      };
    }
  });
  grandTotalRow.height = 25;

  // Set column widths
  sheet.columns = [
    { width: 25 }, // Name
    { width: 30 }, // Email
    { width: 14 }, // Date
    { width: 14 }, // Day
    { width: 12 }, // Arrival
    { width: 12 }, // Departure
    { width: 14 }, // Total
  ];

  // Footer
  sheet.addRow([]);
  const footerRow = sheet.addRow([
    `Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })} — SMP Pointage`,
  ]);
  sheet.mergeCells(`A${footerRow.number}:G${footerRow.number}`);
  footerRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "999999" } };
  footerRow.getCell(1).alignment = { horizontal: "right" };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
