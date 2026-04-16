import { useMemo } from 'react'

const rawFiles = import.meta.glob('../wiki/**/*.md', { query: '?raw', import: 'default', eager: true })

function resolveLinkSlug(currentSlug, href) {
  const stack = currentSlug.split('/').slice(0, -1)
  for (const part of href.split('/')) {
    if (part === '..') { if (stack.length > 0) stack.pop() }
    else if (part !== '.' && part !== '') stack.push(part)
  }
  return stack.join('/').replace(/\.md$/, '')
}

//
function parsePage(filePath, rawContent) {
  const content = rawContent.replace(/^\uFEFF/, '') // BOM 제거
  const slug = filePath.replace('../wiki/', '').replace('.md', '')
  const parts = slug.split('/')
  const category = parts[0]
  // tech/n8n/... → subcategory = "n8n", others → subcategory = null
  const subcategory = (category === 'tech' && parts.length >= 3) ? parts[1] : null
  const name = parts.slice(1).join('/') || 'index'

  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : name

  const summaryMatch = content.match(/^>\s+(.+)$/m)
  const summary = summaryMatch ? summaryMatch[1].trim() : ''

  // 링크 추출 — 현재 slug 기준 상대경로 해석
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  const links = []
  let m
  while ((m = linkRegex.exec(content)) !== null) {
    const href = m[2]
    if (href.startsWith('http')) continue
    links.push(resolveLinkSlug(slug, href))
  }

  // 이미 별도 렌더링하는 제목/요약 줄을 content에서 제거
  let body = content
  if (titleMatch) body = body.replace(titleMatch[0], '')
  if (summaryMatch) body = body.replace(summaryMatch[0], '')
  body = body.replace(/^\n+/, '') // 앞쪽 빈 줄 정리

  return { slug, category, subcategory, name, title, summary, content: body, links }
}

export function useWiki() {
  return useMemo(() => {
    const pages = {}
    for (const [path, content] of Object.entries(rawFiles)) {
      const page = parsePage(path, content)
      pages[page.slug] = page
    }

    // 백링크 구성
    for (const page of Object.values(pages)) {
      for (const link of page.links) {
        if (pages[link]) {
          pages[link].backlinks = pages[link].backlinks || []
          if (!pages[link].backlinks.includes(page.slug)) {
            pages[link].backlinks.push(page.slug)
          }
        }
      }
    }

    return pages
  }, [])
}

export function getCategories(pages) {
  const cats = {}
  for (const page of Object.values(pages)) {
    if (page.category === 'index' || page.name === 'index') continue

    // tech 서브폴더는 "tech/n8n" 등으로 분리, tech 루트는 "tech"
    const key = page.subcategory ? `tech/${page.subcategory}` : page.category
    if (!cats[key]) cats[key] = []
    cats[key].push(page)
  }
  return cats
}
