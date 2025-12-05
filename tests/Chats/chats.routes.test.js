import request from 'supertest';
import app from '../../backend/backend.js';
import chatModel from '../../backend/ChatFiles/ChatSchema.js';
import mongoose from 'mongoose';

const testChat = {
  name: 'Test',
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
    expect(res.body.data.name).toBe('Test');
  });

  test('GET /chats/:id returns the created chat', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app).get(`/chats/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(testChat.name);
  });

  test('PUT /chats/:id updates the chat city', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app)
      .put(`/chats/${created._id}`)
      .send({ city: 'San Francisco' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.city).toBe('San Francisco');
  });

  test('DELETE /chats/:id deletes the chat', async () => {
    const created = await chatModel.create(testChat);
    const res = await request(app).delete(`/chats/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const check = await chatModel.findById(created._id);
    expect(check).toBeNull();
  });

  test('GET /chats/search/name/:name finds chat by name', async () => {
    await chatModel.create(testChat);
    const res = await request(app).get('/chats/search/name/Test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /chats/search/city/:city finds chat by city', async () => {
    await chatModel.create(testChat);
    const res = await request(app).get('/chats/search/city/Pyongyang');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /chats/:id/users/add/:userId adds a user to the chat', async () => {
    const created = await chatModel.create(testChat);
    const userId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/chats/${created._id}/users/add/${userId}`); 
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members.length).toBeGreaterThan(0);
});


  test('PUT /chats/:id/users/remove/:userId removes a user from the chat', async () => {
    const userId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, members: [userId] });
    const res = await request(app).put(`/chats/${created._id}/users/remove/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.members).not.toContain(userId.toString());
  });

  test('PUT /chats/:id/events/add/:eventId adds an event to the chat', async () => {
    const created = await chatModel.create(testChat);
    const eventId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/chats/${created._id}/events/add/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.events).toContain(eventId.toString());
  });

  test('PUT /chats/:id/events/remove/:eventId removes an event from the chat', async () => {
    const eventId = new mongoose.Types.ObjectId();
    const created = await chatModel.create({ ...testChat, events: [eventId] });
    const res = await request(app).put(`/chats/${created._id}/events/remove/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.events).not.toContain(eventId.toString());
  });
});
