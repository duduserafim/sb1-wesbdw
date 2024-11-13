import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Instances from './pages/Instances';
import Groups from './pages/Groups';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="instances" element={<Instances />} />
            <Route path="groups" element={<Groups />} />
            <Route path="chat" element={<Chat />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="clients" element={<Clients />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;