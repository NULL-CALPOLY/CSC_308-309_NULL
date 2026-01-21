const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const interestsModel = require('../../backend/Interests/InterestsSchema.js');
const interestsServices = require('../../backend/Interests/InterestsServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Interests Services (Jest + Mockingoose)', () => {
  const dummyInterest = {
    _id: '507f191e810c19729de86001',
    name: 'Music',
    category: 'Hobby',
  };

  test('getAllInterests returns interests', async () => {
    mockingoose(interestsModel).toReturn([dummyInterest], 'find');
    const result = await interestsServices.getAllInterests();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Music');
  });

  test('addInterest successfully', async () => {
    const input = { name: 'Gaming', category: 'Hobby' };
    mockingoose(interestsModel).toReturn({ ...input, _id: 'abc123' }, 'save');
    const result = await interestsServices.addInterest(input);
    expect(result).toBeDefined();
    expect(result.name).toBe('Gaming');
  });

  test('findInterestById returns interest', async () => {
    mockingoose(interestsModel).toReturn(dummyInterest, 'findOne');
    const result = await interestsServices.findInterestById(dummyInterest._id);
    expect(result.name).toBe('Music');
  });

  test('updateInterest updates interest', async () => {
    const updated = { ...dummyInterest, category: 'Art' };
    mockingoose(interestsModel).toReturn(updated, 'findOneAndUpdate');
    const result = await interestsServices.updateInterest(dummyInterest._id, { category: 'Art' });
    expect(result.category).toBe('Art');
  });

  test('deleteInterest deletes interest', async () => {
    mockingoose(interestsModel).toReturn(dummyInterest, 'findOneAndDelete');
    const result = await interestsServices.deleteInterest(dummyInterest._id);
    expect(result.name).toBe('Music');
  });
});
