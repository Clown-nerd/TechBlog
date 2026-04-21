import request from 'supertest';
import app from '../index';
import { getAdminToken, getAuthorToken, getMockSubscriberToken } from './setup';
import db from '../db';

describe('Articles Endpoints', () => {
  it('GET /api/articles/:slug - fetches single article with unified author object', async () => {
    // Rely on seed.sql containing an article with slug "mastering-postgresql-indexing"
    const response = await request(app).get('/api/articles/mastering-postgresql-indexing');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('slug', 'mastering-postgresql-indexing');
    expect(response.body).toHaveProperty('author');
    expect(response.body.author).toHaveProperty('name', 'John Doe');
    expect(response.body.author).toHaveProperty('handle', 'jdoe_dev');
    // Ensure bio / expertise might be present if the query mapped them, wait, the controller maps: id, display_name AS name, username AS handle, bio, avatar_url, role, expertise
    expect(response.body.author).toHaveProperty('bio');
    expect(response.body.author).toHaveProperty('expertise');
  });

  it('GET /api/articles?sort=view_count - fetches trending articles from mv_trending_articles', async () => {
    const response = await request(app).get('/api/articles?sort=view_count');
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // The top trending should be 'agentic-ai-workflows' or similar based on view_count in seeds
    const firstArticle = response.body.data[0];
    expect(firstArticle).toHaveProperty('view_count');
    // Check it's sorted descending by checking the second if there is one
    if (response.body.data.length > 1) {
      expect(firstArticle.view_count).toBeGreaterThanOrEqual(response.body.data[1].view_count);
    }
  });

  describe('POST /api/articles', () => {
    it('blocks subscriber roles', async () => {
      const subscriberToken = getMockSubscriberToken();
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${subscriberToken}`)
        .send({
          title: 'Subscriber Article',
          slug: 'sub-article',
          body: 'Not allowed',
          status: 'draft',
          reading_time_minutes: 5,
          author_id: 999, // mismatch or not doesn't matter, should block
          tag_ids: []
        });
      
      // Our controller uses a role-based check? Actually, wait. Let's check `articles.ts` router.
      // Wait, `router.post('/', authenticate, validateBody(CreateArticleSchema), articlesController.createArticle);`
      // It just uses `authenticate`, but `authenticate` sets `req.user`. Wait, did they implement `requireRole` in articles router? 
      // Let's look at `routes/articles.ts`: it does NOT use `requireRole`. Wait! It only uses `authenticate`. 
      // Let me write the test. If it doesn't block by role, I might need to fix the router. Let's see if we expect 403.
      // Wait, let me check the prompt: "(verifying that the JWT authentication middleware correctly blocks 'subscriber' roles but allows 'admin' and 'author' roles)".
      // Ah, the user assumes it blocks. We'll write the test for 403/Unauthorized. We might need to fix the router if it fails!
      expect([401, 403]).toContain(response.status);
    });

    it('catches validation errors for incomplete payload', async () => {
      const authorToken = getAuthorToken();
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          // Missing 'title', 'slug', 'body'
          status: 'draft',
          tag_ids: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      // Should mention validation failed
    });

    it('allows author role to create an article', async () => {
      const authorToken = getAuthorToken();
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'New Author Article',
          slug: 'new-author-article',
          body: 'Some content',
          status: 'draft',
          reading_time_minutes: 5,
          author_id: 2, // jdoe_dev
          tag_ids: []
        });

      // We expect 201 Created
      if (response.status !== 201 && response.status !== 403) {
        console.error(response.body);
      }
      // If it returns 403, it means the router uses requireRole which we'll have to add.
      // For now, let's assume it returns 201 or if the router is missing requireRole, we'll fix it after tests run.
      // Wait, actually, let me just assert 201.
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Author Article');
    });
  });
});
