import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Middleware
import { rateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Routes
import authRouter         from './routes/auth';
import articlesRouter     from './routes/articles';
import categoriesRouter   from './routes/categories';
import authorsRouter      from './routes/authors';
import mediaRouter        from './routes/media';
import embedsRouter       from './routes/embeds';
import subscribersRouter  from './routes/subscribers';
import searchRouter       from './routes/search';

import { env } from './config/env';

// Environment variables are now validated via config/env.ts
const app = express();
const PORT = process.env.PORT || 5000;

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter); // global 100 req/15 min per IP limiter

// ── HTTP request logging (morgan → winston) ──────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg: string) => logger.http(msg.trim()) },
    // Skip health-check noise in production
    skip: (_req, res) => process.env.NODE_ENV === 'production' && res.statusCode < 400,
  }),
);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/articles',    articlesRouter);
app.use('/api/categories',  categoriesRouter);
app.use('/api/authors',     authorsRouter);
app.use('/api/media',       mediaRouter);
app.use('/api/embeds',      embedsRouter);
app.use('/api/subscribers', subscribersRouter);
app.use('/api/search',      searchRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV ?? 'development' });
});

export default app;
