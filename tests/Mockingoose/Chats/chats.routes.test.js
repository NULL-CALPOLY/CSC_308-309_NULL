const request = require('supertest');
const app = require('../../backend/backend.js');
const mockingoose = require('mockingoose');
const chatModel = require('../../backend/Chat/ChatSchema.js');

const dummyMessage = {
  _id: '507f191e810c19729de86031',
  sender: 'user123',
  receiver: 'user456',
  message: 'Hello!',
  timestamp: new Date(),
};

beforeEach(() => mockingoose.resetAll());

describe('Chat Routes (mocked)', () => {
  test('GET /chats returns all messages', async () => {
    mockingoose(chatModel).toReturn([dummyMessage], 'find');
    const res = await request(app).get('/chats');
    expect(res.status).toBe(200);
    expect(res.body.data[0].message).toBe('Hello!');
  });

  test('POST /chats adds message', async () => {
    const newMsg = { sender: 'user456', receiver: 'user123', message: 'Hi!' };
    mockingoose(chatModel).toReturn({ ...newMsg, _id: 'abc123', timestamp: new Date() }, 'save');
    const res = await request(app).post('/chats').send(newMsg);
    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe('Hi!');
  });

  test('GET /chats/:id returns message', async () => {
    mockingoose(chatModel).toReturn(dummyMessage, 'findOne');
    const res = await request(app).get(`/chats/${dummyMessage._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Hello!');
  });
});
