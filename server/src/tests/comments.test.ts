import request from 'supertest';
import app from '../index';
import { getAuthorToken } from './setup';
import db from '../db';

describe('Comments Endpoints', () => {
  it('POST /api/comments - creates a root comment', async () => {
    const token = getAuthorToken();
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        article_id: 1, // Based on seed
        body: 'This is a new root comment.',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.body).toBe('This is a new root comment.');
    expect(response.body).toHaveProperty('materialized_path');
    
    // A root comment's path should equal its own id as a string
    const idStr = response.body.id.toString();
    expect(response.body.materialized_path).toBe(idStr);
  });

  it('POST /api/comments - creates a nested reply with correct materialized_path', async () => {
    const token = getAuthorToken();
    
    // First, let's find an existing comment from seeds or the one we just created
    // We know comment ID 1 is for Article 1 from seed.sql
    const rootCommentId = 1;
    
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        article_id: 1,
        parent_comment_id: rootCommentId,
        body: 'This is a nested reply.',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.parent_comment_id).toBe(rootCommentId);
    
    // The path should be root_id.new_id
    const newId = response.body.id;
    const expectedPath = `${rootCommentId}.${newId}`;
    expect(response.body.materialized_path).toBe(expectedPath);
  });
});
