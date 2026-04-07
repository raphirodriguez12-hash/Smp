import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isWeekday, normalizeDateToMidnight } from "@/lib/utils";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const now = new Date();

  if (!isWeekday(now)) {
    return NextResponse.json(
      { error: "Le pointage n'est autorisé que du lundi au vendredi." },
      { status: 400 }
    );
  }

  const today = normalizeDateToMidnight(now);

  // Check if already clocked in today
  const existingEntry = await prisma.timeEntry.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  if (existingEntry) {
    return NextResponse.json(
      { error: "Vous avez déjà pointé votre arrivée aujourd'hui." },
      { status: 400 }
    );
  }

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      date: today,
      arrivalTime: now,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Arrivée enregistrée avec succès.",
    entry,
  });
}
