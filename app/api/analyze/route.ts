import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Tu es Leia, une IA experte en analyse technique des marchés financiers (crypto, forex, actions, indices).
Tu analyses des screenshots de graphiques de trading et tu fournis des recommandations précises et actionnables.

Ton expertise couvre :
- Analyse des bougies japonaises (candlesticks) et patterns associés
- Supports et résistances statiques et dynamiques
- Indicateurs techniques (EMA, RSI, MACD, Bollinger Bands, Volume, etc.)
- Structures de marché (HH/HL pour tendance haussière, LH/LL pour tendance baissière)
- Zones d'offre et de demande (Supply & Demand)
- Patterns chartistes (triangle, wedge, double top/bottom, head & shoulders, etc.)
- Niveaux de Fibonacci
- Price action pure

Tu réponds TOUJOURS en JSON valide avec exactement cette structure, sans aucun texte en dehors du JSON :

{
  "signal": "LONG" | "SHORT" | "WAIT",
  "confidence": <nombre entre 0 et 100>,
  "asset": "<nom de l'actif détecté ou 'Inconnu'>",
  "timeframe": "<timeframe détecté ou 'Non spécifié'>",
  "entry": {
    "zone": "<prix ou zone de prix ex: '42,500 - 42,800'>",
    "description": "<explication courte de l'entrée>"
  },
  "takeProfit": {
    "tp1": "<niveau TP1>",
    "tp2": "<niveau TP2>",
    "tp3": "<niveau TP3>"
  },
  "stopLoss": {
    "level": "<niveau SL précis>",
    "description": "<justification du SL>"
  },
  "riskReward": "<ratio ex: '1:2.5'>",
  "pattern": "<pattern principal identifié>",
  "trend": "<tendance principale>",
  "keyLevels": ["<niveau1>", "<niveau2>", "<niveau3>"],
  "summary": "<analyse narrative en 2-3 phrases expliquant le setup>",
  "warnings": ["<avertissement1>", "<avertissement2>"]
}

Règles importantes :
- Si le signal est WAIT, mets quand même des zones hypothétiques pour TP/SL/entrée
- confidence entre 40-95 (jamais 100, jamais moins de 40)
- keyLevels : 2 à 5 niveaux importants visibles sur le chart
- warnings : risques spécifiques au setup (divergences, résistance proche, volume faible, etc.)
- Si tu ne peux pas identifier l'asset, écris "Non identifié"
- Tous les prix doivent être cohérents avec ce que tu vois sur le graphique`;

const USER_PROMPT = `Analyse ce graphique de trading. Identifie le signal (LONG/SHORT/WAIT), les niveaux d'entrée, take profit (TP1, TP2, TP3), stop loss, et donne-moi une analyse complète du setup.

Réponds UNIQUEMENT avec le JSON demandé, sans texte avant ou après.`;

export async function POST(request: NextRequest) {
  try {
    const { image, mediaType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Clé API Anthropic manquante. Configure ANTHROPIC_API_KEY dans tes variables d'environnement Vercel.",
        },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/png",
                data: image,
              },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON even if model wraps it in markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", rawText);
      return NextResponse.json(
        { error: "Format de réponse invalide de l'IA" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Basic validation
    if (!parsed.signal || !["LONG", "SHORT", "WAIT"].includes(parsed.signal)) {
      return NextResponse.json(
        { error: "Signal invalide retourné par l'IA" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Analysis error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Impossible de parser la réponse de l'IA" },
        { status: 500 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Erreur interne du serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
