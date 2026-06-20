import request from 'supertest';
import app from '../../../backend/backend.js';
import userModel from '../../../backend/UserFiles/UserSchema.js';
import mongoose from 'mongoose';
import { authHeader } from '../../helpers/auth.js';

beforeEach(async () => {
  await userModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

async function makeUser(email) {
  return userModel.create({ name: email.split('@')[0], email });
}

describe('User blocking', () => {
  test('block then unblock updates the block list', async () => {
    const blocker = await makeUser('blocker@example.com');
    const target = await makeUser('target@example.com');

    const blockRes = await request(app)
      .put(`/users/${blocker._id}/block/${target._id}`)
      .set(authHeader(blocker._id));
    expect(blockRes.status).toBe(200);
    expect(blockRes.body.data.blockedUsers.map(String)).toContain(
      String(target._id)
    );

    const unblockRes = await request(app)
      .put(`/users/${blocker._id}/unblock/${target._id}`)
      .set(authHeader(blocker._id));
    expect(unblockRes.status).toBe(200);
    expect(unblockRes.body.data.blockedUsers.map(String)).not.toContain(
      String(target._id)
    );
  });

  test('cannot block on behalf of another user', async () => {
    const a = await makeUser('a@example.com');
    const b = await makeUser('b@example.com');
    const res = await request(app)
      .put(`/users/${a._id}/block/${b._id}`)
      .set(authHeader(b._id)); // wrong identity
    expect(res.status).toBe(403);
  });

  test('cannot block yourself', async () => {
    const a = await makeUser('self@example.com');
    const res = await request(app)
      .put(`/users/${a._id}/block/${a._id}`)
      .set(authHeader(a._id));
    expect(res.status).toBe(400);
  });

  test('a blocked viewer gets 404 on the blocker profile', async () => {
    const blocker = await makeUser('owner@example.com');
    const blocked = await makeUser('blocked@example.com');
    await userModel.findByIdAndUpdate(blocker._id, {
      $addToSet: { blockedUsers: blocked._id },
    });

    const res = await request(app)
      .get(`/users/${blocker._id}`)
      .set(authHeader(blocked._id));
    expect(res.status).toBe(404);
  });

  test('an unrelated viewer can still see the profile', async () => {
    const blocker = await makeUser('owner2@example.com');
    const other = await makeUser('other@example.com');
    const res = await request(app)
      .get(`/users/${blocker._id}`)
      .set(authHeader(other._id));
    expect(res.status).toBe(200);
  });

  test('GET /users/:id/blocked is self-only', async () => {
    const a = await makeUser('listowner@example.com');
    const b = await makeUser('intruder@example.com');
    const ok = await request(app)
      .get(`/users/${a._id}/blocked`)
      .set(authHeader(a._id));
    expect(ok.status).toBe(200);
    const forbidden = await request(app)
      .get(`/users/${a._id}/blocked`)
      .set(authHeader(b._id));
    expect(forbidden.status).toBe(403);
  });
});
