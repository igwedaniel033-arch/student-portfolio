import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

import ChatWindow from '../components/ChatWindow'
import MediaUploader from '../components/MediaUploader'

export default function Chat({ currentUser }){
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const roomId = 'global'

  useEffect(()=>{
    const token = localStorage.getItem('token')
    const s = io('http://localhost:3000', { auth: { token } })
    setSocket(s)
    s.on('connect', ()=>{ s.emit('join-room', roomId) })
    s.on('message', (m)=> setMessages(prev => [...prev, m]))
    return ()=>{ s.disconnect() }
  }, [])

  function send(text){
    if(!socket) return
    const payload = { roomId, message: { from: currentUser.fullName, text, createdAt: new Date() } }
    socket.emit('message', payload)
    setMessages(prev=>[...prev, payload])
  }

  return (
    <div className="chat-page">
      <aside className="members-panel">
        <h3>Members</h3>
        <div className="member">{currentUser.fullName}</div>
      </aside>
      <section className="chat-panel">
        <h2>General Chat</h2>
        <ChatWindow messages={messages} onSend={send} />
        <div style={{ marginTop: 12 }}>
          <h4>Share an image</h4>
          <MediaUploader onUploaded={(data)=>{
            // send system message with image URL
            const url = data.url
            send(`📷 ${url}`)
          }} />
        </div>
      </section>
    </div>
  )
}
