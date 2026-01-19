import request from 'supertest';
import app from '../../backend/backend.js';
import interestModel from '../../backend/InterestFIles/InterestSchema.js';
import mongoose from 'mongoose';

// Sample interest for tests
const testInterest = {
  name: 'Music',
  similarInterests: [],
};

const testInterest2 = {
  name: 'Rock',
  similarInterests: [],
};

beforeEach(async () => {
  await interestModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Interest Routes', () => {
  test('GET /interests returns working message', async () => {
    const res = await request(app).get('/interests/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Yes, interest info is working');
  });

  test('GET /interests/all returns 404 when no interests exist', async () => {
    const res = await request(app).get('/interests/all');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /interests creates an interest', async () => {
    const res = await request(app).post('/interests').send(testInterest);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Music');
    expect(res.body.success).toBe(true);
  });

  test('GET /interests/:id returns the created interest', async () => {
    const created = await interestModel.create(testInterest);
    const res = await request(app).get(`/interests/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(testInterest.name);
    expect(res.body.success).toBe(true);
  });

  test('GET /interests/:id returns 404 for missing interest', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/interests/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('PUT /interests/:id updates the interest', async () => {
    const created = await interestModel.create(testInterest);
    const res = await request(app)
      .put(`/interests/${created._id}`)
      .send({ name: 'Updated Music' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Music');
    expect(res.body.success).toBe(true);
  });

  test('PUT /interests/:id returns 404 when updating nonexistent interest', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/interests/${fakeId}`)
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('DELETE /interests/:id deletes the interest', async () => {
    const created = await interestModel.create(testInterest);
    const res = await request(app).delete(`/interests/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const deleted = await interestModel.findById(created._id);
    expect(deleted).toBeNull();
  });

  test('DELETE /interests/:id returns 404 when interest does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/interests/${fakeId}`);
    expect(res.status).toBe(404);
  });

  // Search endpoints
  test('GET /interests/search/name/:name finds interest by name', async () => {
    await interestModel.create(testInterest);
    const res = await request(app).get('/interests/search/name/Music');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe('Music');
  });

  test('GET /interests/search/name/:name returns 404 when no matches found', async () => {
    const res = await request(app).get('/interests/search/name/NonExistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Similar interests endpoints
  test('GET /interests/:id/similar returns similar interests', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create({
      ...testInterest2,
      similarInterests: [music._id],
    });

    const res = await request(app).get(`/interests/${music._id}/similar`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /interests/:id/similar/add/:similarId adds similar interest', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create(testInterest2);

    const res = await request(app).post(
      `/interests/${music._id}/similar/add/${rock._id}`
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await interestModel.findById(music._id);
    expect(
      updated.similarInterests.map((id) => id.toString())
    ).toContain(rock._id.toString());
  });

  test('DELETE /interests/:id/similar/remove/:similarId removes similar interest', async () => {
    const music = await interestModel.create({
      ...testInterest,
      similarInterests: [],
    });
    const rock = await interestModel.create(testInterest2);

    // First add the similar interest
    await interestModel.findByIdAndUpdate(
      music._id,
      { $addToSet: { similarInterests: rock._id } },
      { new: true }
    );

    const res = await request(app).delete(
      `/interests/${music._id}/similar/remove/${rock._id}`
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await interestModel.findById(music._id);
    expect(
      updated.similarInterests.map((id) => id.toString())
    ).not.toContain(rock._id.toString());
  });
});
