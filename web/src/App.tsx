import { useMemo, useState } from 'react'
import './App.css'
import { useEvents } from './hooks/useEvents'
import { EventCard } from './components/EventCard'
import { EventFilters } from './components/EventFilters'

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const { events, loading, error } = useEvents({ search, category })

  const header = useMemo(() => {
    const total = events.length
    return `${total} Veranstaltungen`
  }, [events])

  return (
    <div>
      <div className="header">
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Events in Heidelberg & Umgebung</h1>
        <span className="badge">Auto-aggregiert</span>
      </div>
      <p className="subtitle">
        Automatisch gesammelt aus mehreren Quellen und nach Datum sortiert. Klicke auf einen Eintrag für das Original.
      </p>
      <EventFilters onSearchChange={setSearch} onCategoryChange={setCategory} />
      {loading ? <div>Lade Events…</div> : null}
      {error ? <div style={{ color: 'crimson' }}>Fehler: {error}</div> : null}
      {!loading && !error ? (
        <>
          <div style={{ margin: '12px 0', color: '#6b7280' }}>{header}</div>
          <div className="grid">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default App
