import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getCategories } from '../useWiki'

const CATEGORY_LABELS = {
  concepts:        '개념',
  entities:        '인물 · 도구',
  books:           '책 · 논문',
  'tech/n8n':      '기술 · n8n',
  'tech/ai':       '기술 · AI',
  'tech/frontend': '기술 · 프론트엔드',
  'tech/backend':  '기술 · 백엔드',
  'tech/infra':    '기술 · 인프라',
  tech:            '기술 · 기타',
  syntheses:       '분석',
}

const CATEGORY_ORDER = [
  'concepts', 'entities', 'books',
  'tech/n8n', 'tech/ai', 'tech/frontend', 'tech/backend', 'tech/infra', 'tech',
  'syntheses',
]

function SidebarSection({ cat, catPages }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-category" onClick={() => setOpen(o => !o)}>
        <span className="sidebar-arrow">{open ? '▾' : '▸'}</span>
        {CATEGORY_LABELS[cat] || cat}
        <span className="sidebar-count">{catPages.length}</span>
      </h3>
      {open && (
        <ul className="sidebar-list">
          {catPages
            .sort((a, b) => a.title.localeCompare(b.title, 'ko'))
            .map(page => (
              <li key={page.slug}>
                <Link to={`/page/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function Sidebar({ pages }) {
  const categories = getCategories(pages)

  const sorted = CATEGORY_ORDER
    .filter(k => categories[k]?.length > 0)
    .map(k => [k, categories[k]])

  for (const [k, v] of Object.entries(categories)) {
    if (!CATEGORY_ORDER.includes(k) && v.length > 0) sorted.push([k, v])
  }

  return (
    <nav>
      {sorted.map(([cat, catPages]) => (
        <SidebarSection key={cat} cat={cat} catPages={catPages} />
      ))}
    </nav>
  )
}
