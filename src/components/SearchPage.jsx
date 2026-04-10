import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

export default function SearchPage({ pages }) {
  const [params] = useSearchParams()
  const query = params.get('q') || ''

  if (!query) return <div className="wiki-article"><p>검색어를 입력하세요.</p></div>

  const lower = query.toLowerCase()
  const results = Object.values(pages).filter(page =>
    page.title.toLowerCase().includes(lower) ||
    page.content.toLowerCase().includes(lower)
  )

  return (
    <div className="wiki-article">
      <h1>검색: "{query}"</h1>
      <p>{results.length}개 결과</p>
      {results.length === 0 && <p>결과가 없어요.</p>}
      <ul className="search-results">
        {results.map(page => (
          <li key={page.slug} className="search-result-item">
            <Link to={`/page/${page.slug}`}>{page.title}</Link>
            {page.summary && <p className="search-summary">{page.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
