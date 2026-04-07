import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <ShieldAlert className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
        <p className="text-gray-500">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Button asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
