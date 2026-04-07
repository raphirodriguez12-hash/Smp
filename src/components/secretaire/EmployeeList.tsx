"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  status: "absent" | "present" | "departed";
  todayEntry: {
    arrivalTime: string;
    departureTime: string | null;
    totalMinutes: number | null;
  } | null;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees/status");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      }
    } catch {
      console.error("Erreur chargement employés");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchEmployees]);

  const presentCount = employees.filter((e) => e.status === "present").length;
  const departedCount = employees.filter((e) => e.status === "departed").length;
  const absentCount = employees.filter((e) => e.status === "absent").length;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Présences du jour
        </CardTitle>
        <CardDescription>
          Mise à jour automatique toutes les 30 secondes
        </CardDescription>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{presentCount}</p>
            <p className="text-xs text-green-600">Présents</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{departedCount}</p>
            <p className="text-xs text-blue-600">Partis</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center border">
            <p className="text-2xl font-bold text-gray-600">{absentCount}</p>
            <p className="text-xs text-gray-500">Absents</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-2" />
            <p>Aucun employé actif trouvé.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full shrink-0 ${
                      employee.status === "present"
                        ? "bg-green-500 animate-pulse"
                        : employee.status === "departed"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-400">{employee.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  {employee.status === "present" && employee.todayEntry && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        <Clock className="inline h-3 w-3 mr-0.5" />
                        {formatTime(employee.todayEntry.arrivalTime)}
                      </span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Présent
                      </Badge>
                    </div>
                  )}
                  {employee.status === "departed" && employee.todayEntry && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(employee.todayEntry.arrivalTime)} — {formatTime(employee.todayEntry.departureTime!)}
                      </span>
                      <Badge variant="secondary">
                        Parti
                      </Badge>
                    </div>
                  )}
                  {employee.status === "absent" && (
                    <Badge variant="outline" className="text-gray-400">
                      <UserX className="h-3 w-3 mr-1" />
                      Absent
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
