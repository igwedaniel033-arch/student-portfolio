import React, { useRef } from 'react'

let ReactQuill = null
try { ReactQuill = require('react-quill') } catch (e) { ReactQuill = null }

export default function RichEditor({ value, onChange }){
  if (!ReactQuill) return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} style={{ minHeight:200, width: '100%' }} />
  )

  const quillRef = useRef(null)

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold','italic','underline','strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link','image'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input')
          input.setAttribute('type','file')
          input.setAttribute('accept','image/*')
          input.onchange = async () => {
            const file = input.files[0]
            if (!file) return
            const form = new FormData()
            form.append('file', file)
            try {
              const res = await fetch('/api/media/upload', { method: 'POST', body: form })
              const data = await res.json()
              const url = data.publicUrl || data.url
              const editor = quillRef.current && quillRef.current.getEditor()
              const range = editor ? editor.getSelection() : { index: 0 }
              editor.insertEmbed(range.index || 0, 'image', url)
            } catch (err) {
              console.error('upload error', err)
              alert('Image upload failed')
            }
          }
          input.click()
        }
      }
    }
  }

  return (
    <ReactQuill ref={quillRef} value={value} onChange={onChange} theme="snow" modules={modules} />
  )
}
