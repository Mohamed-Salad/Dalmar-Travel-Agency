import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InquiryPage from './pages/InquiryPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
