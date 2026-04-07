import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UserTable } from "@/components/admin/UserTable";
import { ReportButton } from "@/components/secretaire/ReportButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Administration" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Panneau d&apos;administration
            </h2>
            <p className="text-gray-500 mt-1">
              Gérez les comptes utilisateurs et générez les rapports de pointage.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UserTable
                currentUserId={session.user.id}
                currentUserRole={session.user.role}
              />
            </div>
            <div>
              <ReportButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
