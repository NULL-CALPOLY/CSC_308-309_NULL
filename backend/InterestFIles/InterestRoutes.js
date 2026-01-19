import express from 'express';
import interestServices from './InterestServices.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, interest info is working');
});

// Get all interests
router.get('/all', async (req, res) => {
  await interestServices
    .getInterests()
    .then((interests) => {
      if (!interests || interests.length === 0)
        res.status(404).json({
          success: false,
          message: 'No interests found',
        });
      else res.status(200).json(interests);
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get an interest by ID
router.get('/:id', async (req, res) => {
  await interestServices
    .findInterestById(req.params.id)
    .then((interest) => {
      if (!interest)
        res.status(404).json({
          success: false,
          message: 'Interest not found',
        });
      else
        res.status(200).json({
          success: true,
          data: interest,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error.message}`,
      });
    });
});

// Post a new interest
router.post('/', async (req, res) => {
  await interestServices
    .addInterest(req.body)
    .then((interest) => {
      res.status(201).json({
        success: true,
        message: 'Interest registered successfully.',
        data: interest,
      });
    })
    .catch((error) => {
      res.status(error.status || 400).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
      });
    });
});

// Delete an interest
router.delete('/:id', async (req, res) => {
  await interestServices
    .deleteInterest(req.params.id)
    .then((deletedInterest) => {
      if (!deletedInterest)
        res.status(404).json({
          success: false,
          message: 'Interest not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'Interest deleted successfully',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Update an interest
router.put('/:id', async (req, res) => {
  await interestServices
    .updateInterest(req.params.id, req.body)
    .then((interest) => {
      if (!interest)
        res.status(404).json({
          success: false,
          message: 'Interest not found',
        });
      else
        res.status(200).json({
          success: true,
          data: interest,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search interests by name
router.get('/search/name/:name', async (req, res) => {
  await interestServices
    .findInterestByName(req.params.name)
    .then((interests) => {
      if (!interests || interests.length === 0)
        res.status(404).json({
          success: false,
          message: 'No interests found with that name',
        });
      else
        res.status(200).json({
          success: true,
          data: interests,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get similar interests for a specific interest
router.get('/:id/similar', async (req, res) => {
  await interestServices
    .findInterestBySimilarInterests(req.params.id)
    .then((interests) => {
      if (!interests || interests.length === 0)
        res.status(404).json({
          success: false,
          message: 'No similar interests found',
        });
      else
        res.status(200).json({
          success: true,
          data: interests,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add a similar interest
router.post('/:id/similar/add/:similarId', async (req, res) => {
  await interestServices
    .addInterestsToSimilarInterests(req.params.id, req.params.similarId)
    .then((interest) => {
      res.status(200).json({
        success: true,
        message: 'Similar interest added successfully',
        data: interest,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Remove a similar interest
router.delete('/:id/similar/remove/:similarId', async (req, res) => {
  await interestServices
    .removeInterestsFromSimilarInterests(req.params.id, req.params.similarId)
    .then((interest) => {
      res.status(200).json({
        success: true,
        message: 'Similar interest removed successfully',
        data: interest,
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
