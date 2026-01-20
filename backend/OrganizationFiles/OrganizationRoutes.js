import express from 'express';
import organizationServices from './OrganizationServices.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, organizations info is working');
});

// Get all organizations
router.get('/all', async (req, res) => {
  await organizationServices
    .getOrganizations()
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  await organizationServices
    .findOrganizationById(req.params.id)
    .then((organization) => {
      if (!organization)
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      else
        res.status(200).json({
          success: true,
          data: organization,
        });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Create new organization
router.post('/', async (req, res) => {
  await organizationServices
    .addOrganization(req.body)
    .then((organization) => {
      res.status(201).json({
        success: true,
        data: organization,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Delete organization
router.delete('/:id', async (req, res) => {
  await organizationServices
    .deleteOrganization(req.params.id)
    .then((deletedorganization) => {
      if (!deletedorganization)
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'Organization deleted successfully',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Update organization
router.put('/:id', async (req, res) => {
  await organizationServices
    .updateOrganization(req.params.id, req.body)
    .then((organization) => {
      if (!organization)
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      else
        res.status(200).json({
          success: true,
          data: organization,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by name
router.get('/search/name/:name', async (req, res) => {
  await organizationServices
    .findOrganizationByName(req.params.name)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that name',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by email
router.get('/search/email/:email', async (req, res) => {
  await organizationServices
    .findOrganizationByEmail(req.params.email)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that email',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by phone number
router.get('/search/phone/:phone', async (req, res) => {
  await organizationServices
    .findOrganizationByPhoneNumber(req.params.phone)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that phone number',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by inite only status
router.get('/search/invite/:invite', async (req, res) => {
  await organizationServices
    .findOrganizationByInviteOnly(req.params.invite)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found with that invite only status',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by member
router.get('/search/member/:userId', async (req, res) => {
  await organizationServices
    .findOrganizationByMember(req.params.userId)
    .then((organizations) => {
      if (!organizations || organizations.length === 0)
        res.status(404).json({
          success: false,
          message: 'No organizations found for this member',
        });
      else
        res.status(200).json({
          success: true,
          data: organizations,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add user to organization members
router.put('/:id/members/add/:userId', async (req, res) => {
  await organizationServices
    .addUserToMembers(req.params.id, req.params.userId)
    .then((organization) => {
      if (!organization)
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'User added to organization successfully',
          data: organization,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Remove user from organization members
router.put('/:id/members/remove/:userId', async (req, res) => {
  await organizationServices
    .removeUserFromMembers(req.params.id, req.params.userId)
    .then((organization) => {
      if (!organization)
        res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'User removed from organization successfully',
          data: organization,
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
