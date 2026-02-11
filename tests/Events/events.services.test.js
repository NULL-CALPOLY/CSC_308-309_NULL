import eventServices from '../../backend/EventFiles/EventServices.js';
import eventModel from '../../backend/EventFiles/EventSchema.js';
import mongoose from 'mongoose';

const testEvent = {
  name: 'Test Event',
  description: 'This is a test event',
  mapComponent: 'TestMap',
  host: new mongoose.Types.ObjectId(),
  attendees: [],
  blockedUsers: [],
  interests: ['music', 'tech'],
  location: { type: 'Point', coordinates: [-118.24, 34.05] },
  time: { start: new Date(), end: new Date(Date.now() + 3600000) }, // 1 hour later
};

beforeEach(async () => {
  await eventModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Event Services', () => {
  it('should create a new event', async () => {
    const event = await eventServices.addEvent(testEvent);
    expect(event.name).toBe('Test Event');

    const found = await eventModel.findById(event._id);
    expect(found.description).toBe('This is a test event');
  });

  it('should find event by ID', async () => {
    const event = await eventModel.create(testEvent);
    const found = await eventServices.findEventById(event._id);
    expect(found._id.toString()).toBe(event._id.toString());
  });

  it('should find events by name', async () => {
    await eventModel.create(testEvent);
    const results = await eventServices.findEventByName('Test');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should update an event', async () => {
    const event = await eventModel.create(testEvent);
    const updated = await eventServices.updateEvent(event._id, {
      description: 'Updated description',
    });
    expect(updated.description).toBe('Updated description');
  });

  it('should delete an event', async () => {
    const event = await eventModel.create(testEvent);
    const deleted = await eventServices.deleteEvent(event._id);
    expect(deleted._id.toString()).toBe(event._id.toString());
  });

  it('should find events by map component', async () => {
    await eventModel.create(testEvent);
    const results = await eventServices.findEventByMapComponent('TestMap');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find events by interests', async () => {
    await eventModel.create(testEvent);
    const results = await eventServices.findEventByInterests(['tech']);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find events near a location', async () => {
    await eventModel.create(testEvent);
    // latitude, longitude, radiusInMiles
    const results = await eventServices.findEventByLocation(34.05, -118.24, 10);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find events by host', async () => {
    const event = await eventModel.create(testEvent);
    const results = await eventServices.findEventByHost(event.host);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find events by attendee', async () => {
    const attendeeId = new mongoose.Types.ObjectId();
    const eventWithAttendee = await eventModel.create({
      ...testEvent,
      attendees: [attendeeId],
    });
    const results = await eventServices.findEventByAttendee(attendeeId);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]._id.toString()).toBe(eventWithAttendee._id.toString());
  });

  it('should find events within a time range', async () => {
    const start = new Date(Date.now() - 10000);
    const end = new Date(Date.now() + 3600000);
    await eventModel.create(testEvent);
    const results = await eventServices.findEventsBetween(start, end);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should find events blocking a user', async () => {
    const userId = new mongoose.Types.ObjectId();
    await eventModel.create({ ...testEvent, blockedUsers: [userId] });
    const results = await eventServices.findEventsBlockingUser(userId);
    expect(results.length).toBeGreaterThan(0);
  });
});
