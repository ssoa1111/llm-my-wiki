import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'

function resolveInternalLink(href, currentSlug) {
  if (!href) return href
  if (href.startsWith('http')) return href
  if (!href.endsWith('.md')) return href

  // Convert relative .md link to slug
  const clean = href.replace(/^(\.\.\/)+[^/]+\//, '').replace('.md', '')
  return `#/page/${clean}`
}

export default function WikiPage({ pages, slug }) {
  const page = pages[slug] || pages['index']

  if (!page) {
    return <div className="wiki-missing"><h1>페이지를 찾을 수 없어요</h1><p>슬러그: {slug}</p></div>
  }

  const backlinks = page.backlinks || []

  return (
    <article className="wiki-article">
      <h1 className="wiki-title">{page.title}</h1>
      {page.summary && <p className="wiki-summary">{page.summary}</p>}
      <div className="wiki-body-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a({ href, children }) {
              const resolved = resolveInternalLink(href, page.slug)
              if (resolved && resolved.startsWith('#/')) {
                return <a href={resolved}>{children}</a>
              }
              return <a href={href} target="_blank" rel="noreferrer">{children}</a>
            },
          }}
        >
          {page.content}
        </ReactMarkdown>
      </div>

      {backlinks.length > 0 && (
        <div className="wiki-backlinks">
          <h3>← 이 페이지를 참조하는 곳</h3>
          <ul>
            {backlinks.map(slug => (
              <li key={slug}>
                <a href={`#/page/${slug}`}>{pages[slug]?.title || slug}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
