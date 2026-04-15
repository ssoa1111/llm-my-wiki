import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Link } from 'react-router-dom'
import 'highlight.js/styles/github.css'

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

function getCategoryLabel(page) {
  const key = page.subcategory ? `tech/${page.subcategory}` : page.category
  return CATEGORY_LABELS[key] || key
}

function resolveInternalLink(href, currentSlug) {
  if (!href) return href
  if (href.startsWith('http')) return href
  if (!href.endsWith('.md')) return href

  const stack = currentSlug ? currentSlug.split('/').slice(0, -1) : []
  for (const part of href.split('/')) {
    if (part === '..') { if (stack.length > 0) stack.pop() }
    else if (part !== '.' && part !== '') stack.push(part)
  }
  const slug = stack.join('/').replace(/\.md$/, '')
  return `#/page/${slug}`
}

export default function WikiPage({ pages, slug }) {
  const page = pages[slug] || pages['index']

  if (!page) {
    return <div className="wiki-missing"><h1>페이지를 찾을 수 없어요</h1><p>슬러그: {slug}</p></div>
  }

  const backlinks = page.backlinks || []

  return (
    <article className="wiki-article">
      <div className="wiki-category-badge">{getCategoryLabel(page)}</div>
      <h1 className="wiki-title">{page.title}</h1>
      {page.summary && <p className="wiki-summary">{page.summary}</p>}
      <div className="wiki-body-text">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeHighlight, { detect: true }]]}
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
