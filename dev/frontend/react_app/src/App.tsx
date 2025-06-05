import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import RegisterRegionPage from './pages/RegisterRegionPage/RegisterRegionPage'
import SendMessagePage from './pages/SendMessagePage/SendMessagePage'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/registerregion" element={<RegisterRegionPage />} />
        <Route path="/sendmessage" element={<SendMessagePage />} />
      </Routes>
    </Router>
  )
}

export default App
