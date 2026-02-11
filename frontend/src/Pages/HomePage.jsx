import React from 'react';
import './HomePage.css';
import MainMapComponent from '../Components/MainMapComponent/MainMapComponent.jsx';
import EventColumn from '../Components/EventColumn/EventColumn.jsx';
import GroupChatColumn from '../Components/GroupChatColumn/GroupChatColumn.jsx';
import GroupChatComponent from '../Components/GroupChatComponent/GroupChatComponent.jsx';

// Example data, replace with Backend call for events
const test_Event_List = [
  {
    eventName: 'basketball game',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'sports',
  },
  {
    eventName: 'Drawing Club',
    eventTime: '5pm',
    eventAddress: 'Room 205',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'art',
  },
  {
    eventName: 'Jazz band',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'music',
  },
  {
    eventName: 'Foreign Exchange club',
    eventTime: '5pm',
    eventAddress: 'Dexter Lawn',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'travel',
  },
  {
    eventName: 'hackathon',
    eventTime: '5pm',
    eventAddress: 'PAC',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'coding',
  },
  {
    eventName: 'Soccer Game',
    eventTime: '5pm',
    eventAddress: 'lower field',
    description: 'Description',
    attendees: 'Attendees',
    Host: 'Host',
    Interest: 'sports',
  },
];

const test_Groupchat_List = [
  {
    groupChatName: 'SLO Basketball',
    lastMessage: 'Anyone playing tonight?',
  },
  {
    groupChatName: 'SLO Soccer',
    lastMessage: 'Lets have the game at the lower field',
  },
  {
    groupChatName: 'CPSalsa',
    lastMessage: 'Who is ready to dance?',
  },
  {
    groupChatName: 'CSAI',
    lastMessage: 'There will be presentations this',
  },
];

export default function HomePage() {
  return (
    <div className="HomePage">
      <div className="GroupChat-Column">
        <GroupChatColumn groupChatList={test_Groupchat_List} />
      </div>
      <div className="Map">
        <MainMapComponent />
      </div>
      <div className="Event-Column">
        <EventColumn eventList={test_Event_List} />
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from 'react';
// import './HomePage.css';
// import MainMapComponent from '../Components/MainMapComponent/MainMapComponent.jsx';
// import EventColumn from '../Components/EventColumn/EventColumn.jsx';
// import GroupChatColumn from '../Components/GroupChatColumn/GroupChatColumn.jsx';

// export default function HomePage() {
//   const [events, setEvents] = useState([]);
//   const [groupChats, setGroupChats] = useState([
//     {
//       groupChatName: "SLO Basketball",
//       lastMessage: "Anyone playing tonight?"
//     },
//     {
//       groupChatName: "SLO Soccer",
//       lastMessage: "Lets have the game at the lower field"
//     },
//     {
//       groupChatName: "CPSalsa",
//       lastMessage: "Who is ready to dance?"
//     },
//     {
//       groupChatName: "CSAI",
//       lastMessage: "There will be presentations this saturday."
//     }
//   ]);

//   useEffect(() => {
//   const fetchEvents = async () => {
//     try {
//       const response = await fetch('http://localhost:3001/events/all');
//       const result = await response.json();

//       if (result.success) {
//         const events = result.data; // <-- this is your list of events
//         console.log(events); // Check it in the console
//         setEvents(events); // Set state
//       }
//     } catch (error) {
//       console.error('Error fetching events:', error);
//     }
//   };

//   fetchEvents();
// }, []);

//   return (
//     <div className="HomePage">
//       <div className="GroupChat-Column">
//         <GroupChatColumn groupChatList={groupChats} />
//       </div>
//       <div className="Map">
//         <MainMapComponent />
//       </div>
//       <div className="Event-Column">
//         <EventColumn eventList={events} />
//       </div>
//     </div>
//   );
// }
