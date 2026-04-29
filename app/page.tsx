"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  ShieldAlert,
  BarChart2,
  Zap,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  Activity,
} from "lucide-react";

interface AnalysisResult {
  signal: "LONG" | "SHORT" | "WAIT";
  confidence: number;
  asset: string;
  timeframe: string;
  entry: {
    zone: string;
    description: string;
  };
  takeProfit: {
    tp1: string;
    tp2: string;
    tp3: string;
  };
  stopLoss: {
    level: string;
    description: string;
  };
  riskReward: string;
  pattern: string;
  trend: string;
  keyLevels: string[];
  summary: string;
  warnings: string[];
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image trop lourde (max 10 MB)");
      return;
    }
    setError(null);
    setResult(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile]
  );

  const analyzeChart = async () => {
    if (!image || !imageFile) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const steps = [
      "Détection du graphique...",
      "Identification des patterns...",
      "Analyse des niveaux clés...",
      "Calcul du signal...",
      "Génération des recommandations...",
    ];
    let stepIndex = 0;
    setAnalysisStep(steps[0]);
    const interval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1);
      setAnalysisStep(steps[stepIndex]);
    }, 1200);

    try {
      const base64 = image.split(",")[1];
      const mediaType = imageFile.type as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | "image/gif";

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  const signalConfig = {
    LONG: {
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      border: "border-accent-green/40",
      glow: "glow-green",
      icon: TrendingUp,
      label: "LONG",
      desc: "Position acheteuse",
    },
    SHORT: {
      color: "text-accent-red",
      bg: "bg-accent-red/10",
      border: "border-accent-red/40",
      glow: "glow-red",
      icon: TrendingDown,
      label: "SHORT",
      desc: "Position vendeuse",
    },
    WAIT: {
      color: "text-accent-yellow",
      bg: "bg-accent-yellow/10",
      border: "border-accent-yellow/40",
      glow: "",
      icon: Minus,
      label: "ATTENDRE",
      desc: "Pas de signal clair",
    },
  };

  const cfg = result ? signalConfig[result.signal] : null;

  return (
    <div
      className="min-h-screen grid-bg"
      onPaste={onPaste}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-text-primary font-bold text-lg tracking-wider">
                LEIA
              </h1>
              <p className="text-text-secondary text-xs">
                AI Trading Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-green signal-pulse" />
            <span className="text-text-secondary text-xs">Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Analyse ton graphique{" "}
            <span className="text-accent">en secondes</span>
          </h2>
          <p className="text-text-secondary text-sm max-w-xl mx-auto">
            Envoie un screenshot de ton chart — Leia détecte le pattern, le
            signal, les niveaux de TP/SL et te donne une recommandation claire.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — upload */}
          <div className="space-y-4">
            {/* Upload zone */}
            {!image ? (
              <div
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                  isDragging ? "upload-zone-active" : "border-border"
                } bg-surface hover:border-accent/40 hover:bg-surface-2`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-text-primary font-medium">
                    Glisse ton screenshot ici
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    ou clique pour choisir un fichier
                  </p>
                  <p className="text-text-secondary text-xs mt-2 opacity-60">
                    Tu peux aussi coller (Ctrl+V) depuis ton clipboard
                  </p>
                </div>
                <div className="flex gap-2 text-xs text-text-secondary">
                  {["PNG", "JPG", "WebP"].map((f) => (
                    <span
                      key={f}
                      className="px-2 py-1 rounded bg-surface-2 border border-border"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border bg-surface">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-accent" />
                    <span className="text-text-secondary text-xs">
                      {imageFile?.name || "chart.png"}
                    </span>
                  </div>
                  <button
                    onClick={reset}
                    className="text-text-secondary hover:text-accent-red text-xs transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Chart"
                  className="w-full object-contain max-h-80"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-red/10 border border-accent-red/30 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-accent-red mt-0.5 shrink-0" />
                <p className="text-accent-red text-sm">{error}</p>
              </div>
            )}

            {/* Analyze button */}
            {image && (
              <button
                onClick={analyzeChart}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-200 flex items-center justify-center gap-3 ${
                  isAnalyzing
                    ? "bg-surface-2 text-text-secondary cursor-not-allowed"
                    : "bg-accent text-background hover:brightness-110 glow-blue"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    {analysisStep}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    ANALYSER LE GRAPHIQUE
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Tips */}
            {!image && (
              <div className="p-4 rounded-xl bg-surface border border-border">
                <p className="text-text-secondary text-xs font-medium mb-2 uppercase tracking-wider">
                  Tips pour une meilleure analyse
                </p>
                <ul className="space-y-1 text-text-secondary text-xs">
                  {[
                    "Inclure les bougies récentes + historique",
                    "Visible : supports, résistances, EMA",
                    "Timeframe clairement affiché (1H, 4H, 1D...)",
                    "Screenshot clair sans éléments masqués",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — results */}
          <div className="space-y-4">
            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center gap-4 opacity-40">
                <BarChart2 className="w-16 h-16 text-text-secondary" />
                <p className="text-text-secondary text-sm">
                  Les résultats d&apos;analyse apparaîtront ici
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center py-16 gap-6 animate-fade-in">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-accent/20 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-accent animate-pulse-slow" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-accent text-sm font-medium">
                    {analysisStep}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    Leia analyse ton graphique...
                  </p>
                </div>
              </div>
            )}

            {result && cfg && (
              <div className="space-y-3 animate-slide-up">
                {/* Signal principal */}
                <div
                  className={`p-5 rounded-xl border ${cfg.border} ${cfg.bg} ${cfg.glow}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}
                      >
                        <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${cfg.color}`}>
                          {cfg.label}
                        </div>
                        <div className="text-text-secondary text-xs">
                          {cfg.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${cfg.color}`}>
                        {result.confidence}%
                      </div>
                      <div className="text-text-secondary text-xs">
                        Confiance
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${
                        result.signal === "LONG"
                          ? "bg-accent-green"
                          : result.signal === "SHORT"
                          ? "bg-accent-red"
                          : "bg-accent-yellow"
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Asset / TF / Pattern */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Asset", value: result.asset },
                    { label: "Timeframe", value: result.timeframe },
                    { label: "R:R", value: result.riskReward },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-3 rounded-xl bg-surface border border-border text-center"
                    >
                      <div className="text-text-secondary text-xs mb-1">
                        {item.label}
                      </div>
                      <div className="text-text-primary font-bold text-sm">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Entry */}
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-text-secondary text-xs uppercase tracking-wider">
                      Zone d&apos;entrée
                    </span>
                  </div>
                  <div className="text-text-primary font-bold text-lg">
                    {result.entry.zone}
                  </div>
                  <div className="text-text-secondary text-xs mt-1">
                    {result.entry.description}
                  </div>
                </div>

                {/* TP */}
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-accent-green" />
                    <span className="text-text-secondary text-xs uppercase tracking-wider">
                      Take Profit
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "TP1", value: result.takeProfit.tp1, pct: 40 },
                      { label: "TP2", value: result.takeProfit.tp2, pct: 70 },
                      { label: "TP3", value: result.takeProfit.tp3, pct: 100 },
                    ].map((tp) => (
                      <div
                        key={tp.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-accent-green font-bold w-8">
                            {tp.label}
                          </span>
                          <div className="w-24 bg-surface-2 rounded-full h-1">
                            <div
                              className="h-1 rounded-full bg-accent-green/60"
                              style={{ width: `${tp.pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-text-primary font-mono text-sm">
                          {tp.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SL */}
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-accent-red" />
                    <span className="text-text-secondary text-xs uppercase tracking-wider">
                      Stop Loss
                    </span>
                  </div>
                  <div className="text-accent-red font-bold text-lg">
                    {result.stopLoss.level}
                  </div>
                  <div className="text-text-secondary text-xs mt-1">
                    {result.stopLoss.description}
                  </div>
                </div>

                {/* Pattern + Trend */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-surface border border-border">
                    <div className="text-text-secondary text-xs mb-1">
                      Pattern
                    </div>
                    <div className="text-accent text-sm font-medium">
                      {result.pattern}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border">
                    <div className="text-text-secondary text-xs mb-1">
                      Tendance
                    </div>
                    <div className="text-accent text-sm font-medium">
                      {result.trend}
                    </div>
                  </div>
                </div>

                {/* Key levels */}
                {result.keyLevels.length > 0 && (
                  <div className="p-4 rounded-xl bg-surface border border-border">
                    <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
                      Niveaux clés
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keyLevels.map((level, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-surface-2 border border-border text-text-primary text-xs font-mono"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border">
                  <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">
                    Analyse de Leia
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="p-4 rounded-xl bg-accent-yellow/5 border border-accent-yellow/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-accent-yellow" />
                      <span className="text-accent-yellow text-xs uppercase tracking-wider">
                        Points d&apos;attention
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {result.warnings.map((w, i) => (
                        <li
                          key={i}
                          className="text-text-secondary text-xs flex items-start gap-2"
                        >
                          <span className="text-accent-yellow mt-0.5">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-text-secondary text-xs text-center opacity-50 px-4">
                  Cette analyse est fournie à titre éducatif uniquement. Elle ne
                  constitue pas un conseil financier. Tradez toujours avec votre
                  propre gestion du risque.
                </p>

                {/* New analysis button */}
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all text-sm"
                >
                  Nouvelle analyse
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
