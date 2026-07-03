import React, { useState, useRef, useEffect } from 'react'

export default function ChatWindow({ messages, onSend }){
  const [text, setText] = useState('')
  const listRef = useRef()

  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, [messages])

  function submit(e){
    e.preventDefault()
    if(!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="chat-window">
      <div className="messages" ref={listRef}>
        {messages.map((m, i)=> (
          <div key={i} className="message">
            <div className="meta">{m.message?.from || m.from} <span className="time">{new Date(m.message?.createdAt || m.createdAt).toLocaleTimeString()}</span></div>
            <div className="body">{m.message?.text || m.text}</div>
          </div>
        ))}
      </div>
      <form className="composer" onSubmit={submit}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
