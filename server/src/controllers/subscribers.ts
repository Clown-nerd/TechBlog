import { Request, Response, NextFunction } from 'express';
import db from '../db';
import { createError } from '../middleware/errorHandler';
import { SubscribeInput } from '../schemas/subscriber.schema';

// ---------------------------------------------------------------------------
// POST /api/subscribers
// ---------------------------------------------------------------------------
export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input: SubscribeInput = req.body;
    const { email, first_name, last_name, topic_preferences } = input;

    const result = await db.query(
      `INSERT INTO subscribers (email, first_name, last_name, topic_preferences)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET is_active = TRUE,
             topic_preferences = EXCLUDED.topic_preferences
       RETURNING id, email, first_name, last_name, topic_preferences, subscribed_at, is_active`,
      [email, first_name ?? null, last_name ?? null, topic_preferences],
    );

    const subscriber = result.rows[0];

    // ── Welcome email stub ────────────────────────────────────────────────
    // Replace this with your email provider (e.g. Resend, SendGrid, Nodemailer)
    sendWelcomeEmail(subscriber.email, subscriber.first_name).catch((err) =>
      console.error('[EMAIL] Welcome email failed:', err),
    );

    res.status(201).json({
      message: 'Subscribed successfully. Welcome to Bash n Build!',
      subscriber,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/subscribers   (admin only)
// ---------------------------------------------------------------------------
export const getSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page  = Math.max(1, parseInt((req.query.page  as string) || '1',  10));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '20', 10));
    const offset = (page - 1) * limit;
    const activeOnly = req.query.active !== 'false';

    const result = await db.query(
      `SELECT id, email, first_name, last_name, topic_preferences, subscribed_at, is_active
       FROM subscribers
       WHERE ($1 = FALSE OR is_active = TRUE)
       ORDER BY subscribed_at DESC
       LIMIT $2 OFFSET $3`,
      [activeOnly, limit, offset],
    );

    res.json({ data: result.rows, meta: { page, limit } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Stub — swap in your real mailer here
// ---------------------------------------------------------------------------
async function sendWelcomeEmail(email: string, name?: string | null): Promise<void> {
  const greeting = name ? `Hi ${name}` : 'Hello';
  console.log(
    `[EMAIL STUB] Sending welcome email to ${email}: "${greeting}, welcome to Bash n Build!"`,
  );
  // e.g. await resend.emails.send({ from: '...', to: email, subject: '...', html: '...' });
}
