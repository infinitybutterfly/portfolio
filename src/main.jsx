import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './layouts/navbar';
import Projects from './pages/projects';
import Projects_Admin from './pages/admin/projects_admin';
import NotFound from './pages/404_not_found';

const AdminGuard = () => {
  const location = useLocation();
  if (location.hash !== '#ragnarok') {
    return <NotFound />;
  }
  return <Projects_Admin />;
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/admin/project_admin" element={<Layout><AdminGuard /></Layout>} />
        
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);