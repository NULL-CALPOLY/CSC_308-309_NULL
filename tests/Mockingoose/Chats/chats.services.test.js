const mongoose = require('mongoose');
const mockingoose = require('mockingoose');

const chatModel = require('../../backend/Chat/ChatSchema.js');
const chatServices = require('../../backend/Chat/ChatServices.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Chat Services (Jest + Mockingoose)', () => {
  const dummyMessage = {
    _id: '507f191e810c19729de86031',
    sender: 'user123',
    receiver: 'user456',
    message: 'Hello!',
    timestamp: new Date(),
  };

  test('getAllChats returns chats', async () => {
    mockingoose(chatModel).toReturn([dummyMessage], 'find');
    const result = await chatServices.getAllChats();
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('Hello!');
  });

  test('addChatMessage successfully', async () => {
    const input = { sender: 'user456', receiver: 'user123', message: 'Hi!' };
    mockingoose(chatModel).toReturn(
      { ...input, _id: 'abc123', timestamp: new Date() },
      'save'
    );
    const result = await chatServices.addChatMessage(input);
    expect(result).toBeDefined();
    expect(result.message).toBe('Hi!');
  });

  test('findChatById returns a chat', async () => {
    mockingoose(chatModel).toReturn(dummyMessage, 'findOne');
    const result = await chatServices.findChatById(dummyMessage._id);
    expect(result.message).toBe('Hello!');
  });

  test('updateChat updates a message', async () => {
    const updated = { ...dummyMessage, message: 'Updated!' };
    mockingoose(chatModel).toReturn(updated, 'findOneAndUpdate');
    const result = await chatServices.updateChat(dummyMessage._id, {
      message: 'Updated!',
    });
    expect(result.message).toBe('Updated!');
  });

  test('deleteChat deletes a message', async () => {
    mockingoose(chatModel).toReturn(dummyMessage, 'findOneAndDelete');
    const result = await chatServices.deleteChat(dummyMessage._id);
    expect(result.message).toBe('Hello!');
  });
});
