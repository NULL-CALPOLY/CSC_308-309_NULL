import express from 'express';
import eventServices from './EventServices.js';
import { requireAuth, optionalAuth, requireSelf } from '../middleware/auth.js';

const router = express.Router();

// Per-user daily event creation cap (anti-spam). Disabled under tests.
const DAILY_EVENT_LIMIT = 2;

router.get('/', (req, res) => {
  res.send('Yes, events info is working');
});

// Authorization middleware: only the event's host may modify it. Runs after
// requireAuth (needs req.userId).
async function requireEventOwner(req, res, next) {
  try {
    const owner = await eventServices.getEventOwner(req.params.id);
    if (!owner)
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    if (String(owner.host) !== req.userId)
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to modify this event',
      });
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in the server: ${error}`,
    });
  }
}

// Get all events
router.get('/all', async (req, res) => {
  await eventServices
    .getEvents()
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Gets all future events
router.get('/upcoming', async (req, res) => {
  await eventServices
    .findUpcomingEvent()
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Get upcoming events near a point (indexed geo query), nearest first.
// Query params: lng, lat (required), radius in meters (optional, default ~10mi).
router.get('/nearby', optionalAuth, async (req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const radius = parseFloat(req.query.radius);

  if (Number.isNaN(lng) || Number.isNaN(lat)) {
    return res.status(400).json({
      success: false,
      message: 'lng and lat query params are required',
    });
  }

  const maxDistance = Number.isNaN(radius) ? 16093 : radius; // ~10 miles default

  try {
    const events = await eventServices.findNearbyEvents(lng, lat, maxDistance);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in the server: ${error}`,
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  await eventServices
    .findEventById(req.params.id)
    .then((event) => {
      if (!event)
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      else
        res.status(200).json({
          success: true,
          data: event,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Create new event (auth required). Host is taken from the token, never the
// body, and a per-user daily creation cap guards against spam.
router.post('/', requireAuth, async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayCount = await eventServices.countEventsByHostSince(
        req.userId,
        startOfDay
      );
      if (todayCount >= DAILY_EVENT_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Daily event creation limit reached (${DAILY_EVENT_LIMIT} per day).`,
        });
      }
    }

    const event = await eventServices.addEvent({
      ...req.body,
      host: req.userId,
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in the server: ${error}`,
    });
  }
});

// Delete event (host only)
router.delete('/:id', requireAuth, requireEventOwner, async (req, res) => {
  await eventServices
    .deleteEvent(req.params.id)
    .then((deletedEvent) => {
      if (!deletedEvent)
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      else
        res.status(200).json({
          success: true,
          message: 'Event deleted successfully',
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Update event (host only)
router.put('/:id', requireAuth, requireEventOwner, async (req, res) => {
  await eventServices
    .updateEvent(req.params.id, req.body)
    .then((event) => {
      if (!event)
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      else
        res.status(200).json({
          success: true,
          data: event,
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
  await eventServices
    .findEventByName(req.params.name)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found with that name',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by description keyword
router.get('/search/description/:keyword', async (req, res) => {
  await eventServices
    .findEventByDescription(req.params.keyword)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No matching events found',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by mapComponent
router.get('/search/map/:mapComponent', async (req, res) => {
  await eventServices
    .findEventByMapComponent(req.params.mapComponent)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found for this map component',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by host
router.get('/search/host/:hostId', async (req, res) => {
  await eventServices
    .findEventByHost(req.params.hostId)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found for this host',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by attendee
router.get('/search/attendee/:userId', async (req, res) => {
  await eventServices
    .findEventByAttendee(req.params.userId)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found with that attendee',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by interests
router.get('/search/interests/:interests', async (req, res) => {
  const interests = req.params.interests.split(',').map((i) => i.trim());

  await eventServices
    .findEventByInterests(interests)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found with those interests',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by location
router.get('/search/location/:location', async (req, res) => {
  const loc = req.params.location.split(',').map((i) => parseFloat(i.trim()));
  const [latitude, longitude, radius] = loc;

  await eventServices
    .findEventByLocation(latitude, longitude, radius)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events found at that location',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Search by start time
router.get('/search/start/:start', async (req, res) => {
  const start = new Date(req.params.start);

  await eventServices
    .findEventByStart(start)
    .then((events) => {
      if (!events.length)
        res.status(404).json({
          success: false,
          message: 'No events found with that start time',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${err}`,
      });
    });
});

// Search by end time
router.get('/search/end/:end', async (req, res) => {
  const end = new Date(req.params.end);

  await eventServices
    .findEventByEnd(end)
    .then((events) => {
      if (!events.length)
        res.status(404).json({
          success: false,
          message: 'No events found with that end time',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${err}`,
      });
    });
});

// Search events between start and end
router.get('/search/time-range/:start/:end', async (req, res) => {
  const start = new Date(req.params.start);
  const end = new Date(req.params.end);

  await eventServices
    .findEventsBetween(start, end)
    .then((events) => {
      if (!events.length)
        res.status(404).json({
          success: false,
          message: 'No events found in that time range',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server error: ${err}`,
      });
    });
});

// Search events where user is blocked
router.get('/search/blocked/:userId', async (req, res) => {
  await eventServices
    .findEventsBlockingUser(req.params.userId)
    .then((events) => {
      if (!events || events.length === 0)
        res.status(404).json({
          success: false,
          message: 'No events block this user',
        });
      else
        res.status(200).json({
          success: true,
          data: events,
        });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: `Error in the server: ${error}`,
      });
    });
});

// Add user to attendees (you can only RSVP yourself)
router.put(
  '/:id/attendees/add/:userId',
  requireAuth,
  requireSelf('userId'),
  async (req, res) => {
    await eventServices
      .addUserToAttendees(req.params.id, req.params.userId)
      .then((event) => {
        if (!event)
          res.status(404).json({
            success: false,
            message: 'Event not found',
          });
        else
          res.status(200).json({
            success: true,
            data: event,
          });
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  }
);

// Remove user from attendees (you can only un-RSVP yourself)
router.put(
  '/:id/attendees/remove/:userId',
  requireAuth,
  requireSelf('userId'),
  async (req, res) => {
    await eventServices
      .removeUserFromAttendees(req.params.id, req.params.userId)
      .then((event) => {
        if (!event)
          res.status(404).json({
            success: false,
            message: 'Event not found',
          });
        else
          res.status(200).json({
            success: true,
            data: event,
          });
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  }
);

// Add user to blocked users (host only)
router.put(
  '/:id/blocked/add/:userId',
  requireAuth,
  requireEventOwner,
  async (req, res) => {
    await eventServices
      .addUserToBlocked(req.params.id, req.params.userId)
      .then((event) => {
        if (!event)
          res.status(404).json({
            success: false,
            message: 'Event not found',
          });
        else
          res.status(200).json({
            success: true,
            data: event,
          });
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  }
);

// Remove user from blocked users (host only)
router.put(
  '/:id/blocked/remove/:userId',
  requireAuth,
  requireEventOwner,
  async (req, res) => {
    await eventServices
      .removeUserFromBlocked(req.params.id, req.params.userId)
      .then((event) => {
        if (!event)
          res.status(404).json({
            success: false,
            message: 'Event not found',
          });
        else
          res.status(200).json({
            success: true,
            data: event,
          });
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: `Error in the server: ${error}`,
        });
      });
  }
);

export default router;
