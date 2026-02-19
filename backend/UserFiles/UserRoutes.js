import express from 'express';
import userServices from './UserServices.js';
import jwt from 'jsonwebtoken';

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
          message: 'No users found',
        });
      else res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

/*
 * Endpoint for USER LOGIN
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: 'Email and password required',
    });

  try {
    const result = await userServices.authenticateUser(email, password);
    if (!result)
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });

    const { user, accessToken, refreshToken } = result;

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // must be false on localhost
      sameSite: 'lax', // avoids cross-site cookie issues
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      userId: user._id,
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/*
 * Endpoint for USER REGISTRATION
 * Takes user data and password, creates new user in database
 */

router.post('/', async (req, res) => {
  try {
    const newUser = await userServices.addUser(req.body);

    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // store refresh token cookie (same as login)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
      token: accessToken,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

/*
 * Endpoint for DELETE USER
 */

router.delete('/:id', async (req, res) => {
  await userServices
    .deleteUser(req.params.id)
    .then((deletedUser) => {
      if (!deletedUser)
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'User deleted successfully',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

/*
 * Endpoint to REFRESH ACCESS TOKEN using refresh token
 */
router.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'No refresh token provided' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      userId: payload.id,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: `Invalid refresh token: ${err.message}`,
    });
  }
});

/*
 * Endpoint to LOGOUT and clear refresh token
 */
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// Update a user
router.put('/:id', async (req, res) => {
  await userServices
    .updateUser(req.params.id, req.body)
    .then((user) => {
      if (!user)
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      else
        res.status(200).json({
          success: true,
          data: user,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  await userServices
    .findUserById(req.params.id)
    .then((user) => {
      if (!user)
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      else
        res.status(200).json({
          success: true,
          data: user,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error.message}`,
      });
    });
});

// Search users by name
router.get('/search/name/:name', async (req, res) => {
  await userServices
    .findUserByName(req.params.name)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that name',
        });
      else
        res.status(200).json({
          success: true,
          data: users,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search users by email
router.get('/search/email/:email', async (req, res) => {
  await userServices
    .findUserByEmail(req.params.email)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that email',
        });
      else
        res.status(200).json({
          success: true,
          data: users,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
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
          res.status(404).json({
            success: false,
            message: 'No users found with that age',
          });
        } else {
          res.status(200).json({
            success: true,
            data: users,
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  } else {
    const dob = new Date(param);
    await userServices
      .findUserByDateOfBirth(dob)
      .then((users) => {
        if (!users || users.length === 0) {
          res.status(404).json({
            success: false,
            message: 'No users found with that date of birth',
          });
        } else {
          res.status(200).json({
            success: true,
            data: users,
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  }
});

// Search users by gender
router.get('/search/gender/:gender', async (req, res) => {
  await userServices
    .findUserByGender(req.params.gender)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that gender',
        });
      else
        res.status(200).json({
          success: true,
          data: users,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
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
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search users by radius
router.get('/search/radius/:radius', async (req, res) => {
  await userServices
    .findUserByRadius(req.params.radius)
    .then((users) => {
      if (!users || users.length === 0)
        res.status(404).json({
          success: false,
          message: 'No users found with that radius',
        });
      else
        res.status(200).json({
          success: true,
          data: users,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
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
      else
        res.status(200).json({
          success: true,
          data: users,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  await userServices
    .findUserById(req.params.id)
    .then((user) => {
      if (!user)
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      else
        res.status(200).json({
          success: true,
          data: user,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error.message}`,
      });
    });
});

export default router;
