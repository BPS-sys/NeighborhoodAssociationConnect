import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// Copyright (c) 2025 YukiTakayama, ShingoNakano, SaihaHatanaka
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。