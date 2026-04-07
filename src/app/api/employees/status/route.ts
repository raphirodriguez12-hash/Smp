import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDateToMidnight } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SECRETAIRE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const today = normalizeDateToMidnight(new Date());

  const users = await prisma.user.findMany({
    where: { active: true, role: "EMPLOYE" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      timeEntries: {
        where: { date: today },
        select: {
          arrivalTime: true,
          departureTime: true,
          totalMinutes: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const employeesWithStatus = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    todayEntry: user.timeEntries[0] || null,
    status:
      user.timeEntries.length === 0
        ? "absent"
        : user.timeEntries[0].departureTime
        ? "departed"
        : "present",
  }));

  return NextResponse.json({ employees: employeesWithStatus });
}
