import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';
import PatientDetail from './pages/PatientDetail';
import DoctorList from './pages/DoctorList';
import DoctorForm from './pages/DoctorForm';
import DoctorDetail from './pages/DoctorDetail';
import AppointmentList from './pages/AppointmentList';
import AppointmentForm from './pages/AppointmentForm';
import AppointmentDetail from './pages/AppointmentDetail';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Patient Routes */}
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patients/new" element={<PatientForm />} />
                    <Route path="/patients/:id" element={<PatientDetail />} />
                    <Route path="/patients/:id/edit" element={<PatientForm />} />
                    
                    {/* Doctor Routes */}
                    <Route path="/doctors" element={<DoctorList />} />
                    <Route path="/doctors/new" element={<DoctorForm />} />
                    <Route path="/doctors/:id" element={<DoctorDetail />} />
                    <Route path="/doctors/edit/:id" element={<DoctorForm />} />
                    
                    {/* Appointment Routes */}
                    <Route path="/appointments" element={<AppointmentList />} />
                    <Route path="/appointments/new" element={<AppointmentForm />} />
                    <Route path="/appointments/:id" element={<AppointmentDetail />} />
                    
                    {/* Billing Routes */}
                    <Route path="/billing" element={<InvoiceList />} />
                    <Route path="/billing/new" element={<InvoiceForm />} />
                    <Route path="/billing/:id" element={<InvoiceDetail />} />
                    
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
