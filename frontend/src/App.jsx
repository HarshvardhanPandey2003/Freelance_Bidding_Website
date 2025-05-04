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
import { ConfirmBid } from './pages/ConfirmBid.jsx';
import { PaymentDashboard } from './pages/PaymentDashboard';
import ChatPage from './pages/ChatPage'; // Import the ChatPage

export const App = () => (
  <SocketProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes wrapper */}
        <Route
          element={
            <>
              <Navbar />
              <PrivateRoute allowedRoles={['client', 'freelancer']} />
            </>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Client-only routes */}
          <Route element={<PrivateRoute allowedRoles={['client']} />}>
            <Route path="/client-profile" element={<ClientProfile />} />
            <Route
              path="/create-client-profile"
              element={<CreateClientProfile />}
            />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/update-project/:id" element={<UpdateProject />} />
            <Route
              path="/confirmbid/:projectId/:freelancerId/:bidId"
              element={<ConfirmBid />}
            />
          </Route>

          {/* Freelance-only routes */}
          <Route element={<PrivateRoute allowedRoles={['freelancer']} />}>
            <Route path="/freelancer-profile" element={<FreelancerProfile />} />
            <Route
              path="/create-freelancer-profile"
              element={<CreateFreelancerProfile />}
            />
            <Route path="/freelance-project/:id" element={<FreelanceProject />} />
            <Route path="/create-bid/:projectId" element={<CreateBid />} />
            <Route path="/edit-bid/:bidId" element={<UpdateBid />} />
          </Route>

          {/* Shared routes */}
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route
            path="/freelancer-message/:id"
            element={<FreelancerProfileView />}
          />
          <Route path="/client-project/:id" element={<ClientProject />} />
          <Route path="/payments" element={<PaymentDashboard />} />

          {/* New Chat route */}
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </Router>
  </SocketProvider>
);
