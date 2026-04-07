import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { EmployeeDashboardClient } from "@/components/timesheet/EmployeeDashboardClient";

export default async function EmployeePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col h-full">
      <Header title="Mon Pointage" />
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Bonjour, {session?.user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Gérez votre pointage et consultez votre historique de présence.
            </p>
          </div>
          <EmployeeDashboardClient />
        </div>
      </div>
    </div>
  );
}
