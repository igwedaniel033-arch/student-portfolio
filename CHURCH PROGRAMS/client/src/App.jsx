import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Chat from './pages/Chat'
import api from './api'
import { io } from 'socket.io-client'

export default function App(){
  const [user, setUser] = useState(null)
  const [missions, setMissions] = useState([])
  const [missionStatus, setMissionStatus] = useState('')
  const [contactStatus, setContactStatus] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactForm, setContactForm] = useState({ name:'', email:'', message:'' })

  useEffect(()=>{
    const t = localStorage.getItem('token')
    if(!t) return
    api.get('/api/users/me').then(r=> setUser(r.data)).catch(()=>{ localStorage.removeItem('token') })
  }, [])

  useEffect(() => {
    const loadMissions = async () => {
      setMissionStatus('Loading missions...')
      try {
        const res = await api.get('/api/missions')
        setMissions(res.data)
        setMissionStatus('')
      } catch (err) {
        setMissionStatus('Unable to load missions. Please confirm backend is running.')
      }
    }

    loadMissions()

    const socket = io('http://localhost:5000', { transports: ['websocket'] })
    socket.on('connect', () => console.log('Socket connected.', socket.id))
    socket.on('mission:created', loadMissions)
    socket.on('mission:updated', loadMissions)
    socket.on('mission:deleted', loadMissions)
    socket.on('mission:progress', (data) => {
      setMissionStatus(`Realtime progress update: ${data.completionStatus || 'changed'}`)
      setTimeout(() => setMissionStatus(''), 4200)
    })
    socket.on('disconnect', () => console.log('Socket disconnected.'))

    return () => socket.disconnect()
  }, [user])

  const handleLogin = (user) => { setUser(user) }

  const submitContact = async (e) => {
    e.preventDefault()
    setContactStatus('')
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactStatus('Please complete all fields before submitting.')
      return
    }

    setContactLoading(true)
    try {
      await api.post('/api/contact', contactForm)
      setContactStatus('Message sent successfully. Thank you!')
      setContactForm({ name:'', email:'', message:'' })
    } catch (err) {
      setContactStatus('Unable to send your message. Try again later.')
      console.error(err)
    } finally {
      setContactLoading(false)
    }
  }

  if(!user) return <Login onLogin={handleLogin} />

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">Gilgal Parish Church</div>
        <div className="user">{user.fullName} — {user.role} <button onClick={()=>{ localStorage.removeItem('token'); window.location.reload() }} style={{ marginLeft:8 }}>Sign out</button></div>
      </header>
      <main className="main" style={{ gap: 16 }}>
        <div style={{ flex: 2 }}>
          <Chat currentUser={user} />
          <section style={{ marginTop: 16 }}>
            <h3>Live mission feed</h3>
            {missionStatus && <p style={{ color:'#d93025' }}>{missionStatus}</p>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:12 }}>
              {missions.length === 0 && <p>No published missions available yet.</p>}
              {missions.map(m => (
                <article key={m._id} style={{ border:'1px solid #ddd', borderRadius:8, padding:12, background:'#fff' }}>
                  <h4>{m.title || 'Untitled'}</h4>
                  <p>{m.description || 'No mission description.'}</p>
                  <p><strong>Status:</strong> {m.published ? 'Published' : 'Draft'}</p>
                  <p><strong>Reward:</strong> {m.reward || 'N/A'}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ flex: 1, minWidth: 300 }}>
          <div style={{ marginBottom: 18 }}>
            {user.role === 'admin' && <div><a href="#admin" onClick={(e)=>{ e.preventDefault(); window.location.hash='admin'; window.location.reload(); }}>Open Admin</a></div>}
            <div style={{ marginTop:12 }}><a href="#call" onClick={(e)=>{ e.preventDefault(); window.location.hash='call'; window.location.reload(); }}>Start Call</a></div>
          </div>

          <section style={{ border:'1px solid #ddd', padding:12, borderRadius:8 }}>
            <h3>Send contact message</h3>
            <form onSubmit={submitContact}>
              <input value={contactForm.name} onChange={(e)=>setContactForm({...contactForm, name:e.target.value})} placeholder="Name" style={{ width:'100%', marginBottom:8 }} required />
              <input value={contactForm.email} onChange={(e)=>setContactForm({...contactForm, email:e.target.value})} placeholder="Email" type="email" style={{ width:'100%', marginBottom:8 }} required />
              <textarea value={contactForm.message} onChange={(e)=>setContactForm({...contactForm, message:e.target.value})} placeholder="Message" rows={4} style={{ width:'100%', marginBottom:8 }} required />
              <button type="submit" disabled={contactLoading} style={{ width:'100%', padding:'8px 12px' }}>{contactLoading ? 'Sending...' : 'Send'}</button>
            </form>
            {contactStatus && <p style={{ marginTop:8, color: contactStatus.startsWith('Unable') ? '#d93025' : '#0f76ef' }}>{contactStatus}</p>}
          </section>
        </aside>
      </main>
    </div>
  )
}

// Simple client-side router (very small)
const mount = () => {
  const route = window.location.hash.replace('#','')
  const root = document.getElementById('root')
  if (route === 'admin') {
    const Admin = require('./pages/Admin').default
    createRoot(root).render(<Admin />)
  } else if (route === 'call') {
    const Call = require('./pages/Call').default
    createRoot(root).render(<Call />)
  }
}
if (typeof window !== 'undefined') setTimeout(mount, 50)
