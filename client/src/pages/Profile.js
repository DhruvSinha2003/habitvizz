// src/pages/Profile.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-primary p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>

        <div className="mb-6">
          <p className="text-white">
            <span className="font-semibold">Username:</span> {user?.username}
          </p>
        </div>

        <button onClick={handleLogout} className="btn-primary w-full">
          Logout
        </button>
      </div>
    </div>
  );
}
