const request = require('supertest');
const app = require('../../backend/backend.js');
const mockingoose = require('mockingoose');
const interestsModel = require('../../backend/Interests/InterestsSchema.js');

const dummyInterest = {
  _id: '507f191e810c19729de86001',
  name: 'Music',
  category: 'Hobby',
};

beforeEach(() => {
  mockingoose.resetAll();
});

describe('Interests Routes (mocked)', () => {
  test('GET /interests returns all interests', async () => {
    mockingoose(interestsModel).toReturn([dummyInterest], 'find');
    const res = await request(app).get('/interests');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Music');
  });

  test('POST /interests creates interest', async () => {
    const newInterest = { name: 'Gaming', category: 'Hobby' };
    mockingoose(interestsModel).toReturn(
      { ...newInterest, _id: 'abc123' },
      'save'
    );

    const res = await request(app).post('/interests').send(newInterest);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Gaming');
  });

  test('GET /interests/:id returns interest by ID', async () => {
    mockingoose(interestsModel).toReturn(dummyInterest, 'findOne');
    const res = await request(app).get(`/interests/${dummyInterest._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Music');
  });

  test('PUT /interests/:id updates interest', async () => {
    const updated = { ...dummyInterest, category: 'Art' };
    mockingoose(interestsModel).toReturn(updated, 'findOneAndUpdate');
    const res = await request(app)
      .put(`/interests/${dummyInterest._id}`)
      .send({ category: 'Art' });
    expect(res.status).toBe(200);
    expect(res.body.data.category).toBe('Art');
  });

  test('DELETE /interests/:id deletes interest', async () => {
    mockingoose(interestsModel).toReturn(dummyInterest, 'findOneAndDelete');
    const res = await request(app).delete(`/interests/${dummyInterest._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Music');
  });
});
