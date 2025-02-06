// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateProject } from './pages/CreateProject';
import { PrivateRoute } from './routes/PrivateRoute';
import { Navbar } from './components/Navbar';
import ClientProject from './pages/ClientProject'; 
import { UpdateProject } from './pages/UpdateProject'; 
import { CreateBid } from './pages/CreateBid';
import { FreelanceProject } from './pages/FreelanceProject';
import { UpdateBid } from './pages/UpdateBid';
import { FreelancerProfile } from './pages/FreelancerProfile';
import { ClientProfile } from './pages/ClientProfile';
import { CreateFreelancerProfile } from './pages/CreateFreelancerProfile';
import { CreateClientProfile } from './pages/CreateClientProfile';
import { FreelancerProfileView } from './pages/FreelancerProfileView';
import { SocketProvider } from './hooks/SocketContext.jsx';

export const App = () => (
  <SocketProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes wrapper */}
        <Route element={<>
          <Navbar />
          <PrivateRoute allowedRoles={['client', 'freelancer']} />
        </>}>

          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Client-only routes */}
          <Route element={<PrivateRoute allowedRoles={['client']} />}>
            <Route path="/client-profile" element={<ClientProfile />} />
            <Route path="/create-client-profile" element={<CreateClientProfile />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/client-project/:id" element={<ClientProject />} />
            <Route path="/update-project/:id" element={<UpdateProject />} />
          </Route> 
          
          {/* Freelance-only routes */}
          <Route element={<PrivateRoute allowedRoles={['freelancer']} />}>
            <Route path="/freelancer-profile" element={<FreelancerProfile />} />
            <Route path="/create-freelancer-profile" element={<CreateFreelancerProfile />} />
            <Route path="/freelance-project/:id" element={<FreelanceProject />} />
            <Route path="/create-bid/:projectId" element={<CreateBid />} />
            <Route path="/edit-bid/:bidId" element={<UpdateBid />} />
          </Route> 

          {/* Shared routes */}
          <Route path="/freelancer-profile/:id" element={<FreelancerProfileView />} />
        </Route>
      </Routes>
    </Router>
  </SocketProvider>
);