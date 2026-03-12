import commentsServices from '../../../backend/CommentFiles/CommentsServices.js';
import commentsModel from '../../../backend/CommentFiles/CommentsSchema.js';
import '../../../backend/UserFiles/UserSchema.js'; // register User model for .populate()
import mongoose from 'mongoose';

const testEventId = new mongoose.Types.ObjectId();
const testUserId = new mongoose.Types.ObjectId();

beforeEach(async () => {
  await commentsModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Comments Services', () => {
  test('should create a new comments thread', async () => {
    const comments = await commentsServices.createComments(testEventId);
    expect(comments.eventId.toString()).toBe(testEventId.toString());
    expect(comments.messages).toHaveLength(0);

    const found = await commentsModel.findOne({ eventId: testEventId });
    expect(found).not.toBeNull();
  });

  test('should get comments by event ID', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const comments = await commentsServices.getCommentsByEvent(testEventId);
    expect(comments).not.toBeNull();
    expect(comments.eventId.toString()).toBe(testEventId.toString());
  });

  test('should return null when no comments thread exists', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const comments = await commentsServices.getCommentsByEvent(fakeEventId);
    expect(comments).toBeNull();
  });

  test('should add a message to a comments thread', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const updated = await commentsServices.addMessage(
      testEventId,
      'Test User',
      'Hello, world!',
      null,
      testUserId
    );

    expect(updated.messages).toHaveLength(1);
    expect(updated.messages[0].name).toBe('Test User');
    expect(updated.messages[0].message).toBe('Hello, world!');
  });

  test('should add message with avatar', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const updated = await commentsServices.addMessage(
      testEventId,
      'Avatar User',
      'Message with avatar',
      'https://example.com/avatar.jpg',
      testUserId
    );

    expect(updated.messages[0].avatar).toBe('https://example.com/avatar.jpg');
  });

  test('should add anonymous message (no userId)', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const updated = await commentsServices.addMessage(
      testEventId,
      'Anonymous',
      'Anonymous comment',
      null,
      null
    );

    expect(updated.messages[0].name).toBe('Anonymous');
    expect(updated.messages[0].userId).toBeNull();
  });

  test('should return null when adding message to non-existent thread', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const result = await commentsServices.addMessage(
      fakeEventId,
      'User',
      'Message',
      null,
      null
    );
    expect(result).toBeNull();
  });

  test('should delete comments by event ID', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    const deleted = await commentsServices.deleteCommentsByEvent(testEventId);
    expect(deleted).not.toBeNull();
    expect(deleted.eventId.toString()).toBe(testEventId.toString());

    const shouldBeGone = await commentsModel.findOne({ eventId: testEventId });
    expect(shouldBeGone).toBeNull();
  });

  test('should return null when deleting non-existent comments', async () => {
    const fakeEventId = new mongoose.Types.ObjectId();
    const result = await commentsServices.deleteCommentsByEvent(fakeEventId);
    expect(result).toBeNull();
  });

  test('should accumulate multiple messages', async () => {
    await commentsModel.create({ eventId: testEventId, messages: [] });

    await commentsServices.addMessage(
      testEventId,
      'User1',
      'First',
      null,
      null
    );
    await commentsServices.addMessage(
      testEventId,
      'User2',
      'Second',
      null,
      null
    );
    const result = await commentsServices.addMessage(
      testEventId,
      'User3',
      'Third',
      null,
      null
    );

    expect(result.messages).toHaveLength(3);
    expect(result.messages.map((m) => m.name)).toEqual([
      'User1',
      'User2',
      'User3',
    ]);
  });
});
