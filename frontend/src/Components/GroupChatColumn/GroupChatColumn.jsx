import GroupChatComponent from '../GroupChatComponent/GroupChatComponent.jsx';
import './GroupChatColumn.css';

export default function GroupChatColumn(props) {
  return (
    <div className="GroupChat_Container">
      <div className="GroupChat_Title">GroupChats</div>
      <div className="GropuChat_List">
        {props.groupChatList.map((event, index) => (
          <GroupChatComponent
            key={index}
            groupChatName={event.groupChatName}
            lastMessage={event.lastMessage}
          />
        ))}
      </div>
    </div>
  );
}
