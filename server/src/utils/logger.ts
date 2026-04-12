import { createLogger, format, transports, addColors } from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = format;

const isProduction = process.env.NODE_ENV === 'production';

// ── Custom log levels (npm levels + http between info and verbose) ────────────
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'magenta',
});

// ── Development format: human-readable, colourised ───────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack ?? message}${metaStr}`;
  }),
);

// ── Production format: structured JSON for log aggregators ───────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

const logger = createLogger({
  // In production only log info+; in dev capture everything down to debug
  level: isProduction ? 'info' : 'debug',
  levels,
  format: isProduction ? prodFormat : devFormat,
  transports: [new transports.Console()],
  // Prevent unhandled exceptions from crashing the process silently
  exitOnError: false,
});

export default logger;
