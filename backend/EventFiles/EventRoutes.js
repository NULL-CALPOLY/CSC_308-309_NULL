import express from 'express';
import eventServices from './EventServices.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Yes, events info is working');
});
// Get all events
router.get('/all', async (req, res) => {
  await eventServices
    .getEvents()
    .then((events) => {
      res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Get event by ID
router.get('/:id', async (req, res) => {
  await eventServices
    .findEventById(req.params.id)
    .then((event) => {
      if (!event)
        res.status(404).json({ success: false, message: 'Event not found' });
      else res.status(200).json({ success: true, data: event });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Create new event
router.post('/', async (req, res) => {
  await eventServices
    .addEvent(req.body)
    .then((event) => {
      res.status(201).json({ success: true, data: event });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Delete event
router.delete('/:id', async (req, res) => {
  await eventServices
    .deleteEvent(req.params.id)
    .then((deletedEvent) => {
      if (!deletedEvent)
        res.status(404).json({ success: false, message: 'Event not found' });
      else
        res
          .status(200)
          .json({ success: true, message: 'Event deleted successfully' });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Update event
router.put('/:id', async (req, res) => {
  await eventServices
    .updateEvent(req.params.id, req.body)
    .then((event) => {
      if (!event)
        res.status(404).json({ success: false, message: 'Event not found' });
      else res.status(200).json({ success: true, data: event });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by name
router.get('/search/name/:name', async (req, res) => {
  await eventServices
    .findEventByName(req.params.name)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No events found with that name' });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by description keyword
router.get('/search/description/:keyword', async (req, res) => {
  await eventServices
    .findEventByDescription(req.params.keyword)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No matching events found' });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by mapComponent
router.get('/search/map/:mapComponent', async (req, res) => {
  await eventServices
    .findEventByMapComponent(req.params.mapComponent)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found for this map component',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by host
router.get('/search/host/:hostId', async (req, res) => {
  await eventServices
    .findEventByHost(req.params.hostId)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No events found for this host' });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by attendee
router.get('/search/attendee/:userId', async (req, res) => {
  await eventServices
    .findEventByAttendee(req.params.userId)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found with that attendee',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by interests
router.get('/search/interests/:interests', async (req, res) => {
  const interests = req.params.interests.split(',').map((i) => i.trim());

  await eventServices
    .findEventByInterests(interests)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found with those interests',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
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
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found at that location',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

// Search by start time
router.get('/search/start/:start', async (req, res) => {
  await eventServices
    .findEventByStart(Number(req.params.start))
    .then((events) => {
      if (!events.length)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found with that start time',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((err) =>
      res.status(500).json({ success: false, message: `Server error: ${err}` })
    );
});

// Search by end time
router.get('/search/end/:end', async (req, res) => {
  await eventServices
    .findEventByEnd(Number(req.params.end))
    .then((events) => {
      if (!events.length)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found with that end time',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((err) =>
      res.status(500).json({ success: false, message: `Server error: ${err}` })
    );
});

// Search events between start and end
router.get('/search/time-range/:start/:end', async (req, res) => {
  const start = Number(req.params.start);
  const end = Number(req.params.end);

  await eventServices
    .findEventsBetween(start, end)
    .then((events) => {
      if (!events.length)
        res
          .status(404)
          .json({
            success: false,
            message: 'No events found in that time range',
          });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((err) =>
      res.status(500).json({ success: false, message: `Server error: ${err}` })
    );
});

// Search events where user is blocked
router.get('/search/blocked/:userId', async (req, res) => {
  await eventServices
    .findEventsBlockingUser(req.params.userId)
    .then((events) => {
      if (!events || events.length === 0)
        res
          .status(404)
          .json({ success: false, message: 'No events block this user' });
      else res.status(200).json({ success: true, data: events });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: `Error in the server: ${error}` });
    });
});

export default router;
