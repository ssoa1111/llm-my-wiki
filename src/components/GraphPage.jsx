import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useNavigate } from 'react-router-dom'

export default function GraphPage({ pages }) {
  const svgRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    const nodes = Object.values(pages)
      .filter(p => p.slug !== 'index' && p.slug !== 'log')
      .map(p => ({ id: p.slug, title: p.title, category: p.category }))

    const nodeSet = new Set(nodes.map(n => n.id))
    const links = []
    for (const page of Object.values(pages)) {
      for (const link of page.links || []) {
        if (nodeSet.has(link) && nodeSet.has(page.slug) && page.slug !== link) {
          links.push({ source: page.slug, target: link })
        }
      }
    }

    const width = svgRef.current.clientWidth || 800
    const height = 600

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', [0, 0, width, height])

    const color = d3.scaleOrdinal(['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f'],
      ['concepts','entities','books','tech','syntheses'])

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', '#ccc').attr('stroke-width', 1)

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { d.__dragged = false; if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.__dragged = true; d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (e, d) => { if (!d.__dragged) navigate(`/page/${d.id}`) })

    node.append('circle').attr('r', 8).attr('fill', d => color(d.category))
    node.append('text').text(d => d.title).attr('x', 12).attr('y', 4)
      .style('font-size', '11px').style('fill', '#333')

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [pages])

  return (
    <div className="wiki-article">
      <h1>지식 그래프</h1>
      <p>노드를 클릭하면 해당 페이지로 이동해요. 드래그로 이동 가능.</p>
      <svg ref={svgRef} style={{ width: '100%', height: '600px', border: '1px solid #eee', borderRadius: '8px' }} />
    </div>
  )
}
