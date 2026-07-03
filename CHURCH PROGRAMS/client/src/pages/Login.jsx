import React, { useState } from 'react'
import api from '../api'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('daniel@gigal.example')
  const [password, setPassword] = useState('AdminPass123')
  const [err, setErr] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      const res = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      onLogin(res.data.user)
    }catch(e){ setErr(e?.response?.data?.error || 'Login failed') }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={submit}>
        <h2>Welcome — Gilgal Parish</h2>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Sign in</button>
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  )
}
