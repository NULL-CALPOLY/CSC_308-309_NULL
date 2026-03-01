import express from 'express';

const router = express.Router();

// Small cache so we don't spam Nominatim
// key: normalized query, value: { ts, data }
const cache = new Map();
const CACHE_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 500;

// Best-effort: avoid keeping expired entries around forever
function getCached(q) {
  const cached = cache.get(q);
  if (!cached) return null;

  const age = Date.now() - cached.ts;
  if (age < CACHE_MS) return cached.data;

  // expired -> evict
  cache.delete(q);
  return null;
}

function setCached(q, data) {
  cache.set(q, { ts: Date.now(), data });

  // Simple cap to prevent unbounded growth (evict oldest inserted)
  if (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    // Only search when user types 3+ characters
    if (q.length < 3) return res.json([]);

    // Cache check
    const cached = getCached(q);
    if (cached) return res.json(cached);

    // Call Nominatim
    const url =
      'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      });

    const controller = new AbortController();
    const timeoutMs = Number(process.env.GEOCODE_TIMEOUT_MS || 3000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const nominatimRes = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Nominatim guidelines expect contact info (email or URL). Make configurable.
        'User-Agent':
          process.env.NOMINATIM_USER_AGENT ||
          'FINDR/1.0 (Team NULL; contact: teamnull@example.com)',
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    // ✅ DEBUG IMPROVEMENT: return provider status (403/429/etc) + log a snippet
    if (!nominatimRes.ok) {
      const bodyText = await nominatimRes.text().catch(() => '');
      console.error(
        'Nominatim error:',
        nominatimRes.status,
        bodyText.slice(0, 200)
      );

      return res.status(502).json({
        message: 'Geocoding provider error',
        status: nominatimRes.status,
      });
    }

    const data = await nominatimRes.json();

    // Save cache
    setCached(q, data);

    return res.json(data);
  } catch (err) {
    // AbortController timeout (provider slow/hung)
    if (err?.name === 'AbortError') {
      return res.status(504).json({ message: 'Geocoding provider timeout' });
    }

    console.error('Geocode error:', err);
    return res.status(500).json({ message: 'Server geocoding error' });
  }
});

export default router;
