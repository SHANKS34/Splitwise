import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard'
import Login from './Login'
import Group from './Group';
function App() {
  // You don't need useNavigate here just to define routes
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/group/:groupId" element={<Group />} />
    </Routes>
  )
}

export default App