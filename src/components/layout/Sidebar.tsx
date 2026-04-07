"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  Users,
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    href: "/employe",
    label: "Mon Pointage",
    icon: Clock,
    roles: ["EMPLOYE", "SECRETAIRE", "ADMIN"],
  },
  {
    href: "/secretaire",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    roles: ["SECRETAIRE", "ADMIN"],
  },
  {
    href: "/secretaire/rapports",
    label: "Rapports",
    icon: FileSpreadsheet,
    roles: ["SECRETAIRE", "ADMIN"],
  },
  {
    href: "/admin",
    label: "Gestion Utilisateurs",
    icon: Users,
    roles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "";

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full w-64 flex-col bg-[#1E3A5F] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide">{APP_NAME}</p>
          <p className="text-xs text-white/60">Gestion du temps</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <p className="text-center text-xs text-white/40">
          © 2024 SMP — v1.0
        </p>
      </div>
    </div>
  );
}
