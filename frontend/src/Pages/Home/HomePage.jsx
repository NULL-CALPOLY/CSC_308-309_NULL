import React from 'react';
import './HomePage.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import MainMapComponent from '../../Components/MainMapComponent/MainMapComponent.jsx';
import EventColumn from '../../Components/EventColumn/EventColumn.jsx';
import GroupChatColumn from '../../Components/GroupChatColumn/GroupChatColumn.jsx';
import GroupChatComponent from '../../Components/GroupChatComponent/GroupChatComponent.jsx';
import FetchEvents from '../../Hooks/UseEvents.jsx';

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
  const events = FetchEvents();

  return (
    <div className="HomePage">
      <Navbar />
      <div className="GroupChat-Column">
        <GroupChatColumn groupChatList={test_Groupchat_List} />
      </div>
      <div className="Map">
        <MainMapComponent />
      </div>
      <div className="Event-Column">
        <EventColumn eventList={events} />
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
