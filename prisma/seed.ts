import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  const users = [
    {
      email: "admin@smp.fr",
      name: "Administrateur SMP",
      password: "Admin2024!",
      role: "ADMIN",
    },
    {
      email: "secretaire@smp.fr",
      name: "Marie Dupont",
      password: "Secretaire2024!",
      role: "SECRETAIRE",
    },
    {
      email: "employe1@smp.fr",
      name: "Jean Martin",
      password: "Employe2024!",
      role: "EMPLOYE",
    },
    {
      email: "employe2@smp.fr",
      name: "Sophie Bernard",
      password: "Employe2024!",
      role: "EMPLOYE",
    },
    {
      email: "employe3@smp.fr",
      name: "Pierre Rousseau",
      password: "Employe2024!",
      role: "EMPLOYE",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        active: true,
      },
    });
    console.log(`✅ Utilisateur créé: ${user.name} (${user.role})`);
  }

  console.log("✅ Seed terminé avec succès !");
  console.log("\n📋 Comptes de test :");
  console.log("  admin@smp.fr       / Admin2024!       (ADMIN)");
  console.log("  secretaire@smp.fr  / Secretaire2024!  (SECRETAIRE)");
  console.log("  employe1@smp.fr    / Employe2024!     (EMPLOYE)");
  console.log("  employe2@smp.fr    / Employe2024!     (EMPLOYE)");
  console.log("  employe3@smp.fr    / Employe2024!     (EMPLOYE)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
