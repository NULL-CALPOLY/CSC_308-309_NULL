const request = require('supertest');
const app = require('../../backend/backend.js');
const mockingoose = require('mockingoose');
const eventModel = require('../../backend/Events/EventSchema.js');

const dummyEvent = {
  _id: '507f191e810c19729de86011',
  title: 'Launch Party',
  location: 'NYC',
  date: new Date('2026-06-01'),
};

beforeEach(() => mockingoose.resetAll());

describe('Events Routes (mocked)', () => {
  test('GET /events returns all events', async () => {
    mockingoose(eventModel).toReturn([dummyEvent], 'find');
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Launch Party');
  });

  test('POST /events creates event', async () => {
    const newEvent = { title: 'Hackathon', location: 'SF', date: new Date() };
    mockingoose(eventModel).toReturn({ ...newEvent, _id: 'abc123' }, 'save');

    const res = await request(app).post('/events').send(newEvent);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Hackathon');
  });

  test('GET /events/:id returns event by ID', async () => {
    mockingoose(eventModel).toReturn(dummyEvent, 'findOne');
    const res = await request(app).get(`/events/${dummyEvent._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Launch Party');
  });

  test('PUT /events/:id updates event', async () => {
    const updated = { ...dummyEvent, location: 'Boston' };
    mockingoose(eventModel).toReturn(updated, 'findOneAndUpdate');
    const res = await request(app)
      .put(`/events/${dummyEvent._id}`)
      .send({ location: 'Boston' });
    expect(res.status).toBe(200);
    expect(res.body.data.location).toBe('Boston');
  });

  test('DELETE /events/:id deletes event', async () => {
    mockingoose(eventModel).toReturn(dummyEvent, 'findOneAndDelete');
    const res = await request(app).delete(`/events/${dummyEvent._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Launch Party');
  });
});
