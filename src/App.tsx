import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InquiryPage from './pages/InquiryPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersListPage from './pages/CustomersListPage';
import CustomersPage from './pages/CustomersPage';
import CoordinationPage from './pages/CoordinationPage';
import QuotePage from './pages/QuotePage';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard"     element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/customers"     element={<AuthGuard><CustomersListPage /></AuthGuard>} />
        <Route path="/customers/:id" element={<AuthGuard><CustomersPage /></AuthGuard>} />
        <Route path="/coordination"  element={<AuthGuard><CoordinationPage /></AuthGuard>} />
        <Route path="/quote"         element={<AuthGuard><QuotePage /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
