// src/App.js
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TimezoneProvider } from "./context/TimezoneContext";
import { default as EditHabit, default as NewHabit } from "./pages/HabitForm";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ViewHabit from "./pages/ViewHabit";

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
      <div className="min-h-screen bg-theme-background">
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
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits/new"
            element={
              <ProtectedRoute>
                <NewHabit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits/:id/edit"
            element={
              <ProtectedRoute>
                <EditHabit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-habit/:id"
            element={
              <ProtectedRoute>
                <ViewHabit />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <TimezoneProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </TimezoneProvider>
    </AuthProvider>
  );
}

export default AppWrapper;
