import { Request, Response, NextFunction } from 'express';
import { Resend } from 'resend';
import db from '../db';
import { createError } from '../middleware/errorHandler';
import { SubscribeInput } from '../schemas/subscriber.schema';
import { mockSubscribers } from '../mock/data';

const USE_MOCK = process.env.USE_MOCK === 'true';
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');


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

    // Check if actively subscribed already
    const existing = await db.query('SELECT is_active FROM subscribers WHERE email = $1', [email]);
    if (existing.rowCount && existing.rows[0].is_active) {
      res.status(409).json({ error: 'You are already subscribed!' });
      return;
    }

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

    // Send Welcome Email
    sendWelcomeEmail(subscriber.email, subscriber.first_name).catch((err) =>
      console.error('[EMAIL] Welcome email failed:', err),
    );

    res.status(201).json({
      message: "You're in! Check your inbox for a welcome email from the Silicon Savannah.",
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
    
    // Topic filter
    const topic = req.query.topic as string | undefined;
    
    // Base conditions
    const conditions = ['is_active = TRUE'];
    const params: any[] = [];
    
    if (topic) {
      params.push(topic);
      conditions.push(`$1 = ANY(topic_preferences)`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) AS total FROM subscribers ${whereClause}`, params);
    const totalCount = parseInt(countRes.rows[0]?.total || '0', 10);

    const result = await db.query(
      `SELECT id, email, first_name, last_name, topic_preferences, subscribed_at, is_active
       FROM subscribers
       ${whereClause}
       ORDER BY subscribed_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    res.json({ data: result.rows, meta: { page, limit, total_count: totalCount } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/subscribers/:id   (admin only)
// ---------------------------------------------------------------------------
export const deleteSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const result = await db.query(
      `UPDATE subscribers SET is_active = FALSE WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Subscriber not found' });
      return;
    }

    res.json({ message: 'Subscriber removed (soft deleted)' });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Email Sender
// ---------------------------------------------------------------------------
async function sendWelcomeEmail(email: string, name?: string | null): Promise<void> {
  const greeting = name ? `Hi ${name}` : 'Hello';
  
  // Bash n Build branded HTML template
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F6F4F0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(28, 28, 30, 0.1);">
      <div style="background-color: #1A4331; padding: 40px 30px; text-align: center;">
        <h1 style="color: #F6F4F0; font-family: 'Georgia', serif; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Bash n Build</h1>
        <p style="color: #E8A317; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 0 0;">Kenya's Tech Pulse</p>
      </div>
      <div style="padding: 40px 30px; color: #1C1C1E; font-size: 16px; line-height: 1.6;">
        <p style="margin-top: 0;">${greeting},</p>
        <p>You're in. Welcome to the Bash n Build newsletter.</p>
        <p>Every Friday, we'll send you the best technical guides, engineering war stories, and startup intelligence from the Silicon Savannah and across Africa.</p>
        <p>No fluff, no spam. Just deep technical content written by engineers, for engineers.</p>
        <div style="margin: 40px 0; text-align: center;">
          <a href="https://bashnbuild.co.ke" style="background-color: #C04A33; color: #F6F4F0; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Read the Latest Articles</a>
        </div>
        <p>Keep building,</p>
        <p><strong>The Bash n Build Team</strong></p>
      </div>
      <div style="padding: 24px 30px; background-color: rgba(28, 28, 30, 0.04); font-size: 12px; color: #737373; text-align: center;">
        <p style="margin: 0;">Built in Nairobi 🇰🇪</p>
        <p style="margin: 8px 0 0 0;">You're receiving this because you subscribed at bashnbuild.co.ke.</p>
      </div>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL STUB] Would have sent:', html);
    return;
  }

  await resend.emails.send({
    from: 'Bash n Build <hello@bashnbuild.co.ke>', // Note: requires domain verification in Resend or use 'onboarding@resend.dev' for sandbox
    to: email,
    subject: 'Welcome to the Silicon Savannah 🌍',
    html,
  });
}
