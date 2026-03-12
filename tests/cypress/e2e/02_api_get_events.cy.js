/// <reference types="cypress" />

// Covers:
//   Feature #1 — Create Event
//     Scenario: Event is visible to all other logged-in users
//        after being created (GET /events/all returns it)
//
//   Feature #2 — Join Event
//     Scenario: Other users can see the user listed as attending
//        (GET /events/:id returns updated attendees list)
// ─────────────────────────────────────────────────────────────

const API = 'http://localhost:3000';
const TEST_EMAIL = 'testuser@findr.com';
const TEST_PASSWORD = 'Test1234!';

// All required fields from EventSchema
const buildEventBody = (userId) => ({
  name: `Cypress GET Test Event ${Date.now()}`,
  description: 'Created by Cypress for GET acceptance tests',
  address: '1 Grand Ave, San Luis Obispo, CA',
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

describe('API (GET) — Events visibility & attendee list', () => {
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

      cy.request({
        method: 'POST',
        url: `${API}/events`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: buildEventBody(userId),
      }).then((eventRes) => {
        expect(eventRes.status).to.eq(201);
        createdEventId = eventRes.body.data._id;
      });
    });
  });

  // Feature #1: Event visible to all logged-in users
  it('GET /events/all — should return 200 and include the newly created event', () => {
    cy.request({
      method: 'GET',
      url: `${API}/events/all`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);

      const found = res.body.data.find((e) => e._id === createdEventId);
      expect(found).to.exist;
      expect(found.name).to.include('Cypress GET Test Event');
    });
  });

  // Feature #1: GET /events/:id returns full event details
  it('GET /events/:id — should return 200 with correct event data', () => {
    cy.request({
      method: 'GET',
      url: `${API}/events/${createdEventId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('success', true);

      const event = res.body.data;
      expect(event._id).to.eq(createdEventId);
      expect(event).to.have.property('name');
      expect(event).to.have.property('description');
      expect(event).to.have.property('address');
      expect(event).to.have.property('attendees');
      expect(event.attendees).to.be.an('array');
    });
  });

  // Feature #2: Attendees list visible to other users
  it('GET /events/:id — should show updated attendees list after a user joins', () => {
    cy.request({
      method: 'PUT',
      url: `${API}/events/${createdEventId}/attendees/add/${userId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((joinRes) => {
      expect(joinRes.status).to.eq(200);

      cy.request({
        method: 'GET',
        url: `${API}/events/${createdEventId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);

        const attendees = res.body.data.attendees;
        expect(attendees).to.be.an('array');

        const isAttending = attendees.some(
          (a) => (typeof a === 'object' ? a._id : a) === userId
        );
        expect(isAttending).to.be.true;
      });
    });
  });

  // 404 for non-existent event
  it('GET /events/:id — should return 404 for a non-existent event', () => {
    cy.request({
      method: 'GET',
      url: `${API}/events/000000000000000000000000`,
      headers: { Authorization: `Bearer ${accessToken}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  // Teardown
  after(() => {
    if (!createdEventId) return;
    cy.request({
      method: 'DELETE',
      url: `${API}/events/${createdEventId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      failOnStatusCode: false,
    }).then(() => cy.log(`✅ Teardown: event ${createdEventId} deleted`));
  });
});
