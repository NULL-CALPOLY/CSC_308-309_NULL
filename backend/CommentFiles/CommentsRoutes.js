import express from 'express';
import commentsServices from './CommentsServices.js';

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.send('Comments service is working');
});

// Get comments for an event
router.get('/event/:eventId', async (req, res) => {
  await commentsServices
    .getCommentsByEvent(req.params.eventId)
    .then((comments) => {
      if (!comments)
        res.status(404).json({
          success: false,
          message: 'No comments found for this event',
        });
      else
        res.status(200).json({
          success: true,
          data: comments,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${error}`,
      });
    });
});

// Create comments thread for event
router.post('/event/:eventId', async (req, res) => {
  await commentsServices
    .createComments(req.params.eventId)
    .then((comments) => {
      res.status(201).json({
        success: true,
        data: comments,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${error}`,
      });
    });
});

// Add message to event comments
router.post('/event/:eventId/message', async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name and message are required',
    });
  }

  await commentsServices
    .addMessage(req.params.eventId, name, message)
    .then((comments) => {
      if (!comments)
        res.status(404).json({
          success: false,
          message: 'Comments thread not found',
        });
      else
        res.status(200).json({
          success: true,
          data: comments,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${error}`,
      });
    });
});

// Delete comments for an event
router.delete('/event/:eventId', async (req, res) => {
  await commentsServices
    .deleteCommentsByEvent(req.params.eventId)
    .then((deleted) => {
      if (!deleted)
        res.status(404).json({
          success: false,
          message: 'Comments not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'Comments deleted',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${error}`,
      });
    });
});

export default router;