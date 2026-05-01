import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import EventsList from './pages/events/EventsList';
import EventDetail from './pages/events/EventDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import UserDashboard from './pages/dashboard/UserDashboard';
import OrganizerDashboard from './pages/dashboard/OrganizerDashboard';
import MyBookings from './pages/dashboard/MyBookings';
import BookingDetail from './pages/dashboard/BookingDetail';
import Profile from './pages/dashboard/Profile';
import QRCheckIn from './pages/dashboard/QRCheckIn';

import CreateEditEvent from './pages/events/CreateEditEvent';
import ManageTickets from './pages/events/ManageTickets';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';

import './styles/global.css';

function App() {
  return (
    <NotifProvider>
      <AuthProvider>
        <Router>
          <Toast />
          <div className="app-wrapper">
            <Navbar />
            <div className="page-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventsList />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/organizer" element={<ProtectedRoute roles={['organizer','admin']}><OrganizerDashboard /></ProtectedRoute>} />
                <Route path="/organizer/events" element={<ProtectedRoute roles={['organizer','admin']}><OrganizerDashboard /></ProtectedRoute>} />
                <Route path="/organizer/events/new" element={<ProtectedRoute roles={['organizer','admin']}><CreateEditEvent /></ProtectedRoute>} />
                <Route path="/organizer/events/:id/edit" element={<ProtectedRoute roles={['organizer','admin']}><CreateEditEvent /></ProtectedRoute>} />
                <Route path="/organizer/events/:eventId/tickets" element={<ProtectedRoute roles={['organizer','admin']}><ManageTickets /></ProtectedRoute>} />
                <Route path="/organizer/bookings" element={<ProtectedRoute roles={['organizer','admin']}><MyBookings /></ProtectedRoute>} />
                <Route path="/organizer/qr" element={<ProtectedRoute roles={['organizer','admin']}><QRCheckIn /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><AdminEvents /></ProtectedRoute>} />

                <Route path="/unauthorized" element={
                  <div className="empty-state" style={{minHeight:'80vh'}}>
                    <p className="empty-icon">🔒</p>
                    <h3>Access Denied</h3>
                    <p>You don't have permission to view this page.</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </NotifProvider>
  );
}

export default App;
