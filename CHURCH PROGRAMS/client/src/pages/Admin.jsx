import React, { useEffect, useState } from 'react'
import api from '../api'
import RichEditor from '../components/RichEditor'

export default function Admin(){
  const [about, setAbout] = useState(null)
  const [members, setMembers] = useState([])
  const [articles, setArticles] = useState([])
  const [edit, setEdit] = useState({ churchName:'', location:'', description:'' })

  useEffect(()=>{ load() }, [])
  async function load(){
    const a = await api.get('/api/about'); setAbout(a.data); setEdit({ churchName:a.data.churchName, location:a.data.location, description:a.data.description })
    const m = await api.get('/api/users'); setMembers(m.data)
    const r = await api.get('/api/articles'); setArticles(r.data)
  }

  async function saveAbout(){
    await api.patch('/api/about', edit)
    load()
  }

  async function createArticle(){
    // show inline form instead of prompt
    setEditing({ title: '', body: '', status: 'published', _id: null })
  }

  const [editing, setEditing] = useState(null)

  async function saveEditing(){
    if(!editing) return
    if(!editing.title || !editing.body) return alert('Title and body required')
    if(editing._id) {
      await api.patch(`/api/articles/${editing._id}`, { title: editing.title, body: editing.body, status: editing.status })
    } else {
      await api.post('/api/articles', { title: editing.title, body: editing.body, status: editing.status })
    }
    setEditing(null)
    load()
  }

  async function editArticle(a){
    const newTitle = prompt('Title', a.title); if(!newTitle) return
    const newBody = prompt('Body', a.body); if(!newBody) return
    await api.patch(`/api/articles/${a._id}`, { title:newTitle, body:newBody })
    load()
  }

  async function deleteArticle(a){
    if(!confirm('Delete article?')) return
    await api.delete(`/api/articles/${a._id}`)
    load()
  }

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <section>
        <h3>About</h3>
        <input value={edit.churchName} onChange={e=>setEdit(s=>({...s, churchName:e.target.value}))} />
        <input value={edit.location} onChange={e=>setEdit(s=>({...s, location:e.target.value}))} />
        <textarea value={edit.description} onChange={e=>setEdit(s=>({...s, description:e.target.value}))} />
        <button onClick={saveAbout}>Save About</button>
      </section>
      <section>
        <h3>Members ({members.length})</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {members.map(m=> <div key={m._id} className="member-card">{m.fullName} — {m.role}</div>)}
        </div>
      </section>
      <section>
        <h3>Articles ({articles.length})</h3>
        <button onClick={createArticle}>Create Article</button>
        {editing ? (
          <div style={{ background:'#fff', padding:12, borderRadius:6 }}>
            <input placeholder="Title" value={editing.title} onChange={e=>setEditing(s=>({...s, title:e.target.value}))} />
            <RichEditor value={editing.body} onChange={v=>setEditing(s=>({...s, body:v}))} />
            <div style={{ marginTop:8 }}>
              <select value={editing.status} onChange={e=>setEditing(s=>({...s, status:e.target.value}))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <button onClick={saveEditing} style={{ marginLeft:8 }}>Save</button>
              <button onClick={()=>setEditing(null)} style={{ marginLeft:8 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <ul>
            {articles.map(a=> (
              <li key={a._id} style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ flex:1 }}>{a.title} — {a.status}</div>
                <button onClick={()=>setEditing({ title:a.title, body:a.body, status:a.status, _id:a._id })}>Edit</button>
                <button onClick={()=>deleteArticle(a)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
