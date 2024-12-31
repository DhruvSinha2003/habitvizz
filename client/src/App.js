// src/App.js
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Header />}
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-primary-dark">
                {/* Your dashboard content will go here */}
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;
