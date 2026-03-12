/// <reference types="cypress" />

// Covers:
//   Feature #1 — Create Event
//     Scenario: User successfully creates an event with valid details
//     Scenario: Event is saved and returned with correct data
//
//   Feature #3 — Event Chat
//     Scenario: A joined user posts a comment and it is visible
//     Scenario: Missing required fields returns an error
// ─────────────────────────────────────────────────────────────

const API = 'http://localhost:3000';
const TEST_EMAIL = 'testuser@findr.com';
const TEST_PASSWORD = 'Test1234!';

// All required fields from EventSchema
const buildEventBody = (userId) => ({
  name: `Cypress POST Test Event ${Date.now()}`,
  description: 'A test event created by Cypress automated acceptance test',
  address: '1 Grand Ave, San Luis Obispo, CA 93407',
  mapComponent: 'default',
  host: userId,
  interests: [],
  comments: [],
  attendees: [],
  blockedUsers: [],
  location: {
    type: 'Point',
    coordinates: [-120.6596, 35.2828], // [longitude, latitude]
  },
  time: {
    start: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    end: new Date(
      Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 2
    ).toISOString(),
  },
});

describe('API (POST) — Create Event & Post Comment', () => {
  let accessToken;
  let userId;
  let createdEventId;

  before(() => {
    cy.request({
      method: 'POST',
      url: `${API}/users/login`,
      body: { email: TEST_EMAIL, password: TEST_PASSWORD },
      withCredentials: true,
    }).then((res) => {
      expect(res.status).to.eq(200);
      accessToken = res.body.accessToken;
      userId = res.body.userId;
    });
  });

  // Feature #1: Successfully creates an event
  it('POST /events — should create a new event and return 201 with event data', () => {
    cy.request({
      method: 'POST',
      url: `${API}/events`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: buildEventBody(userId),
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');

      const event = res.body.data;
      expect(event).to.have.property('_id');
      expect(event.name).to.include('Cypress POST Test Event');
      expect(event.description).to.eq(
        'A test event created by Cypress automated acceptance test'
      );
      expect(event.address).to.eq('1 Grand Ave, San Luis Obispo, CA 93407');
      expect(event.attendees).to.be.an('array');

      createdEventId = event._id;
    });
  });

  // Feature #1: Created event is saved and retrievable
  it('POST /events then GET /events/:id — event should be saved in the database', () => {
    expect(createdEventId).to.exist;

    cy.request({
      method: 'GET',
      url: `${API}/events/${createdEventId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data._id).to.eq(createdEventId);
      expect(res.body.data.name).to.include('Cypress POST Test Event');
    });
  });

  // Feature #3: Joined user posts a comment
  it('POST /comments/event/:id/message — should add a comment to the event chat', () => {
    expect(createdEventId).to.exist;

    // Ensure a comments thread exists for this event
    cy.request({
      method: 'POST',
      url: `${API}/comments/event/${createdEventId}`,
      failOnStatusCode: false,
    });

    const testComment = {
      name: 'Cypress Test User',
      message: `Automated test comment ${Date.now()}`,
      avatar: null,
      userId: userId,
    };

    cy.request({
      method: 'POST',
      url: `${API}/comments/event/${createdEventId}/message`,
      headers: { 'Content-Type': 'application/json' },
      body: testComment,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');

      const thread = res.body.data;
      expect(thread).to.have.property('messages');
      expect(thread.messages).to.be.an('array');

      const posted = thread.messages.find(
        (m) => m.message === testComment.message
      );
      expect(posted).to.exist;
      expect(posted.name).to.eq(testComment.name);
    });
  });

  // Feature #3: Missing fields returns 400
  it('POST /comments/event/:id/message — should return 400 when name or message is missing', () => {
    expect(createdEventId).to.exist;

    cy.request({
      method: 'POST',
      url: `${API}/comments/event/${createdEventId}/message`,
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Cypress Test User' }, // missing message
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.have.property('success', false);
      expect(res.body.message).to.match(/name and message are required/i);
    });
  });

  // Feature #3: Comment is visible to all users
  it('GET /comments/event/:id — posted comment should be visible to other users', () => {
    expect(createdEventId).to.exist;

    cy.request({
      method: 'GET',
      url: `${API}/comments/event/${createdEventId}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('success', true);

      const thread = res.body.data;
      expect(thread).to.have.property('messages');
      expect(thread.messages).to.be.an('array');
      expect(thread.messages.length).to.be.greaterThan(0);

      const found = thread.messages.find((m) =>
        m.message.includes('Automated test comment')
      );
      expect(found).to.exist;
    });
  });

  // Teardown
  after(() => {
    if (!createdEventId) return;

    cy.request({
      method: 'DELETE',
      url: `${API}/comments/event/${createdEventId}`,
      failOnStatusCode: false,
    });

    cy.request({
      method: 'DELETE',
      url: `${API}/events/${createdEventId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      failOnStatusCode: false,
    }).then(() => cy.log(`✅ Teardown: event ${createdEventId} deleted`));
  });
});