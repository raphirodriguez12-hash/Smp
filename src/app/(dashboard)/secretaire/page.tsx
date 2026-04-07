import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { EmployeeList } from "@/components/secretaire/EmployeeList";
import { ReportButton } from "@/components/secretaire/ReportButton";

export default async function SecretairePage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "SECRETAIRE" && session.user.role !== "ADMIN")
  ) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Tableau de bord Secrétaire" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Suivez les présences en temps réel et générez les rapports de pointage.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <EmployeeList />
            <div className="space-y-6">
              <ReportButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
