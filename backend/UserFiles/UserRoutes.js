import express from 'express';
import userServices from './UserServices.js';
import jwt from 'jsonwebtoken';
import { requireAuth, requireSelf, optionalAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { isAdminEmail } from '../utils/adminEmail.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, user info is working');
});

// Get all users (auth required — avoid dumping every user's PII anonymously)
router.get('/all', requireAuth, async (req, res) => {
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
router.post('/login', authLimiter, async (req, res) => {
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

router.post('/', authLimiter, async (req, res) => {
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

router.delete('/:id', requireAuth, requireSelf('id'), async (req, res) => {
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
  // 1. Destroy the session in the Database (MongoStore)
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to destroy session',
      });
    }

    // 2. Clear all sensitive cookies inside the success callback
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    // Clear the session ID cookie (use your custom name if you set one)
    res.clearCookie('connect.sid', cookieOptions);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', cookieOptions);

    // 3. Send the final response
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });
});

// Update a user (self only)
router.put('/:id', requireAuth, requireSelf('id'), async (req, res) => {
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

// Get the currently authenticated user. Must be declared before '/:id' so
// '/me' isn't captured as an id param.
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await userServices.findUserById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // Keep isAdmin in sync with the ADMIN_EMAILS config on every profile fetch,
    // so admins don't need to log out and back in after their email is added.
    const shouldBeAdmin = isAdminEmail(user.email);
    if (user.isAdmin !== shouldBeAdmin) {
      user.isAdmin = shouldBeAdmin;
      await user.save();
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in the server: ${error.message}`,
    });
  }
});

// Get a user's PUBLIC profile by ID. Unauthenticated and intentionally
// projection-limited (no email/phone/dob/gender/location) — used by the public
// profile page and event cards that show a host's name. For the logged-in
// user's own full record, use GET /me (requireAuth).
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    // A blocked viewer can't see the profile of someone who blocked them.
    if (
      req.userId &&
      req.userId !== req.params.id &&
      (await userServices.hasBlocked(req.params.id, req.userId))
    ) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await userServices.findPublicProfileById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in the server: ${error.message}`,
    });
  }
});

// ── Block / unblock another user (self only) ──
router.put(
  '/:id/block/:targetId',
  requireAuth,
  requireSelf('id'),
  async (req, res) => {
    if (req.params.id === req.params.targetId)
      return res
        .status(400)
        .json({ success: false, message: 'You cannot block yourself' });
    try {
      const updated = await userServices.blockUser(
        req.params.id,
        req.params.targetId
      );
      res.status(200).json({
        success: true,
        message: 'User blocked',
        data: { blockedUsers: updated?.blockedUsers || [] },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

router.put(
  '/:id/unblock/:targetId',
  requireAuth,
  requireSelf('id'),
  async (req, res) => {
    try {
      const updated = await userServices.unblockUser(
        req.params.id,
        req.params.targetId
      );
      res.status(200).json({
        success: true,
        message: 'User unblocked',
        data: { blockedUsers: updated?.blockedUsers || [] },
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

// List the ids the current user has blocked.
router.get(
  '/:id/blocked',
  requireAuth,
  requireSelf('id'),
  async (req, res) => {
    try {
      const blocked = await userServices.getBlockedUsers(req.params.id);
      res.status(200).json({ success: true, data: blocked });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

// Update notification preferences (self only)
router.patch(
  '/:id/notifications',
  requireAuth,
  requireSelf('id'),
  async (req, res) => {
    const { emailNotifications } = req.body;
    if (typeof emailNotifications !== 'boolean')
      return res.status(400).json({ success: false, message: 'emailNotifications must be a boolean' });
    try {
      const user = await userServices.findUserById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.emailNotifications = emailNotifications;
      await user.save();
      res.status(200).json({ success: true, data: { emailNotifications } });
    } catch (error) {
      res.status(500).json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

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

export default router;
