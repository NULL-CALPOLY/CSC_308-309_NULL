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

// Typeahead search by name: GET /interests/search?q=...&limit=...
// Registered before /:id so the literal "search" segment isn't captured as an id.
router.get('/search', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const parsedLimit = parseInt(req.query.limit, 10);
  const limit = Number.isNaN(parsedLimit) ? 20 : parsedLimit;

  await interestServices
    .searchInterests(q, limit)
    .then((interests) => {
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

// Post a new interest. Dedupes by normalizedName: returns 201 when a new
// interest is created, or 200 with the existing doc when a duplicate is
// suggested (so user-submitted tags never create duplicates).
router.post('/', async (req, res) => {
  try {
    const existing = await interestServices.findInterestByNormalizedName(
      req.body?.name
    );
    const interest = await interestServices.addInterest(req.body);

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing
        ? 'Interest already exists.'
        : 'Interest registered successfully.',
      data: interest,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message || 'An unexpected error occurred.',
    });
  }
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
