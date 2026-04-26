import winston from 'winston';
import path from 'path';
import fs from 'fs';

let logger: winston.Logger;

export function initLogger(level: string, logFile: string): void {
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const fmt = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
      return `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${metaStr}`;
    }),
  );

  logger = winston.createLogger({
    level,
    format: fmt,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          fmt,
        ),
      }),
      new winston.transports.File({ filename: logFile }),
    ],
  });
}

export function getLogger(): winston.Logger {
  if (!logger) throw new Error('Logger non initialisé. Appelez initLogger() en premier.');
  return logger;
}

export const log = {
  info: (msg: string, meta?: object) => getLogger().info(msg, meta),
  warn: (msg: string, meta?: object) => getLogger().warn(msg, meta),
  error: (msg: string, meta?: object) => getLogger().error(msg, meta),
  debug: (msg: string, meta?: object) => getLogger().debug(msg, meta),
};
