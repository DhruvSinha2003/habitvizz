// src/pages/Login.js
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex items-center justify-center">
      <div className="bg-primary p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">
          Login to HabitVizz
        </h2>

        {error && (
          <div className="bg-red-800 text-white p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 rounded bg-primary-dark text-white"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 rounded bg-primary-dark text-white"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>

        <p className="mt-4 text-white text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-light hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
