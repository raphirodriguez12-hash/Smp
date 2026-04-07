import nodemailer from "nodemailer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { REPORT_RECIPIENT } from "@/lib/constants";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

interface SendReportOptions {
  buffer: Buffer;
  from: Date;
  to: Date;
  entryCount: number;
  userCount: number;
}

export async function sendTimesheetReport({
  buffer,
  from,
  to,
  entryCount,
  userCount,
}: SendReportOptions): Promise<void> {
  const transporter = createTransporter();

  const fromStr = format(from, "dd MMMM yyyy", { locale: fr });
  const toStr = format(to, "dd MMMM yyyy", { locale: fr });
  const filename = `rapport-pointage-SMP-${format(from, "yyyy-MM-dd")}_${format(to, "yyyy-MM-dd")}.xlsx`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #1E3A5F; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }
    .body { padding: 30px; }
    .info-box { background: #E8F0FE; border-left: 4px solid #1E3A5F; padding: 15px 20px; border-radius: 4px; margin: 20px 0; }
    .info-box p { margin: 5px 0; font-size: 14px; }
    .info-box strong { color: #1E3A5F; }
    .stat { display: inline-block; background: #1E3A5F; color: white; padding: 8px 20px; border-radius: 20px; margin: 5px; font-size: 13px; }
    .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #999; font-size: 12px; }
    .attachment-note { color: #555; font-size: 13px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Rapport de Pointage SMP</h1>
      <p>Fiche de présence automatique</p>
    </div>
    <div class="body">
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-joint le rapport de pointage pour la période suivante :</p>

      <div class="info-box">
        <p><strong>Période :</strong> du ${fromStr} au ${toStr}</p>
        <p><strong>Nombre d'employés :</strong> ${userCount}</p>
        <p><strong>Nombre d'entrées :</strong> ${entryCount}</p>
      </div>

      <p>
        <span class="stat">📅 ${entryCount} pointages</span>
        <span class="stat">👥 ${userCount} employés</span>
      </p>

      <p class="attachment-note">
        📎 Le fichier Excel <strong>${filename}</strong> est joint à cet email.
        Vous pouvez l'ouvrir avec Microsoft Excel ou tout autre tableur compatible.
      </p>

      <p>Cordialement,<br><strong>Système de Pointage SMP</strong></p>
    </div>
    <div class="footer">
      Ce message a été envoyé automatiquement par le système SMP Pointage.<br>
      Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `SMP Pointage <${process.env.SMTP_USER}>`,
    to: REPORT_RECIPIENT,
    subject: `📊 Rapport de Pointage SMP — ${fromStr} au ${toStr}`,
    html: htmlBody,
    attachments: [
      {
        filename,
        content: buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}
