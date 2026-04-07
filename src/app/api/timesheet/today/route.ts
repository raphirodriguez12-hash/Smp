import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDateToMidnight } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const today = normalizeDateToMidnight(new Date());

  const entry = await prisma.timeEntry.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  return NextResponse.json({
    hasArrivedToday: !!entry,
    hasDepartedToday: !!entry?.departureTime,
    todayEntry: entry,
  });
}
