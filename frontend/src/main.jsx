// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. react-router-dom'dan import et
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Uygulamayı BrowserRouter ile sarmala */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)