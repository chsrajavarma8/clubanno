import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!src) return null

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={20} />
      </button>
      <img className="lightbox-image" src={src} alt={alt || ''} onClick={(e) => e.stopPropagation()} />
    </div>
  )
}
