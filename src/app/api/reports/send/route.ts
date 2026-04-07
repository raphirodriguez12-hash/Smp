import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTimesheetReport } from "@/lib/excel";
import { sendTimesheetReport } from "@/lib/mailer";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SECRETAIRE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { from, to } = body;

  // Default to last week if no period provided
  const now = new Date();
  const lastWeek = subWeeks(now, 1);
  const fromDate = from
    ? new Date(from)
    : startOfWeek(lastWeek, { weekStartsOn: 1 });
  const toDate = to ? new Date(to) : endOfWeek(lastWeek, { weekStartsOn: 1 });

  // Set time bounds for the query
  const fromStart = new Date(fromDate);
  fromStart.setHours(0, 0, 0, 0);
  const toEnd = new Date(toDate);
  toEnd.setHours(23, 59, 59, 999);

  const entries = await prisma.timeEntry.findMany({
    where: {
      date: {
        gte: fromStart,
        lte: toEnd,
      },
      user: {
        active: true,
      },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: [{ user: { name: "asc" } }, { date: "asc" }],
  });

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "Aucun pointage trouvé pour la période sélectionnée." },
      { status: 404 }
    );
  }

  const uniqueUsers = new Set(entries.map((e) => e.userId)).size;

  const buffer = await generateTimesheetReport(entries, {
    from: fromDate,
    to: toDate,
  });

  await sendTimesheetReport({
    buffer,
    from: fromDate,
    to: toDate,
    entryCount: entries.length,
    userCount: uniqueUsers,
  });

  return NextResponse.json({
    success: true,
    message: `Rapport envoyé avec succès. ${entries.length} pointage(s) pour ${uniqueUsers} employé(s).`,
    stats: {
      entries: entries.length,
      users: uniqueUsers,
    },
  });
}
