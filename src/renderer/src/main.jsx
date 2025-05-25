import './assets/main.css'

import { StrictMode } from 'react'
import { Routes, Route, HashRouter } from 'react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AddPartner from './AddPartner'
import UpdatePartner from './UpdatePartner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StrictMode>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/addPartner' element={<AddPartner />} />
        <Route path='/updatePartner' element={<UpdatePartner />} />
      </Routes>
    </StrictMode>
  </HashRouter>
)
