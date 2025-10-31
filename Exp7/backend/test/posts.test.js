import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { connect, clearDatabase, disconnect } from './utils/db.js';

process.env.NODE_ENV = 'test';

let app;

before(async () => {
  await connect();
  ({ default: app } = await import('../src/server.js'));
});

after(async () => {
  await disconnect();
});

beforeEach(async () => {
  await clearDatabase();
});

async function registerAndLogin(agent, { username, email, name, password }) {
  await agent.post('/api/auth/register').send({ username, email, name, password }).expect(201);
  const login = await agent.post('/api/auth/login').send({ usernameOrEmail: username, password }).expect(200);
  return login.body.token;
}

test('create, update, delete post lifecycle', async () => {
  const agent = request(app);
  const token = await registerAndLogin(agent, {
    username: 'bob',
    email: 'bob@example.com',
    name: 'Bob',
    password: 'secret123'
  });

  const created = await agent
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Hello world' })
    .expect(201);

  assert.equal(created.body.content, 'Hello world');
  const postId = created.body._id;

  const updated = await agent
    .put(`/api/posts/${postId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'Updated text' })
    .expect(200);

  assert.equal(updated.body.content, 'Updated text');

  await agent
    .delete(`/api/posts/${postId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
