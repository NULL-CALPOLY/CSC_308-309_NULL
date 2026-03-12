/// <reference types="cypress" />

// Covers:
//   Feature #2 — Join Event
//     Scenario: User successfully joins an event
//     Scenario: User who already joined sees Leave Event button
//     Scenario: Non-logged-in user cannot join (button absent)
//
//   Feature #3 — Event Chat
//     Scenario: A joined user can post a comment
//     Scenario: A non-joined user sees the comments locked message
//
// Requirements:
//   - Frontend running at http://localhost:5173
//   - Backend running at http://localhost:3000
//   - A seed user must exist: testuser@findr.com / Test1234!
//   - At least one event must exist in the DB (we fetch /events/all
//     to grab a real event ID dynamically)

const API = 'http://localhost:3000';
const TEST_EMAIL = 'testuser@findr.com';
const TEST_PASSWORD = 'Test1234!';

// Helper: log in via API and store token + userId
function loginAndStoreToken() {
  cy.request({
    method: 'POST',
    url: `${API}/users/login`,
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    withCredentials: true,
  }).then((res) => {
    expect(res.status).to.eq(200);
    Cypress.env('accessToken', res.body.accessToken);
    Cypress.env('userId', res.body.userId);
  });
}

// Helper: get a real event ID from the DB
function fetchFirstEventId() {
  return cy
    .request({
      method: 'GET',
      url: `${API}/events/all`,
      headers: { Authorization: `Bearer ${Cypress.env('accessToken')}` },
    })
    .then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.length).to.be.greaterThan(0);
      return res.body.data[0]._id;
    });
}

// Helper: inject auth token into the app's localStorage so the React AuthContext sees the user as logged in 
function injectAuthViaLocalStorage(token, userId) {
  cy.window().then((win) => {
    win.localStorage.setItem('userToken', token);
    win.localStorage.setItem('userId', userId);
  });
}

describe('UI — Feature #2: Join Event & Feature #3: Event Chat', () => {
  // Feature #2: Scenario — Non-logged-in user sees no Join button
  describe('Feature #2 — Not logged in', () => {
    it('should not show a Join Event button when the user is not logged in', () => {
      // Get an event ID without being logged in
      cy.request({ method: 'GET', url: `${API}/events/all` }).then((res) => {
        const eventId = res.body.data[0]._id;
        cy.visit(`/events/${eventId}`);

        // The Join Event button should not exist for unauthenticated users.
        // EventDetails only renders it when isAuthenticated && !isHost
        cy.get('.ed-btn--primary').should('not.exist');

        // Comments section should also not be rendered (returns null when !isAuthenticated)
        cy.get('.ed-comments').should('not.exist');
        cy.get('.ed-comment-compose').should('not.exist');
      });
    });
  });

  // Feature #2 & #3: Scenarios requiring login
  describe('Feature #2 & #3 — Logged in user', () => {
    let eventId;

    before(() => {
      loginAndStoreToken();
      fetchFirstEventId().then((id) => {
        eventId = id;

        // Make sure we start clean: remove our user from attendees
        cy.request({
          method: 'PUT',
          url: `${API}/events/${id}/attendees/remove/${Cypress.env('userId')}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`,
          },
          failOnStatusCode: false,
        });
      });
    });

    beforeEach(() => {
      // Re-authenticate before each test since Cypress clears browser state
      loginAndStoreToken();
    });

    // Feature #2, Scenario 1: User successfully joins an event
    it('should show a Join Event button and allow the user to join', () => {
      cy.then(() => {
        cy.visit(`/events/${eventId}`);

        // Wait for the event page to load
        cy.get('.ed-card').should('be.visible');

        // The Join Event button should be visible (user is not yet attending)
        cy.get('.ed-btn--primary')
          .contains(/join event/i)
          .should('be.visible');

        // Intercept the attendees/add API call
        cy.intercept('PUT', `**/events/${eventId}/attendees/add/**`).as(
          'joinEvent'
        );

        // Click Join Event
        cy.get('.ed-btn--primary')
          .contains(/join event/i)
          .click();

        // Wait for the API call
        cy.wait('@joinEvent').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
        });

        // After joining, the button should switch to "Leave Event"
        cy.get('.ed-btn--primary')
          .contains(/leave event/i)
          .should('be.visible');
      });
    });

    // Feature #2, Scenario 2: Already joined -> shows Leave Event
    it('should show Leave Event button when the user has already joined', () => {
      cy.then(() => {
        // Ensure user is an attendee before visiting the page
        cy.request({
          method: 'PUT',
          url: `${API}/events/${eventId}/attendees/add/${Cypress.env('userId')}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`,
          },
        }).then(() => {
          cy.visit(`/events/${eventId}`);
          cy.get('.ed-card').should('be.visible');

          // Should show "Leave Event", not "Join Event"
          cy.get('.ed-btn--primary')
            .contains(/leave event/i)
            .should('be.visible');

          cy.get('.ed-btn--primary')
            .contains(/join event/i)
            .should('not.exist');
        });
      });
    });

    // Feature #3, Scenario 1: Joined user can post a comment
    it('should allow a joined user to post a comment in the event chat', () => {
      cy.then(() => {
        // Ensure the user is attending
        cy.request({
          method: 'PUT',
          url: `${API}/events/${eventId}/attendees/add/${Cypress.env('userId')}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`,
          },
        }).then(() => {
          cy.visit(`/events/${eventId}`);
          cy.get('.ed-card').should('be.visible');

          // The comment compose box should be visible (user is attending)
          cy.get('.ed-comment-compose__input').should('be.visible');

          // Intercept the comment POST
          cy.intercept('POST', `**/comments/event/${eventId}/message`).as(
            'postComment'
          );

          const testMessage = `Cypress test comment ${Date.now()}`;

          // Type and submit the comment
          cy.get('.ed-comment-compose__input').type(testMessage);
          cy.get('.ed-comment-compose__btn').click();

          // Wait for the API call and assert success
          cy.wait('@postComment').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            expect(interception.response.body).to.have.property(
              'success',
              true
            );
          });

          // The comment should appear in the comments list
          cy.get('.ed-comments__list').should('contain.text', testMessage);
        });
      });
    });

    // Feature #3, Scenario 2: Non-joined user sees locked comments
    it('should show the locked comments message to a non-joined user', () => {
      cy.then(() => {
        // Remove user from attendees first
        cy.request({
          method: 'PUT',
          url: `${API}/events/${eventId}/attendees/remove/${Cypress.env('userId')}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('accessToken')}`,
          },
        }).then(() => {
          cy.visit(`/events/${eventId}`);
          cy.get('.ed-card').should('be.visible');

          // The locked message should be visible
          cy.get('.ed-comments__locked').should('be.visible');
          cy.get('.ed-comments__locked').should(
            'contain.text',
            'Join the event to see and post comments'
          );

          // The comment input should NOT be visible
          cy.get('.ed-comment-compose__input').should('not.exist');
        });
      });
    });
  });
});
