import React, { useRef, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function Call(){
  const localRef = useRef();
  const remoteRef = useRef();
  const pcRef = useRef();
  const socketRef = useRef();
  const [connected, setConnected] = useState(false)

  useEffect(()=>{
    const s = io('http://localhost:3000')
    socketRef.current = s
    s.on('connect', ()=> console.log('socket connected'))
    s.on('signal', async ({ from, data })=>{
      if (data.type === 'offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data))
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        s.emit('signal', { to: data.fromId || from, data: pcRef.current.localDescription })
      } else if (data.type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data))
      } else if (data.candidate) {
        try{ await pcRef.current.addIceCandidate(data.candidate) }catch(e){ console.warn(e) }
      }
    })
    return ()=> s.disconnect()
  }, [])

  async function start(){
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'turn:localhost:3478', username: 'turnuser', credential: 'turnpass' }] })
    pcRef.current = pc
    pc.ontrack = (ev)=>{ remoteRef.current.srcObject = ev.streams[0] }
    pc.onicecandidate = (ev)=>{ if (ev.candidate) socketRef.current.emit('signal', { data: { candidate: ev.candidate }, to: null }) }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localRef.current.srcObject = stream
    for (const t of stream.getTracks()) pc.addTrack(t, stream)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current.emit('signal', { data: { ...offer, fromId: socketRef.current.id }, to: null })
    setConnected(true)
  }

  function stop(){
    if (pcRef.current) pcRef.current.close(); pcRef.current = null; setConnected(false)
  }

  return (
    <div style={{ padding:20 }}>
      <h2>Call (experimental)</h2>
      <div style={{ display:'flex', gap:12 }}>
        <video ref={localRef} autoPlay muted playsInline style={{ width:240, background:'#000' }} />
        <video ref={remoteRef} autoPlay playsInline style={{ width:240, background:'#000' }} />
      </div>
      <div style={{ marginTop:12 }}>
        {!connected ? <button onClick={start}>Start Call</button> : <button onClick={stop}>End Call</button>}
      </div>
    </div>
  )
}
