import request from 'supertest';
import app from '../index';
import { getAdminToken, getAuthorToken, getMockSubscriberToken } from './setup';
import db from '../db';

describe('Articles Endpoints', () => {
  it('GET /api/articles/:slug - fetches single article with unified author object', async () => {
    const response = await request(app).get('/api/articles/mastering-postgresql-indexing');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('slug', 'mastering-postgresql-indexing');
    expect(response.body).toHaveProperty('author');
    expect(response.body.author).toHaveProperty('name', 'John Doe');
    expect(response.body.author).toHaveProperty('handle', 'jdoe_dev');
    expect(response.body.author).toHaveProperty('bio');
    expect(response.body.author).toHaveProperty('expertise');
  });

  it('GET /api/articles?sort=view_count - fetches trending articles from mv_trending_articles', async () => {
    const response = await request(app).get('/api/articles?sort=view_count');
    
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    const firstArticle = response.body.data[0];
    expect(firstArticle).toHaveProperty('view_count');
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
          author_id: 999,
          tag_ids: []
        });
      
      expect([401, 403]).toContain(response.status);
    });

    it('catches validation errors for incomplete payload', async () => {
      const authorToken = getAuthorToken();
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          status: 'draft',
          tag_ids: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
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
          author_id: 2,
          tag_ids: []
        });

      if (response.status !== 201 && response.status !== 403) {
        console.error(response.body);
      }
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Author Article');
    });
  });
});
