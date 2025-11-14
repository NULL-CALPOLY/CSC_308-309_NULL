import express from 'express';
import userServices from './UserServices.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, user info is working');
});

// Get all users
router.get('/all', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
  await userServices
    .updateUser(req.params.id, req.body)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search users by name
router.get('/search/name/:name', async (req, res) => {
  // localhost:3000/users/search/name/LEBRON%20JAMES (%20 for space)
  await userServices
    .findUserByName(req.params.name)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that name');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search users by email
router.get('/search/email/:email', async (req, res) => {
  await userServices
    .findUserByEmail(req.params.email)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that email');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search users by date of birth
router.get('/search/dateOfBirth/:dateOfBirth', async (req, res) => {
  await userServices
    .findUserByDateOfBirth(req.params.dateOfBirth)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that date of birth');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search users by gender
router.get('/search/gender/:gender', async (req, res) => {
  await userServices
    .findUserByGender(req.params.gender)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that gender');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

//Search users by home town
router.get('/search/homeTown/:homeTown', async (req, res) => {
  await userServices
    .findUserByHomeTown(req.params.homeTown)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that home town');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});


// Search users by interests
router.get('/search/interests/:interests', async (req, res) => {
  // localhost:3000/users/search/interests/reading,coding (this is reading or coding, not and)
  await userServices
    .findUserByInterests(req.params.interests.split(',').map((i) => i.trim()))
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No users found with that interest(s)');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});


export default router;
