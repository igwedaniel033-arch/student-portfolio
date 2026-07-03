import React, { useState } from 'react'
import api from '../api'

export default function MediaUploader({ onUploaded }){
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function submit(e){
    e.preventDefault()
    if(!file) return
    setUploading(true)
    try{
      // Try S3 presign first
      const presign = await api.post('/api/media/presign', { filename: file.name, contentType: file.type }).catch(()=>null)
      if (presign && presign.data && presign.data.url) {
        const { url, publicUrl } = presign.data
        // upload directly to signed url
        await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
        onUploaded && onUploaded({ url: publicUrl })
      } else {
        const form = new FormData()
        form.append('file', file)
        const res = await api.post('/api/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
        onUploaded && onUploaded(res.data)
      }
    }catch(err){
      console.error(err)
      alert('Upload failed')
    }finally{ setUploading(false); setFile(null) }
  }

  return (
    <form className="media-uploader" onSubmit={submit}>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit" disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
    </form>
  )
}
