import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDateToMidnight } from "@/lib/utils";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const now = new Date();
  const today = normalizeDateToMidnight(now);

  const existingEntry = await prisma.timeEntry.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  if (!existingEntry) {
    return NextResponse.json(
      { error: "Vous n'avez pas encore pointé votre arrivée aujourd'hui." },
      { status: 400 }
    );
  }

  if (existingEntry.departureTime) {
    return NextResponse.json(
      { error: "Vous avez déjà pointé votre départ aujourd'hui." },
      { status: 400 }
    );
  }

  const totalMinutes = Math.round(
    (now.getTime() - existingEntry.arrivalTime.getTime()) / (1000 * 60)
  );

  const updated = await prisma.timeEntry.update({
    where: { id: existingEntry.id },
    data: {
      departureTime: now,
      totalMinutes,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Départ enregistré avec succès.",
    entry: updated,
  });
}
