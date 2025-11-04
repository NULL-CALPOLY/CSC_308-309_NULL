import express from 'express';
import userServices from './UserServices.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Yes, this trash is working");
})

// Get all users
router.get('/users', async (req, res) => {
  await userServices
    .getUsers()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Get a user by ID
router.get('/users/:id', async (req, res) => {
  await userServices
    .findUserById(req.params.id)
    .then((user) => {
      if (user === undefined || user === null) {
        res.status(404).send('User not found');
      } else {
        res.json(user);
      }
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Post a new user
router.post('/users', async (req, res) => {
  await userServices
    .addUser(req.body)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  await userServices
    .deleteUser(req.params.id)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(404).send(`User not found: ${error}`);
    });
});

// Update a user
router.put('/users/:id', async (req, res) => {
  await userServices
    .updateUser(req.params.id, req.body)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

export default router;
