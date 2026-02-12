import express from 'express';
import loginServices from './LoginServices.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, user credentials are working');
});

// Get all login credentials
router.get('/all', async (req, res) => {
  await loginServices
    .getLogins()
    .then((logins) => {
      if (!logins || logins.length === 0) {
        res.status(404).json({ success: false, message: 'No logins found' });
      } else {
        res.status(200).json({ success: true, data: logins });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Get login by ID
router.get('/:id', async (req, res) => {
  await loginServices
    .findUserById(req.params.id)
    .then((login) => {
      if (!login) {
        res.status(404).json({ success: false, message: 'Login not found' });
      } else {
        res.status(200).json({ success: true, data: login });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Confirm Login (compare email + password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Email and password required' });

  try {
    const user = await loginServices.authenticate(email, password);

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });

    res
      .status(200)
      .json({ success: true, message: 'Login successful', userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Post new login credentials
router.post('/', async (req, res) => {
  await loginServices
    .addLogin(req.body)
    .then((login) => {
      res.status(201).json({ success: true, data: login });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Delete login credentials
router.delete('/:id', async (req, res) => {
  await loginServices
    .deleteLogin(req.params.id)
    .then((deletedLogin) => {
      if (!deletedLogin) {
        res.status(404).json({ success: false, message: 'Login not found' });
      } else {
        res
          .status(200)
          .json({ success: true, message: 'Login deleted successfully' });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Update login credentials
router.put('/:id', async (req, res) => {
  await loginServices
    .updateLogin(req.params.id, req.body)
    .then((login) => {
      if (!login) {
        res.status(404).json({ success: false, message: 'Login not found' });
      } else {
        res.status(200).json({ success: true, data: login });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search login by email
router.get('/search/email/:email', async (req, res) => {
  await loginServices
    .findLoginByEmail(req.params.email)
    .then((users) => {
      if (!users || users.length === 0) {
        res
          .status(404)
          .json({ success: false, message: 'No logins found with that email' });
      } else {
        res.status(200).json({ success: true, data: users });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

export default router;
