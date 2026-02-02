import express from 'express';

const router = express.Router();

// Small cache so we don't spam Nominatim
const cache = new Map(); // key: query, value: { ts, data }
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    // Only search when user types 3+ characters
    if (q.length < 3) return res.json([]);

    // Cache check
    const cached = cache.get(q);
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return res.json(cached.data);
    }

    // Call Nominatim
    const url =
      'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      });

    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'FINDR/1.0 (Team NULL)',
        Accept: 'application/json',
      },
    });

    if (!nominatimRes.ok) {
      return res.status(502).json({ message: 'Geocoding provider error' });
    }

    const data = await nominatimRes.json();

    // Save cache
    cache.set(q, { ts: Date.now(), data });

    return res.json(data);
  } catch (err) {
    console.error('Geocode error:', err);
    return res.status(500).json({ message: 'Server geocoding error' });
  }
});

export default router;
