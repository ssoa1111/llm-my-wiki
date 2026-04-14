import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ pages, children }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="wiki-root">
      <header className="wiki-header">
        <Link to="/" className="wiki-logo">Garage</Link>
        <form onSubmit={handleSearch} className="wiki-search-form">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="위키 검색..."
            className="wiki-search-input"
          />
          <button type="submit" className="wiki-search-btn">검색</button>
        </form>
        <nav className="wiki-nav">
          <Link to="/">홈</Link>
          <Link to="/graph">그래프</Link>
        </nav>
      </header>
      <div className="wiki-body">
        <aside className="wiki-sidebar">
          <Sidebar pages={pages} />
        </aside>
        <main className="wiki-content">
          {children}
        </main>
      </div>
    </div>
  )
}
