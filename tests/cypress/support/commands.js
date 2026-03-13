// Custom command: programmatically log in via the API and store
// the access token + userId so tests can reuse them.
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/login`,
    body: { email, password },
    // include cookies so the HttpOnly refreshToken cookie is set
    withCredentials: true,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('accessToken');

    // Store token and userId as Cypress aliases for use in tests
    Cypress.env('accessToken', response.body.accessToken);
    Cypress.env('userId', response.body.userId);
  });
});
