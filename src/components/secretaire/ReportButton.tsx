"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet,
  Send,
  Loader2,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { REPORT_RECIPIENT } from "@/lib/constants";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

export function ReportButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  // Default: last week
  const lastWeek = subWeeks(new Date(), 1);
  const [from, setFrom] = useState(
    format(startOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
  const [to, setTo] = useState(
    format(endOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
  );

  async function handleSendReport() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Erreur lors de l'envoi",
          description: data.error,
        });
      } else {
        toast({
          title: "Rapport envoyé !",
          description: data.message,
        });
        setLastSent(new Date().toLocaleString("fr-FR"));
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-md border-l-4 border-l-[#1E3A5F]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-[#1E3A5F]" />
          Rapport Excel — Direction
        </CardTitle>
        <CardDescription>
          Génère un fichier Excel et l&apos;envoie automatiquement par email à la
          direction.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Recipient info */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100">
          <Mail className="h-4 w-4 shrink-0" />
          <span>
            Destinataire : <strong>{REPORT_RECIPIENT}</strong>
          </span>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="from">Date de début</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Date de fin</Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendReport}
          disabled={isLoading || !from || !to}
          className="w-full bg-[#1E3A5F] hover:bg-[#2D5A8E] h-12 text-base font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Génération et envoi en cours...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Générer &amp; Envoyer le rapport Excel à la direction
            </>
          )}
        </Button>

        {lastSent && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4" />
            Dernier envoi : {lastSent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
