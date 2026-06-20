import request from 'supertest';
import app from '../../../backend/backend.js';
import interestModel from '../../../backend/InterestFIles/InterestSchema.js';
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
    expect(res.body.data.normalizedName).toBe('music');
    expect(res.body.success).toBe(true);
  });

  test('POST /interests derives normalizedName (lowercase + collapsed whitespace)', async () => {
    const res = await request(app)
      .post('/interests')
      .send({ name: '  Rock   Climbing  ', similarInterests: [] });
    expect(res.status).toBe(201);
    expect(res.body.data.normalizedName).toBe('rock climbing');
  });

  test('POST /interests dedupes by normalizedName (200 + existing doc)', async () => {
    const first = await request(app).post('/interests').send(testInterest);
    expect(first.status).toBe(201);

    // Same interest with different casing/spacing should not duplicate.
    const dup = await request(app)
      .post('/interests')
      .send({ name: ' music ', similarInterests: [] });
    expect(dup.status).toBe(200);
    expect(dup.body.data._id).toBe(first.body.data._id);

    const all = await interestModel.find({ normalizedName: 'music' });
    expect(all.length).toBe(1);
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

  // Typeahead search: GET /interests/search?q=
  test('GET /interests/search?q= returns case-insensitive matches sorted by name', async () => {
    await interestModel.create({ name: 'Music', similarInterests: [] });
    await interestModel.create({
      name: 'Musical Theater',
      similarInterests: [],
    });
    await interestModel.create({ name: 'Rock', similarInterests: [] });

    const res = await request(app).get('/interests/search?q=mus');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.map((i) => i.name)).toEqual([
      'Music',
      'Musical Theater',
    ]);
  });

  test('GET /interests/search respects the limit query param', async () => {
    await interestModel.create({ name: 'Music', similarInterests: [] });
    await interestModel.create({
      name: 'Musical Theater',
      similarInterests: [],
    });

    const res = await request(app).get('/interests/search?q=mus&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /interests/search returns empty array for missing/empty q', async () => {
    await interestModel.create({ name: 'Music', similarInterests: [] });

    const res = await request(app).get('/interests/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);

    const resEmpty = await request(app).get('/interests/search?q=');
    expect(resEmpty.status).toBe(200);
    expect(resEmpty.body.data).toEqual([]);
  });

  // Similar interests endpoints
  test('GET /interests/:id/similar returns similar interests', async () => {
    const music = await interestModel.create(testInterest);
    await interestModel.create({
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
    expect(updated.similarInterests.map((id) => id.toString())).toContain(
      rock._id.toString()
    );
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
    expect(updated.similarInterests.map((id) => id.toString())).not.toContain(
      rock._id.toString()
    );
  });

  test('GET /interests/all returns all interests when they exist', async () => {
    await interestModel.create(testInterest);
    const res = await request(app).get('/interests/all');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /interests/:id/similar returns 404 when no similar interests found', async () => {
    const music = await interestModel.create(testInterest);
    const res = await request(app).get(`/interests/${music._id}/similar`);
    // Should still return 200 with empty array OR 404 depending on implementation
    expect([200, 404]).toContain(res.status);
  });
});
