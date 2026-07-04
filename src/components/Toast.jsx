export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="toast">
      <span className="toast-icon">🔔</span>
      <div>
        <div className="toast-title">{toast.title}</div>
        <div className="toast-body">{toast.body}</div>
      </div>
    </div>
  )
}
