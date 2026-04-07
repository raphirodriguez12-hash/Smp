import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Building2 } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1E3A5F] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">SMP Pointage</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Gestion du temps
            <br />
            simplifiée.
          </h2>
          <p className="text-lg text-white/70">
            Pointage en ligne, rapports automatiques et suivi des présences en
            temps réel pour votre équipe SMP.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs text-white/60">Sécurisé</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold">Auto</p>
            <p className="text-xs text-white/60">Rapports Excel</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold">Live</p>
            <p className="text-xs text-white/60">Temps réel</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:justify-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E3A5F] text-white lg:hidden">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
            <p className="mt-2 text-gray-500">
              Accédez à votre espace SMP Pointage
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
