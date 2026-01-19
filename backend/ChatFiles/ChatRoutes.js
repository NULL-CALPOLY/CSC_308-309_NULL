import express from 'express';
import chatServices from './ChatServices.js';

const router = express.Router();

// Get all chats
router.get('/all', async (req, res) => {
  await chatServices
    .getChats()
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add a new chat
router.post('/', async (req, res) => {
  await chatServices
    .addChat(req.body)
    .then((chat) => {
      res.status(201).json({
        success: true,
        data: chat,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get chat by ID
router.get('/:id', async (req, res) => {
  await chatServices
    .findChatById(req.params.id)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Update chat by ID
router.put('/:id', async (req, res) => {
  await chatServices
    .updateChat(req.params.id, req.body)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Delete chat by ID
router.delete('/:id', async (req, res) => {
  await chatServices
    .deleteChat(req.params.id)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'Chat deleted successfully',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Find chats by group name
router.get('/search/name/:name', async (req, res) => {
  await chatServices
    .findChatByName(req.params.name)
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found with that name',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Find chats by city
router.get('/search/city/:city', async (req, res) => {
  await chatServices
    .findChatsByCity(req.params.city)
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found in that city',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Find chats by user ID
router.get('/search/user/:userId', async (req, res) => {
  await chatServices
    .findChatsByUserID(req.params.userId)
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found for this user',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Find chats by interests
router.get('/search/interests/:interests', async (req, res) => {
  const interests = req.params.interests.split(',').map((i) => i.trim());
  await chatServices
    .findChatsByInterests(interests)
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found for these interests',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Find chats by event
router.get('/search/event/:eventId', async (req, res) => {
  await chatServices
    .findChatsByEvent(req.params.eventId)
    .then((chats) => {
      if (!chats || chats.length === 0)
        res.status(404).json({
          success: false,
          message: 'No chats found for this event',
        });
      else
        res.status(200).json({
          success: true,
          data: chats,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add user to chat
router.put('/:id/users/add/:userId', async (req, res) => {
  await chatServices
    .addUserToChat(req.params.id, req.params.userId)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Remove user from chat
router.put('/:id/users/remove/:userId', async (req, res) => {
  await chatServices
    .removeUserFromChat(req.params.id, req.params.userId)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add event to chat
router.put('/:id/events/add/:eventId', async (req, res) => {
  await chatServices
    .addEventToChat(req.params.id, req.params.eventId)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Remove event from chat
router.put('/:id/events/remove/:eventId', async (req, res) => {
  await chatServices
    .removeEventFromChat(req.params.id, req.params.eventId)
    .then((chat) => {
      if (!chat)
        res.status(404).json({
          success: false,
          message: 'Chat not found',
        });
      else
        res.status(200).json({
          success: true,
          data: chat,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

export default router;
