import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import OAuth2Callback from './pages/OAuth2Callback';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const LandingWrapper = () => {
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get('error') === 'true';
  return <Landing openLoginOnLoad={hasError} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingWrapper />} />
            <Route path="oauth2/callback" element={<OAuth2Callback />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;