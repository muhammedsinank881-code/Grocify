import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Billing from './pages/Billing'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Returns from './pages/Returns'
import Parties from './pages/Parties'
import Purchase from './pages/Purchase'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Offers from './pages/Offers'
import Task from './pages/Task'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="billing" element={<Billing />} />
        <Route path='products' element={<Products/>}/>
        <Route path='categories' element={<Categories/>}/>
        <Route path='returns' element={<Returns/>}/>
        <Route path='purchase' element={<Purchase/>}/>
        <Route path='customers' element={<Parties/>}/>
        <Route path='offers' element={<Offers/>}/>
        <Route path='reports' element={<Reports/>}/>
        <Route path='expenses' element={<Payments/>}/>
      </Route>
    </Routes>
  )
}

export default App
