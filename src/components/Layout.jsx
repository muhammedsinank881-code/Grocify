import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'


const Layout = () => {
  return (
    <div>
      <Sidebar/>
      <div className='ml-72'>
        <Outlet/>
      </div>
    </div>
  )
}

export default Layout
