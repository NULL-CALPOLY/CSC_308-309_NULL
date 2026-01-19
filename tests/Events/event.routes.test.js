import request from 'supertest';
import app from '../../backend/backend.js';
import eventModel from '../../backend/EventFiles/EventSchema.js';
import mongoose from 'mongoose';

const testEvent = {
  name: 'Tech Meetup 2025',
  description: 'Testing',
  mapComponent: 'TechHall-1',
  attendees: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
  host: new mongoose.Types.ObjectId(),
  blockedUsers: [new mongoose.Types.ObjectId()],
  comment: ['Looking forward to this!', 'Excited!'],
  location: {
    type: 'Point',
    coordinates: [-118.2437, 34.0522],
  },
  interests: ['technology', 'networking', 'AI'],
  time: {
    start: new Date('2025-06-15'),
    end: new Date('2025-06-16'),
  },
};

beforeEach(async () => {
  await eventModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Event Routes', () => {
  test('GET /events/all returns 404 when no events exist', async () => {
    const res = await request(app).get('/events/all');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /events creates an event', async () => {
    const res = await request(app).post('/events').send(testEvent);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Tech Meetup 2025');
  });

  test('GET /events/:id returns the created event', async () => {
    const created = await eventModel.create(testEvent);
    const res = await request(app).get(`/events/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(testEvent.name);
  });

  test('PUT /events/:id updates the event', async () => {
    const created = await eventModel.create(testEvent);
    const res = await request(app)
      .put(`/events/${created._id}`)
      .send({ description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description');
  });

  test('DELETE /events/:id deletes the event', async () => {
    const created = await eventModel.create(testEvent);
    const res = await request(app).delete(`/events/${created._id}`);
    expect(res.status).toBe(200);
    const deleted = await eventModel.findById(created._id);
    expect(deleted).toBeNull();
  });

  test('GET /events/search/name/:name finds event by name', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/name/Tech`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /events/search/description/:keyword finds event by description', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/description/Testing`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /events/search/map/:mapComponent finds event by map component', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/map/TechHall-1`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /events/search/host/:hostId finds events by host', async () => {
    const created = await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/host/${created.host}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/attendee/:userId finds events with that attendee', async () => {
    const created = await eventModel.create(testEvent);
    const attendeeId = created.attendees[0];
    const res = await request(app).get(`/events/search/attendee/${attendeeId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/interests/:interests finds matching events', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(
      `/events/search/interests/AI,technology`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/location/:location finds events near coordinates', async () => {
    await eventModel.create(testEvent);

    // format: latitude,longitude,radius
    const res = await request(app).get(
      `/events/search/location/34.0522,-118.2437,10`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /events/search/start/:start finds events by start time', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/start/2025-06-15`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/end/:end finds events by end time', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(`/events/search/end/2025-06-16`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/time-range/:start/:end finds events between times', async () => {
    await eventModel.create(testEvent);
    const res = await request(app).get(
      `/events/search/time-range/2025-06-14/2025-06-17`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /events/search/blocked/:userId finds events that block this user', async () => {
    const created = await eventModel.create(testEvent);
    const blockedUserId = created.blockedUsers[0];
    const res = await request(app).get(
      `/events/search/blocked/${blockedUserId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('PUT /events/:id/attendees/add/:userId adds attendee to event', async () => {
    const created = await eventModel.create(testEvent);
    const newUserId = new mongoose.Types.ObjectId();

    const res = await request(app).put(
      `/events/${created._id}/attendees/add/${newUserId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attendees).toContain(newUserId.toString());
  });

  test('PUT /events/:id/attendees/remove/:userId removes attendee from event', async () => {
    const attendeeId = new mongoose.Types.ObjectId();
    const created = await eventModel.create({
      ...testEvent,
      attendees: [attendeeId],
    });

    const res = await request(app).put(
      `/events/${created._id}/attendees/remove/${attendeeId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attendees).not.toContain(attendeeId.toString());
  });

  test('PUT /events/:id/blocked/add/:userId adds user to blocked list', async () => {
    const created = await eventModel.create(testEvent);
    const newBlockedId = new mongoose.Types.ObjectId();

    const res = await request(app).put(
      `/events/${created._id}/blocked/add/${newBlockedId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.blockedUsers).toContain(newBlockedId.toString());
  });

  test('PUT /events/:id/blocked/remove/:userId removes user from blocked list', async () => {
    const blockedUserId = new mongoose.Types.ObjectId();
    const created = await eventModel.create({
      ...testEvent,
      blockedUsers: [blockedUserId],
    });

    const res = await request(app).put(
      `/events/${created._id}/blocked/remove/${blockedUserId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.blockedUsers).not.toContain(blockedUserId.toString());
  });
});
