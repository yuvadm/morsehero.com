import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import ChartPage from './pages/chart/ChartPage'
import EmbedPage from './pages/embed/EmbedPage'
import ChartEmbedPage from './pages/chart/ChartEmbedPage'
import './styles.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/chart/embed" element={<ChartEmbedPage />} />
      </Routes>
    </Router>
  )
}

export default App
