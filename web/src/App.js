import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import Layout from './shared/layout/Layout';
import OAuth2Callback from './features/auth/OAuth2Callback';
import Landing from './features/legal/Landing';
import Dashboard from './features/dashboard/Dashboard';
import Profile from './features/profile/Profile';
import Recipes from './features/recipe/Recipes';
import RecipeDetail from './features/recipe/RecipeDetail';
import CreateRecipe from './features/recipe/CreateRecipe';
import Collections from './features/collection/Collections';
import CollectionDetail from './features/collection/CollectionDetail';
import SharedRecipePage from './features/recipe/SharedRecipePage';
import AdminDashboard from './features/admin/AdminDashboard';
import Settings from './features/settings/Settings';
import About from './features/legal/About';
import Privacy from './features/legal/Privacy';
import Terms from './features/legal/Terms';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';

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

            <Route path="collections/:id"
              element={
                <ProtectedRoute>
                  <CollectionDetail />
                </ProtectedRoute>
              }
            />

            <Route path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="about" element={<About />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />

            <Route path="shared/:token" element={<SharedRecipePage />} />

            {/* Admin Routes — role-gated */}
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;