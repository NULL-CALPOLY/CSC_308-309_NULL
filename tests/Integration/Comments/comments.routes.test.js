import request from 'supertest';
import app from '../../../backend/backend.js';
import commentsModel from '../../../backend/CommentFiles/CommentsSchema.js';
import mongoose from 'mongoose';

const testEventId = new mongoose.Types.ObjectId();
const testUserId = new mongoose.Types.ObjectId();

beforeEach(async () => {
  await commentsModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Comments Routes', () => {
  test('GET /comments returns working message', async () => {
    const res = await request(app).get('/comments/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Comments service is working');
  });

  test('POST /comments/event/:eventId creates a comments thread', async () => {
    const res = await request(app).post(`/comments/event/${testEventId}`);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventId.toString()).toBe(testEventId.toString());
    expect(res.body.data.messages).toHaveLength(0);
  });

  test('GET /comments/event/:eventId returns comments for event', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });
    const res = await request(app).get(`/comments/event/${testEventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventId.toString()).toBe(testEventId.toString());
  });

  test('GET /comments/event/:eventId returns 404 when no thread exists', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/comments/event/${fakeEventId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /comments/event/:eventId/message adds a message', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const res = await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({
        name: 'Test User',
        message: 'Hello, world!',
        avatar: null,
        userId: testUserId.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages).toHaveLength(1);
    expect(res.body.data.messages[0].name).toBe('Test User');
    expect(res.body.data.messages[0].message).toBe('Hello, world!');
  });

  test('POST /comments/event/:eventId/message requires name and message', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const res = await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({ name: 'Test User' }); // missing message

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Name and message are required');
  });

  test('POST /comments/event/:eventId/message returns 400 when name is missing', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const res = await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({ message: 'Hello!' }); // missing name

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /comments/event/:eventId/message returns 404 when thread not found', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/comments/event/${fakeEventId}/message`)
      .send({ name: 'Test User', message: 'Hello!' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /comments/event/:eventId deletes comments thread', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const res = await request(app).delete(`/comments/event/${testEventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const gone = await commentsModel.findOne({ eventId: testEventId });
    expect(gone).toBeNull();
  });

  test('DELETE /comments/event/:eventId returns 404 when thread not found', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/comments/event/${fakeEventId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /comments/event/:eventId/message adds message without userId (anonymous)', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const res = await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({ name: 'Anonymous', message: 'Anonymous message' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages[0].name).toBe('Anonymous');
  });

  test('Multiple messages can be added', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({ name: 'User1', message: 'First message' });

    const res = await request(app)
      .post(`/comments/event/${testEventId}/message`)
      .send({ name: 'User2', message: 'Second message' });

    expect(res.status).toBe(200);
    expect(res.body.data.messages).toHaveLength(2);
  });
});
