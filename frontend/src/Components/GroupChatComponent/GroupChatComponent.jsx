import React from 'react';
import './GroupChatComponent.css';

export default function GroupChatComponent(props) {

  console.log(props);

  return (
    <div className="GroupChat-Container">
      <div className="GroupChat-Title">{props.groupChatName}</div>
      <div className="GroupChat-LastMessage">
        {props.lastMessage}
      </div>
    </div>
  );
}
