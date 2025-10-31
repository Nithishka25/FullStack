import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { connect, clearDatabase, disconnect } from './utils/db.js';

// Ensure test mode to prevent server from starting and DB auto-connect
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

test('register and login flow returns token and user', async () => {
  const agent = request(app);

  const reg = await agent
    .post('/api/auth/register')
    .send({ username: 'alice', email: 'alice@example.com', name: 'Alice', password: 'secret123' })
    .expect(201);

  assert.ok(reg.body.token);
  assert.equal(reg.body.user.username, 'alice');

  const login = await agent
    .post('/api/auth/login')
    .send({ usernameOrEmail: 'alice', password: 'secret123' })
    .expect(200);

  assert.ok(login.body.token);
  assert.equal(login.body.user.email, 'alice@example.com');
});
