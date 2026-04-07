"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateLong } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const role = session?.user?.role || "";
  const today = formatDateLong(new Date());

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 capitalize">{today}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A5F] text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name}
            </p>
            <Badge variant="outline" className="text-xs h-5">
              {ROLE_LABELS[role] || role}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  );
}
