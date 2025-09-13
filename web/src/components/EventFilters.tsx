import { useState } from 'react'

interface Props {
  onSearchChange: (v: string) => void
  onCategoryChange: (v: string) => void
}

export function EventFilters({ onSearchChange, onCategoryChange }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <input
        placeholder="Suche nach Titel, Ort, Beschreibung"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          onSearchChange(e.target.value)
        }}
        style={{ flex: 1, minWidth: 240, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
      />
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value)
          onCategoryChange(e.target.value)
        }}
        style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
      >
        <option value="">Alle Kategorien</option>
        <option value="konzerte">Konzerte</option>
        <option value="theater">Theater</option>
        <option value="kinder">Kinder & Familie</option>
        <option value="sport">Sport</option>
        <option value="kultur">Kultur</option>
        <option value="markt">Märkte</option>
        <option value="religion">Religion</option>
      </select>
    </div>
  )
}


