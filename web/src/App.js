import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import OAuth2Callback from './pages/OAuth2Callback';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Collections from './pages/Collections';
import ForgotPassword from './pages/ForgotPassword';
import SharedRecipePage from './pages/SharedRecipePage';
import ProtectedRoute from './components/common/ProtectedRoute';

const LandingWrapper = () => {
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get('error') === 'true';
  return <Landing openLoginOnLoad={hasError} />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingWrapper />} />
            <Route path="oauth2/callback" element={<OAuth2Callback />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="recipes"
              element={
                <ProtectedRoute>
                  <Recipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="recipe/:id"
              element={
                <ProtectedRoute>
                  <RecipeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-recipe"
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path="recipe/:id/edit"
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              }
            />
            <Route
              path="collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />

            <Route path="shared/:token" element={<SharedRecipePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;