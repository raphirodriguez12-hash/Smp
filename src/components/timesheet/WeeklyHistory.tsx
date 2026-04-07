"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isSameWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { formatTime, formatDuration, formatDate, getDayName } from "@/lib/utils";
import type { TimeEntry } from "@/types";

interface WeeklyHistoryProps {
  refreshKey?: number;
}

export function WeeklyHistory({ refreshKey }: WeeklyHistoryProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const from = currentWeekStart.toISOString();
      const to = weekEnd.toISOString();
      const res = await fetch(`/api/timesheet/history?from=${from}&to=${to}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch {
      console.error("Erreur chargement historique");
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart, weekEnd]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const totalMinutes = entries.reduce((sum, e) => sum + (e.totalMinutes ?? 0), 0);

  const weekLabel = `${format(currentWeekStart, "dd MMM", { locale: fr })} — ${format(weekEnd, "dd MMM yyyy", { locale: fr })}`;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Historique de la semaine</CardTitle>
            <CardDescription className="mt-1">{weekLabel}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
              }
              disabled={isCurrentWeek}
            >
              Aujourd&apos;hui
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              disabled={isCurrentWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Total hours */}
        {entries.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Total semaine : <span className="font-bold ml-1">{formatDuration(totalMinutes)}</span>
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Calendar className="h-10 w-10 mb-3" />
            <p className="font-medium">Aucun pointage cette semaine</p>
            <p className="text-sm">Vos pointages apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border bg-white p-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold capitalize text-gray-900">
                      {getDayName(entry.date)} — {formatDate(entry.date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Arrivée : {formatTime(entry.arrivalTime)}
                      {entry.departureTime && (
                        <> · Départ : {formatTime(entry.departureTime)}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {entry.departureTime ? (
                    <Badge variant="secondary" className="font-mono">
                      {formatDuration(entry.totalMinutes)}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      En cours
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
