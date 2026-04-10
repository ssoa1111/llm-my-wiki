import { Link } from 'react-router-dom'
import { getCategories } from '../useWiki'

const CATEGORY_LABELS = {
  concepts: '개념',
  entities: '인물 · 도구',
  books: '책 · 논문',
  tech: '기술',
  syntheses: '분석',
}

export default function Sidebar({ pages }) {
  const categories = getCategories(pages)

  return (
    <nav>
      {Object.entries(categories).map(([cat, catPages]) => (
        <div key={cat} className="sidebar-section">
          <h3 className="sidebar-category">{CATEGORY_LABELS[cat] || cat}</h3>
          <ul className="sidebar-list">
            {catPages.map(page => (
              <li key={page.slug}>
                <Link to={`/page/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
