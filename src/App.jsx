import { Routes, Route, useParams } from 'react-router-dom'
import { useWiki } from './useWiki'
import Layout from './components/Layout'
import WikiPage from './components/WikiPage'
import SearchPage from './components/SearchPage'
import GraphPage from './components/GraphPage'

function PageRoute({ pages }) {
  const { '*': slug } = useParams()
  return <WikiPage pages={pages} slug={slug} />
}

export default function App() {
  const pages = useWiki()

  return (
    <Layout pages={pages}>
      <Routes>
        <Route path="/" element={<WikiPage pages={pages} slug="index" />} />
        <Route path="/page/*" element={<PageRoute pages={pages} />} />
        <Route path="/search" element={<SearchPage pages={pages} />} />
        <Route path="/graph" element={<GraphPage pages={pages} />} />
      </Routes>
    </Layout>
  )
}
