import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
});

const firestore = firebase.firestore();

// exasmple chatId
const chatId = 'testchatroom';
// example auth uid
const auth = {
  currentUser: {
    uid: 1
  }
};

function App() {
  return (
    <div className="App">
      <section>
        <ChatRoom />
      </section>
    </div>
  );
}


function ChatRoom() {
  const dummy = useRef();
  // NOTE: chatId마다 collection 안의 document를 생성하는 형태입니다. 따로 filter하지 않아도 됩니다
  const messagesRef = firestore.collection('chats').doc(chatId).collection('messages');
  var query = messagesRef.where('createdAt', '!=', false).orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const uid = auth.currentUser.uid;

    await messagesRef.add({
      text: formValue,
      chatId: chatId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      isRead: false,
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>🕊️</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <p>{text}</p>
    </div>
  </>)
}


export default App;
