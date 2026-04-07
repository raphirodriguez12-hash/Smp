import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SECRETAIRE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SECRETAIRE") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, password, role } = body;

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "Email, nom et mot de passe requis" },
      { status: 400 }
    );
  }

  // Only ADMIN can create ADMIN accounts
  if (role === "ADMIN" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Seul un administrateur peut créer un compte administrateur" },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte avec cet email existe déjà" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role || "EMPLOYE",
      active: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
