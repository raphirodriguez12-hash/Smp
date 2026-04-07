"use client";

import { useState } from "react";
import { ClockButtons } from "@/components/timesheet/ClockButtons";
import { WeeklyHistory } from "@/components/timesheet/WeeklyHistory";

export function EmployeeDashboardClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <ClockButtons onStatusChange={() => setRefreshKey((k) => k + 1)} />
      <WeeklyHistory refreshKey={refreshKey} />
    </div>
  );
}
