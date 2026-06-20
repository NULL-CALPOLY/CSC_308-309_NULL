import express from 'express';
import organizationServices from './OrganizationServices.js';
import {
  requireAuth,
  requireAdmin,
  requireSelf,
} from '../middleware/auth.js';
import User from '../UserFiles/UserSchema.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, organizations info is working');
});

// ── Public catalog: approved clubs only ──
router.get('/all', async (req, res) => {
  try {
    const organizations = await organizationServices.getApprovedOrganizations();
    res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Admin queue: clubs awaiting review (or any status via ?status=) ──
router.get('/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const organizations =
      await organizationServices.getOrganizationsByStatus(status);
    res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Clubs the current user owns/administers ──
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const organizations = await organizationServices.findOrganizationByAdmin(
      req.userId
    );
    res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  await organizationServices
    .findOrganizationById(req.params.id)
    .then((organization) => {
      if (!organization)
        res
          .status(404)
          .json({ success: false, message: 'Organization not found' });
      else res.status(200).json({ success: true, data: organization });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// ── Register a new club (starts pending, registrant = owner) ──
router.post('/', requireAuth, async (req, res) => {
  try {
    const organization = await organizationServices.createOrganization(
      req.body,
      req.userId
    );
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Admin: approve / reject ──
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const org = await organizationServices.approveOrganization(
      req.params.id,
      req.userId
    );
    if (!org)
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const org = await organizationServices.rejectOrganization(
      req.params.id,
      req.userId,
      req.body?.reason || ''
    );
    if (!org)
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Update an organization (org owner/admin only) ──
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const org = await organizationServices.findOrganizationById(req.params.id);
    if (!org)
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });
    if (!organizationServices.isOrgAdmin(org, req.userId))
      return res
        .status(403)
        .json({ success: false, message: 'Not an admin of this organization' });

    const updated = await organizationServices.updateOrganization(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Delete an organization (org owner/admin or site admin) ──
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const org = await organizationServices.findOrganizationById(req.params.id);
    if (!org)
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' });

    const requester = await User.findById(req.userId);
    const allowed =
      organizationServices.isOrgAdmin(org, req.userId) || requester?.isAdmin;
    if (!allowed)
      return res
        .status(403)
        .json({ success: false, message: 'Not allowed to delete this organization' });

    await organizationServices.deleteOrganization(req.params.id);
    res
      .status(200)
      .json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Error in the server: ${error}` });
  }
});

// ── Search ──
router.get('/search/name/:name', async (req, res) => {
  await organizationServices
    .findOrganizationByName(req.params.name)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that name',
        });
      else res.status(200).json({ success: true, data: organizations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

router.get('/search/email/:email', async (req, res) => {
  await organizationServices
    .findOrganizationByEmail(req.params.email)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that email',
        });
      else res.status(200).json({ success: true, data: organizations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

router.get('/search/phone/:phone', async (req, res) => {
  await organizationServices
    .findOrganizationByPhoneNumber(req.params.phone)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that phone number',
        });
      else res.status(200).json({ success: true, data: organizations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

router.get('/search/invite/:invite', async (req, res) => {
  await organizationServices
    .findOrganizationByInviteOnly(req.params.invite)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that invite only status',
        });
      else res.status(200).json({ success: true, data: organizations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

router.get('/search/member/:userId', async (req, res) => {
  await organizationServices
    .findOrganizationByMember(req.params.userId)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found for this member',
        });
      else res.status(200).json({ success: true, data: organizations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// ── Membership: join / leave (self only) ──
router.put(
  '/:id/members/add/:userId',
  requireAuth,
  requireSelf('userId'),
  async (req, res) => {
    try {
      const org = await organizationServices.findOrganizationById(
        req.params.id
      );
      if (!org)
        return res
          .status(404)
          .json({ success: false, message: 'Organization not found' });
      if (org.status !== 'approved')
        return res.status(403).json({
          success: false,
          message: 'This organization is not open for membership yet',
        });

      // student-only clubs require a verified student account.
      if (org.studentOnly) {
        const user = await User.findById(req.userId);
        if (!user?.isVerifiedStudent)
          return res.status(403).json({
            success: false,
            message:
              'This club is open to verified students only. Sign in with your school email to join.',
          });
      }

      const updated = await organizationServices.addUserToMembers(
        req.params.id,
        req.params.userId
      );
      res.status(200).json({
        success: true,
        message: 'User added to organization successfully',
        data: updated,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

router.put(
  '/:id/members/remove/:userId',
  requireAuth,
  requireSelf('userId'),
  async (req, res) => {
    try {
      const updated = await organizationServices.removeUserFromMembers(
        req.params.id,
        req.params.userId
      );
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: 'Organization not found' });
      res.status(200).json({
        success: true,
        message: 'User removed from organization successfully',
        data: updated,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    }
  }
);

export default router;
