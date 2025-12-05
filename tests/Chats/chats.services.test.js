import request from 'supertest';
import app from '../../backend/backend.js';
import chatModel from '../../backend/ChatFiles/ChatSchema.js';
import mongoose from 'mongoose';

const testChat = {
  name: 'Test Chat',
  members: [],
  events: [],
  city: "Pyongyang",
  interests: ["kpop", "torture"]
};

beforeEach(async () => {
  await chatModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Chat Routes', () => {
  test('GET /chats/all returns 404 when no chats exist', async () => {
    const res = await request(app).get('/chats/all');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /chats creates a new chat', async () => {
    const res = await request(app).post('/chats').send(testChat);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(testChat.name);
  });

  test('GET /chats/:id returns the created chat', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app).get(`/chats/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(testChat.name);
  });

  test('PUT /chats/:id updates the chat name', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app)
      .put(`/chats/${created._id}`)
      .send({ name: 'Updated Chat' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Chat');
  });

  test('DELETE /chats/:id deletes the chat', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app).delete(`/chats/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const check = await chatModel.findById(created._id);
    expect(check).toBeNull();
  });

  test('GET /chats/search/name/:name finds chats by name', async () => {
    await chatModel.create(testChat);
    const res = await request(app).get('/chats/search/name/Test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /chats/search/city/:city finds chats by city', async () => {
    await chatModel.create(testChat);
    const res = await request(app).get('/chats/search/city/Pyongyang');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /chats/search/user/:userId finds chats by user ID', async () => {
    const userId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, members: [userId] });
    const res = await request(app).get(`/chats/search/user/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /chats/search/interests/:interests finds chats by interests', async () => {
    await chatModel.create(testChat);
    const res = await request(app).get('/chats/search/interests/kpop,torture');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /chats/search/event/:eventId finds chats by event', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, events: [eventId] });
    const res = await request(app).get(`/chats/search/event/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('PUT /chats/:id/users/add/:userId adds a member to the chat', async () => {
    const created = await chatModel.create(testChat);
    const userId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/chats/${created._id}/users/add/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.length).toBeGreaterThan(0);
  });

  test('PUT /chats/:id/users/remove/:userId removes a member from the chat', async () => {
    const userId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, members: [userId] });
    const res = await request(app).put(`/chats/${created._id}/users/remove/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.length).toBe(0);
  });

  test('PUT /chats/:id/events/add/:eventId adds an event to the chat', async () => {
    const created = await chatModel.create(testChat);
    const eventId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/chats/${created._id}/events/add/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.events.length).toBeGreaterThan(0);
  });

  test('PUT /chats/:id/events/remove/:eventId removes an event from the chat', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, events: [eventId] });
    const res = await request(app).put(`/chats/${created._id}/events/remove/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.events.length).toBe(0);
  });
});
