import interestServices from '../../../backend/InterestFIles/InterestServices.js';
import interestModel from '../../../backend/InterestFIles/InterestSchema.js';
import mongoose from 'mongoose';

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

describe('Interest Services', () => {
  test('should create a new interest', async () => {
    const interest = await interestServices.addInterest(testInterest);
    expect(interest.name).toBe('Music');

    const found = await interestModel.findById(interest._id);
    expect(found.name).toBe('Music');
  });

  test('should return all interests', async () => {
    await interestModel.create(testInterest);
    await interestModel.create(testInterest2);

    const interests = await interestServices.getInterests();
    expect(interests.length).toBe(2);
  });

  test('should return empty array when no interests exist', async () => {
    const interests = await interestServices.getInterests();
    expect(interests.length).toBe(0);
  });

  test('should find an interest by ID', async () => {
    const interest = await interestModel.create(testInterest);

    const found = await interestServices.findInterestById(interest._id);
    expect(found.name).toBe('Music');
  });

  test('should return null when finding nonexistent interest by ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const found = await interestServices.findInterestById(fakeId);
    expect(found).toBeNull();
  });

  test('should find interests by name (case insensitive)', async () => {
    await interestModel.create(testInterest);

    const results = await interestServices.findInterestByName('music');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Music');
  });

  test('should find interests by name with partial match', async () => {
    await interestModel.create(testInterest);

    const results = await interestServices.findInterestByName('mus');
    expect(results.length).toBe(1);
  });

  test('should return empty array when no interests match search name', async () => {
    const results = await interestServices.findInterestByName('NonExistent');
    expect(results.length).toBe(0);
  });

  test('should update an interest', async () => {
    const interest = await interestModel.create(testInterest);

    const updated = await interestServices.updateInterest(interest._id, {
      name: 'Updated Music',
    });
    expect(updated.name).toBe('Updated Music');
  });

  test('should return null when updating nonexistent interest', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const updated = await interestServices.updateInterest(fakeId, {
      name: 'Nope',
    });
    expect(updated).toBeNull();
  });

  test('should delete an interest', async () => {
    const interest = await interestModel.create(testInterest);

    const deleted = await interestServices.deleteInterest(interest._id);
    expect(deleted._id.toString()).toBe(interest._id.toString());

    const found = await interestModel.findById(interest._id);
    expect(found).toBeNull();
  });

  test('should return null when deleting nonexistent interest', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const deleted = await interestServices.deleteInterest(fakeId);
    expect(deleted).toBeNull();
  });

  test('should find interests by similar interests', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create({
      ...testInterest2,
      similarInterests: [music._id],
    });

    const results = await interestServices.findInterestBySimilarInterests(
      music._id
    );
    expect(results.length).toBeGreaterThan(0);
  });

  test('should add similar interest', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create(testInterest2);

    const updated = await interestServices.addInterestsToSimilarInterests(
      music._id,
      rock._id
    );
    expect(updated.similarInterests.map((id) => id.toString())).toContain(
      rock._id.toString()
    );
  });

  test('should not add duplicate similar interests', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create(testInterest2);

    await interestServices.addInterestsToSimilarInterests(music._id, rock._id);
    const updated = await interestServices.addInterestsToSimilarInterests(
      music._id,
      rock._id
    );

    const count = updated.similarInterests.filter(
      (id) => id.toString() === rock._id.toString()
    ).length;
    expect(count).toBe(1);
  });

  test('should remove similar interest', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create(testInterest2);

    // Add similar interest first
    await interestServices.addInterestsToSimilarInterests(music._id, rock._id);

    // Remove similar interest
    const updated = await interestServices.removeInterestsFromSimilarInterests(
      music._id,
      rock._id
    );
    expect(updated.similarInterests.map((id) => id.toString())).not.toContain(
      rock._id.toString()
    );
  });

  test('should handle removing nonexistent similar interest', async () => {
    const music = await interestModel.create(testInterest);
    const rock = await interestModel.create(testInterest2);
    const notAdded = new mongoose.Types.ObjectId();

    const updated = await interestServices.removeInterestsFromSimilarInterests(
      music._id,
      notAdded
    );
    expect(updated.similarInterests.length).toBe(0);
  });
});
