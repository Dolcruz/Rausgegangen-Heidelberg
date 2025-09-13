import { format } from 'date-fns'
import type { EventDoc } from '../types'

interface Props {
  event: EventDoc
}

export function EventCard({ event }: Props) {
  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : undefined

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="Event" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />
        ) : null}
        <div style={{ display: 'grid', gap: 4 }}>
          <a href={event.sourceUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
            {event.title}
          </a>
          <div style={{ color: '#374151', fontSize: 14 }}>
            {format(start, 'eee, dd.MM.yyyy HH:mm')}
            {end ? ` – ${format(end, 'HH:mm')}` : ''}
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            {event.venue || ''}
            {event.venue && (event.city || event.address) ? ' · ' : ''}
            {[event.address, event.city].filter(Boolean).join(', ')}
          </div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>
            Quelle: {event.source}
          </div>
        </div>
      </div>
      {event.description ? (
        <div style={{ color: '#111827', fontSize: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3 as any, WebkitBoxOrient: 'vertical' as any }}>
          {event.description}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#374151', fontSize: 14 }}>{event.price || ''}</div>
        <a href={event.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>Zum Original</a>
      </div>
    </div>
  )
}


