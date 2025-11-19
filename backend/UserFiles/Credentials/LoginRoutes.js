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
    .then((login) => {
      res.json(login);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Get login by ID
router.get('/:id', async (req, res) => {
  await loginServices
    .findUserById(req.params.id)
    .then((login) => {
      if (login === undefined || login === null)
        res.status(404).send('Login not found');
      else res.json(login);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Confirm Login (compare email + password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password required');
  }

  try {
    const login = await loginServices.findLoginByEmail(email);

    if (!login) {
      return res.status(404).send('User not found');
    }
    if (login.password === password) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid password');
    }
  } catch (error) {
    res.status(500).send(`Error in the server: ${error}`);
  }
});

// Post new login credentials
router.post('/', async (req, res) => {
  await loginServices
    .addLogin(req.body)
    .then((login) => {
      res.status(201).json(login);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Delete login credentials
router.delete('/:id', async (req, res) => {
  await loginServices
    .deleteLogin(req.params.id)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(404).send(`Login not found: ${error}`);
    });
});

// Update login credentials
router.put('/:id', async (req, res) => {
  await loginServices
    .updateLogin(req.params.id, req.body)
    .then((login) => {
      res.json(login);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search login by email
router.get('/search/email/:email', async (req, res) => {
  await loginServices
    .findLoginByEmail(req.params.email)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No logins found with that email');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

// Search login by password
router.get('/search/password/:password', async (req, res) => {
  await loginServices
    .findLoginByPassword(req.params.password)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).send('No logins found with that password');
      else res.json(users);
    })
    .catch((error) => {
      res.status(500).send(`Error in the server: ${error}`);
    });
});

export default router;
