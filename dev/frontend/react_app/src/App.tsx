import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import RegisterRegionPage from './pages/RegisterRegionPage/RegisterRegionPage'
import SendMessagePage from './pages/SendMessagePage/SendMessagePage'
import EditNewsPage from './pages/EditNewsPage/EditNewsPage'

const TabLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/registerregion', label: '地域登録', icon: '📍' },
    { path: '/sendmessage', label: 'メッセージ送信', icon: '💬' },
    { path: '/editnews', label: 'ニュース編集', icon: '📰' }
  ]

  const handleTabClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <header className="app-header">
          <h1 className="app-title">管理システム</h1>
          <p className="app-subtitle">地域登録・メッセージ送信・ニュース編集</p>
        </header>

        <div className="tab-container">
          <div className="tab-header">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                className={`tab-button ${location.pathname === tab.path ? 'tab-active' : ''}`}
                onClick={() => handleTabClick(tab.path)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            <Routes>
              <Route path="/registerregion" element={<RegisterRegionPage />} />
              <Route path="/sendmessage" element={<SendMessagePage />} />
              <Route path="/editnews" element={<EditNewsPage />} />
              <Route path="/" element={<Navigate to="/registerregion" replace />} />
            </Routes>
          </div>
        </div>

        <footer className="app-footer">
          <p>&copy; 2025 管理システム. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <TabLayout />
    </Router>
  )
}

export default App