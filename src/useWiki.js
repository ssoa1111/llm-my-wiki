import { useMemo } from 'react'

const rawFiles = import.meta.glob('../wiki/**/*.md', { query: '?raw', import: 'default', eager: true })

function parsePage(filePath, content) {
  // slug: e.g. "concepts/rag"
  const slug = filePath.replace('../wiki/', '').replace('.md', '')
  const parts = slug.split('/')
  const category = parts[0]
  const name = parts.slice(1).join('/') || 'index'

  // Title: first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : name

  // Summary: first > blockquote line
  const summaryMatch = content.match(/^>\s+(.+)$/m)
  const summary = summaryMatch ? summaryMatch[1].trim() : ''

  // Extract outgoing links (relative .md links)
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g
  const links = []
  let m
  while ((m = linkRegex.exec(content)) !== null) {
    // Normalize link to slug
    const raw = m[2].replace(/^.*wiki\//, '').replace('.md', '').replace(/^\.\.\/[^/]+\//, '')
    links.push(raw)
  }

  return { slug, category, name, title, summary, content, links }
}

export function useWiki() {
  return useMemo(() => {
    const pages = {}
    for (const [path, content] of Object.entries(rawFiles)) {
      const page = parsePage(path, content)
      pages[page.slug] = page
    }

    // Build backlinks
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
    if (!cats[page.category]) cats[page.category] = []
    cats[page.category].push(page)
  }
  return cats
}
