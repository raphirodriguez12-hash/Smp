import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Determine which user's data to fetch
  const targetUserId =
    session.user.role === "EMPLOYE" ? session.user.id : userId || session.user.id;

  // If EMPLOYE tries to access another user's data
  if (session.user.role === "EMPLOYE" && userId && userId !== session.user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Default to current week if no dates provided
  const now = new Date();
  const fromDate = from ? new Date(from) : startOfWeek(now, { weekStartsOn: 1 });
  const toDate = to ? new Date(to) : endOfWeek(now, { weekStartsOn: 1 });

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: targetUserId,
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ entries });
}
