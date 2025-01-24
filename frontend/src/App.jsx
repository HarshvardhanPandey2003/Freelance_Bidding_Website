import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  { AuthForm }  from './components/auth/AuthForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Add your new route for the AuthForm */}
        <Route path="api/auth/test-form" element={<AuthForm />} />

        {/* Add other routes here if needed */}
        <Route path="/" element={<h1>Welcome to the Freelance Bidding Website</h1>} />
      </Routes>
    </Router>
  );
}

export default App;