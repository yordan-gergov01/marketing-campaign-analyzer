import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

function FileDropZone({
    accept,
    label,
    hint,
    onFile,
    file,
  }: {
    accept: string
    label: string
    hint: string
    onFile: (f: File) => void
    file?: File | null
  }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
  
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) onFile(f)
    }
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) onFile(f)
    }
  
    return (
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors
          ${dragging ? 'border-emerald-400 bg-emerald-400/5' : 'border-zinc-700 hover:border-zinc-500'}
        `}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
        {file ? (
          <div>
            <p className="text-sm font-medium text-emerald-400">{file.name}</p>
            <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024).toFixed(1)} KB · click to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-zinc-300">{label}</p>
            <p className="text-xs text-zinc-500 mt-1">{hint}</p>
          </div>
        )}
      </div>
    )
  }

  export default FileDropZone;