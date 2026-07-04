import { DEFAULT_REACTIONS } from '../data/seed'

export default function ReactionBar({ club, reactions, onReact }) {
  const counts = reactions || {}

  return (
    <div className="reaction-bar">
      {DEFAULT_REACTIONS.map((emoji) => (
        <button key={emoji} className="reaction-btn" onClick={() => onReact(emoji)}>
          <span>{emoji}</span>
          {counts[emoji] > 0 && <span className="reaction-count">{counts[emoji]}</span>}
        </button>
      ))}
      {club?.customEmoji && (
        <button className="reaction-btn" onClick={() => onReact('custom')}>
          <img className="reaction-emoji-img" src={club.customEmoji} alt="custom emoji" />
          {counts.custom > 0 && <span className="reaction-count">{counts.custom}</span>}
        </button>
      )}
    </div>
  )
}
