import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import AdminApp from './AdminApp.jsx'

function Root() {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')
  return isAdminRoute ? <AdminApp /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>,
)
