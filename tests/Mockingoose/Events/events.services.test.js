const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const eventModel = require('../../backend/Events/EventSchema.js');
const eventServices = require('../../backend/Events/EventServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Event Services (Jest + Mockingoose)', () => {
  const dummyEvent = {
    _id: '507f191e810c19729de86011',
    title: 'Launch Party',
    location: 'New York',
    date: new Date('2026-06-01'),
  };

  test('getAllEvents returns events', async () => {
    mockingoose(eventModel).toReturn([dummyEvent], 'find');
    const events = await eventServices.getAllEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Launch Party');
  });

  test('addEvent successfully', async () => {
    const input = { title: 'Hackathon', location: 'San Francisco', date: new Date() };
    mockingoose(eventModel).toReturn({ ...input, _id: 'abc123' }, 'save');
    const result = await eventServices.addEvent(input);
    expect(result).toBeDefined();
    expect(result.title).toBe('Hackathon');
  });

  test('findEventById returns event', async () => {
    mockingoose(eventModel).toReturn(dummyEvent, 'findOne');
    const event = await eventServices.findEventById(dummyEvent._id);
    expect(event.title).toBe('Launch Party');
  });

  test('updateEvent updates event', async () => {
    const updated = { ...dummyEvent, location: 'Boston' };
    mockingoose(eventModel).toReturn(updated, 'findOneAndUpdate');
    const event = await eventServices.updateEvent(dummyEvent._id, { location: 'Boston' });
    expect(event.location).toBe('Boston');
  });

  test('deleteEvent deletes event', async () => {
    mockingoose(eventModel).toReturn(dummyEvent, 'findOneAndDelete');
    const event = await eventServices.deleteEvent(dummyEvent._id);
    expect(event.title).toBe('Launch Party');
  });
});
