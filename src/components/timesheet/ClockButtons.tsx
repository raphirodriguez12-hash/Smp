"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isWeekday, formatTime, getWeekdayStatus } from "@/lib/utils";

interface TodayStatus {
  hasArrivedToday: boolean;
  hasDepartedToday: boolean;
  todayEntry: {
    arrivalTime: string;
    departureTime: string | null;
    totalMinutes: number | null;
  } | null;
}

interface ClockButtonsProps {
  onStatusChange?: () => void;
}

export function ClockButtons({ onStatusChange }: ClockButtonsProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<TodayStatus | null>(null);
  const [isLoadingIn, setIsLoadingIn] = useState(false);
  const [isLoadingOut, setIsLoadingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const weekdayStatus = getWeekdayStatus(currentTime);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/timesheet/today");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      console.error("Erreur lors du chargement du statut");
    }
  }

  async function handleClockIn() {
    setIsLoadingIn(true);
    try {
      const res = await fetch("/api/timesheet/clock-in", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Erreur", description: data.error });
      } else {
        toast({ variant: "success" as "default", title: "Arrivée enregistrée !", description: `Pointage à ${formatTime(new Date())}` });
        await fetchStatus();
        onStatusChange?.();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
    } finally {
      setIsLoadingIn(false);
    }
  }

  async function handleClockOut() {
    setIsLoadingOut(true);
    try {
      const res = await fetch("/api/timesheet/clock-out", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Erreur", description: data.error });
      } else {
        toast({ variant: "default", title: "Départ enregistré !", description: `Au revoir ! À demain.` });
        await fetchStatus();
        onStatusChange?.();
      }
    } catch {
      toast({ variant: "destructive", title: "Erreur réseau" });
    } finally {
      setIsLoadingOut(false);
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      {/* Clock display */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2D5A8E] p-8 text-white text-center">
        <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-2">
          Heure actuelle
        </p>
        <p className="text-6xl font-bold font-mono tabular-nums">
          {currentTime.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        <p className="mt-2 text-white/60 text-sm capitalize">
          {currentTime.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Today's status badges */}
        {status && (
          <div className="mt-4 flex justify-center gap-2">
            {status.hasArrivedToday && status.todayEntry && (
              <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Arrivée {formatTime(status.todayEntry.arrivalTime)}
              </Badge>
            )}
            {status.hasDepartedToday && status.todayEntry?.departureTime && (
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Départ {formatTime(status.todayEntry.departureTime)}
              </Badge>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {!weekdayStatus.isWeekday ? (
          <div className="text-center py-4 space-y-3">
            <CalendarX className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-gray-500 font-medium">{weekdayStatus.message}</p>
            <p className="text-sm text-gray-400">Le pointage est disponible du lundi au vendredi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status message */}
            {status?.hasDepartedToday ? (
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Votre journée est terminée. À demain !</span>
              </div>
            ) : status?.hasArrivedToday ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Vous êtes pointé(e) présent(e). N&apos;oubliez pas de pointer votre départ.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Vous n&apos;avez pas encore pointé votre arrivée aujourd&apos;hui.</span>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleClockIn}
                disabled={
                  isLoadingIn ||
                  isLoadingOut ||
                  status?.hasArrivedToday ||
                  !weekdayStatus.isWeekday
                }
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white h-14 text-base font-semibold disabled:opacity-40"
              >
                {isLoadingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Arrivée
                  </>
                )}
              </Button>

              <Button
                onClick={handleClockOut}
                disabled={
                  isLoadingOut ||
                  isLoadingIn ||
                  !status?.hasArrivedToday ||
                  status?.hasDepartedToday ||
                  !weekdayStatus.isWeekday
                }
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white h-14 text-base font-semibold disabled:opacity-40"
              >
                {isLoadingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-5 w-5 mr-2" />
                    Départ
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
