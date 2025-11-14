import eventModel from './EventSchema.js';

// Get all events
function getEvents() {
  return eventModel.find().populate('attendees host blockedUsers');
}

// Add a new event
function addEvent(event) {
  const newEvent = new eventModel(event);
  return newEvent.save();
}

// Delete an event by ID
function deleteEvent(id) {
  return eventModel.findByIdAndDelete(id);
}

// Update an event by ID
function updateEvent(id, eventData) {
  return eventModel
    .findByIdAndUpdate(id, eventData, {
      new: true,
      runValidators: true,
    })
    .populate('attendees host blockedUsers');
}

// Find event by ID
function findEventById(id) {
  return eventModel.findById(id).populate('attendees host blockedUsers');
}

// Find event(s) by name
function findEventByName(eventName) {
  return eventModel
    .find({ eventName: { $regex: eventName, $options: 'i' } })
    .populate('attendees host blockedUsers');
}

// Find events by keyword in description
function findEventByDescription(keyword) {
  return eventModel
    .find({ description: { $regex: keyword, $options: 'i' } })
    .populate('attendees host blockedUsers');
}

// Find event(s) by mapComponent 
function findEventByMapComponent(mapComponent) {
  return eventModel
    .find({ mapComponent })
    .populate('attendees host blockedUsers');
}

// Find events that include a specific attendee 
function findEventByAttendee(userId) {
  return eventModel
    .find({ attendees: userId })
    .populate('attendees host blockedUsers');
}

// Find event(s) by host ID
function findEventByHost(hostId) {
  return eventModel
    .find({ host: hostId })
    .populate('attendees host blockedUsers');
}

// Find event(s) by interests (list of strings)
function findEventByInterests(interests) {
  return eventModel
    .find({ interests: { $in: interests } })
    .populate('attendees host blockedUsers');
}

// Find event(s) near a location (latitude, longitude, radius in miles)
function findEventByLocation(latitude, longitude, radiusInMiles) {
  return eventModel
    .find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMiles / 3959],
        },
      },
    })
    .populate('attendees host blockedUsers');
}

// Find events by EXACT start time
function findEventByStart(startTime) {
  return eventModel
    .find({ 'time.start': startTime })
    .populate('attendees host blockedUsers');
}

// Find events by EXACT end time
function findEventByEnd(endTime) {
  return eventModel
    .find({ 'time.end': endTime })
    .populate('attendees host blockedUsers');
}

// Find events inside a time range
function findEventsBetween(startTime, endTime) {
  return eventModel
    .find({
      'time.start': { $gte: startTime },
      'time.end': { $lte: endTime }
    })
    .populate('attendees host blockedUsers');
}

// Find events where a user is blocked 
function findEventsBlockingUser(userId) {
  return eventModel
    .find({ blockedUsers: userId })
    .populate('attendees host blockedUsers');
}

export default {
  getEvents,
  addEvent,
  deleteEvent,
  updateEvent,
  findEventById,
  findEventByName,
  findEventByDescription,
  findEventByMapComponent,
  findEventByAttendee,
  findEventByHost,
  findEventByInterests,
  findEventByLocation,
  findEventByStart,
  findEventByEnd,
  findEventsBetween,
  findEventsBlockingUser,
};
