import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leia — AI Trading Assistant",
  description: "Analyse tes graphiques de trading avec l'intelligence artificielle. Obtenez des recommandations de position, TP et SL en secondes.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📈</text></svg>",
  },
  openGraph: {
    title: "Leia — AI Trading Assistant",
    description: "Analyse tes graphiques de trading avec l'IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
