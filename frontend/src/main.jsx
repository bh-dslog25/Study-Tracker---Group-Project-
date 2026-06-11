import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Đảm bảo đã import file CSS chứa cấu hình Tailwind

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)