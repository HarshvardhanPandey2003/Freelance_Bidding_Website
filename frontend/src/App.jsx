// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateProject } from './pages/CreateProject';
import { PrivateRoute } from './routes/PrivateRoute';
import { Navbar } from './components/Navbar';

export const App = () => (
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
        
        {/* Client-only routes*/}
        <Route element={<PrivateRoute allowedRoles={['client']} />}>
          <Route path="/create-project" element={<CreateProject />} />
        </Route> 
        
      </Route>
    </Routes>
  </Router>
);