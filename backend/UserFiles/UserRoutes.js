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
      if (!users || users.length === 0)
        res.status(404).json({ 
          success: false, 
          message: 'No users found' 
        });
      else res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({ 
        success: false, 
        message: `Error in the server: ${error}` 
      });
    });
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  await userServices
    .findUserById(req.params.id)
    .then((user) => {
      if (!user)
        res.status(404).json({ success: false, message: 'User not found' });
      else res.status(200).json({ success: true, data: user });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error.message}`,
      });
    });
});

// Post a new user
router.post("/", async (req, res) => {
  await userServices
    .addUser(req.body)
    .then((user) => {
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: user,
      });
    })
    .catch((error) => {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || "An unexpected error occurred.",
      });
    });
});


// Delete a user
router.delete('/:id', async (req, res) => {
  await userServices
    .deleteUser(req.params.id)
    .then((deletedUser) => {
      if (!deletedUser)
        res.status(404).json({ success: false, message: 'User not found' });
      else
        res
          .status(200)
          .json({ success: true, message: 'User deleted successfully' });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Update a user
router.put('/:id', async (req, res) => {
  await userServices
    .updateUser(req.params.id, req.body)
    .then((user) => {
      if (!user)
        res.status(404).json({ success: false, message: 'User not found' });
      else res.status(200).json({ success: true, data: user });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by name
router.get('/search/name/:name', async (req, res) => {
  await userServices
    .findUserByName(req.params.name)
    .then((users) => {
      if (!users || users.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No users found with that name' });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by email
router.get('/search/email/:email', async (req, res) => {
  await userServices
    .findUserByEmail(req.params.email)
    .then((users) => {
      if (!users || users.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No users found with that email' });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by date of birth
router.get('/search/dob/:dob', async (req, res) => {
  const param = req.params.dob;

  // If param is all digits, treat as age; otherwise treat as a date string
  if (/^\d+$/.test(param)) {
    const age = parseInt(param, 10);
    await userServices
      .findUserByAge(age)
      .then((users) => {
        if (!users || users.length === 0) {
          res.status(404).json({ success: false, message: 'No users found with that age' });
        } else {
          res.status(200).json({ success: true, data: users });
        }
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: `Error in the server: ${error}` });
      });
  } else {
    const dob = new Date(param);
    await userServices
      .findUserByDateOfBirth(dob)
      .then((users) => {
        if (!users || users.length === 0) {
          res.status(404).json({ success: false, message: 'No users found with that date of birth' });
        } else {
          res.status(200).json({ success: true, data: users });
        }
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: `Error in the server: ${error}` });
      });
  }
});

// Search users by gender
router.get('/search/gender/:gender', async (req, res) => {
  await userServices
    .findUserByGender(req.params.gender)
    .then((users) => {
      if (!users || users.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No users found with that gender' });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by interests
router.get('/search/interests/:interests', async (req, res) => {
  await userServices
    .findUserByInterests(req.params.interests.split(',').map((i) => i.trim()))
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that interest(s)',
        });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by radius
router.get('/search/radius/:radius', async (req, res) => {
  await userServices
    .findUserByRadius(req.params.radius)
    .then((users) => {
      if (!users || users.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No users found with that radius' });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search users by location
router.get('/search/location/:location', async (req, res) => {
  const userLocation = req.params.location
    .split(',')
    .map((i) => parseFloat(i.trim()));
  await userServices
    .findUserByLocation(userLocation[0], userLocation[1], userLocation[2])
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that location',
        });
      else res.status(200).json({ success: true, data: users });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

export default router;
