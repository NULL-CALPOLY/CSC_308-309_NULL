import request from 'supertest';
import app from '../../../backend/backend.js';

// Mock the cloudinary module to avoid real API calls
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    url: jest.fn(
      (publicId) => `https://res.cloudinary.com/demo/image/upload/${publicId}`
    ),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

describe('Cloudinary Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /image/:publicId', () => {
    it('returns 200 with imageUrl for a valid publicId', async () => {
      cloudinary.url.mockReturnValue(
        'https://res.cloudinary.com/demo/image/upload/sample'
      );
      const res = await request(app).get('/image/sample');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.publicId).toBe('sample');
      expect(res.body.imageUrl).toBeTruthy();
    });
  });

  describe('POST /image/upload', () => {
    it('returns 400 when no file is provided', async () => {
      const res = await request(app).post('/image/upload');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no file/i);
    });

    it('returns 201 when a file is uploaded successfully', async () => {
      // Mock cloudinary upload_stream to call callback with success result
      cloudinary.uploader.upload_stream.mockImplementation(
        (options, callback) => {
          const { Writable } = require('stream');
          const writable = new Writable({
            write(chunk, encoding, cb) {
              cb();
            },
          });
          writable.once('finish', () => {
            callback(null, {
              public_id: 'uploaded_id',
              secure_url:
                'https://res.cloudinary.com/demo/image/upload/uploaded_id',
            });
          });
          return writable;
        }
      );

      const res = await request(app)
        .post('/image/upload')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.publicId).toBe('uploaded_id');
    });
  });

  describe('PATCH /image/:publicId', () => {
    it('returns 400 when no file is provided for update', async () => {
      const res = await request(app).patch('/image/sample123');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no file/i);
    });

    it('returns 200 when image is updated successfully', async () => {
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      cloudinary.uploader.upload_stream.mockImplementation(
        (options, callback) => {
          const { Writable } = require('stream');
          const writable = new Writable({
            write(chunk, encoding, cb) {
              cb();
            },
          });
          writable.once('finish', () => {
            callback(null, {
              public_id: 'sample123',
              secure_url:
                'https://res.cloudinary.com/demo/image/upload/sample123',
            });
          });
          return writable;
        }
      );

      const res = await request(app)
        .patch('/image/sample123')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /image/:publicId', () => {
    it('returns 200 when image is successfully deleted', async () => {
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
      const res = await request(app).delete('/image/mypublicid');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted/i);
    });

    it('returns 404 when image is not found', async () => {
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'not found' });
      const res = await request(app).delete('/image/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 500 when cloudinary throws an error', async () => {
      cloudinary.uploader.destroy.mockRejectedValue(new Error('API error'));
      const res = await request(app).delete('/image/errpublicid');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
