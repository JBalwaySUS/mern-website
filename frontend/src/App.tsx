import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import SearchItems from './pages/SearchItems';
import ItemPage from './pages/ItemPage';
import OrderHistory from './pages/OrderHistory';
import DeliverItems from './pages/DeliverItems';
import MyCart from './pages/MyCart';
import SupportPage from './pages/Support';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/searchitems" element={<ProtectedRoute><SearchItems /></ProtectedRoute>} />
        <Route path="/items/:id" element={<ProtectedRoute><ItemPage /></ProtectedRoute>} />
        <Route path="/orderhistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/deliveritems" element={<ProtectedRoute><DeliverItems /></ProtectedRoute>} />
        <Route path="/mycart" element={<ProtectedRoute><MyCart /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App
