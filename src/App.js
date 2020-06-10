import React, { useState } from 'react';
import './App.css';

const URLS = ['http://localhost:5000/members', 'http://localhost:5000/messages']

const convertArrayToMap = (members) => {
   let map = members.reduce((acc, member) => {
    acc[member.id] = member;
    return acc
  }, {})
  return map
}

const getHumanReadableTime = (timestamp) => {
  return new Date(timestamp).toDateString()
}

const getSortedMessages = (messages) => {
  return messages.sort((msgA, msgB) => {
    return new Date(msgA.timestamp) - new Date(msgB.timestamp)
  })
}

const getFormattedJson = (messages, membersMap) => {
  return messages.map(msg => {
    let userInfo = membersMap[msg.userId]
    return {
      messageId: msg.id,
      userId: msg.userId,
      fullName: `${userInfo.firstName} ${userInfo.lastName}`,
      timestamp: msg.timestamp,
      email: userInfo.email,
      message: msg.message,
      avatar: userInfo.avatar
    }
  })
}

function App() {
  const [state, setState] = useState({messages:[], error: null})
  const getChatLog = () => {
    setState({...state, loading: true})
    Promise.all(URLS.map(url =>
      fetch(url)
      .then(response => response.json())                 
    ))
    .then(data => {
      let membersMap = convertArrayToMap(data[0]);
      let messages = data[1]
      let formattedMessages = getFormattedJson(messages, membersMap)
      setState({ ...state, messages: formattedMessages, loading:false, error: null });
    })
    .catch(error => {
      console.log(error,'error')
      setState({ ...state, error, loading:false });
    })
  }
  return (
    <div className="App">
      <button onClick={getChatLog}>Get Chat Log</button>
      {state.loading && <div>Loading...</div>}
      {state.error && <div>Error! Try again</div>}
      {!state.error && <ol style={{ display: "flex", flexDirection: "column" }}>
        {getSortedMessages(state.messages).map((msg) => {
          let { fullName, timestamp, email, message, avatar } = msg
          return (
            <li style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <img
                  src={avatar}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "25px",
                  }}
                  className="onHover"
                />
                <div className="hide"> {email} </div>
              </div>
              <div>Name: {fullName}</div>
              <div>{message}</div>
              <div>Sent date: {getHumanReadableTime(timestamp)}</div>
            </li>
          );
        })}
      </ol>}
    </div>
  );
}

export default App;
