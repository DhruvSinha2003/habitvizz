// src/pages/Register.js
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-theme-accent mb-2">
            HabitVizz
          </h1>
          <h2 className="text-xl text-theme-secondary">Create your account</h2>
        </div>

        {/* Register Form */}
        <div className="bg-theme-primary rounded-xl shadow-xl p-8 space-y-6 transform transition-all hover:scale-[1.01]">
          {error && (
            <div className="bg-red-800/80 text-white p-4 rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-theme-accent" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="block w-full pl-10 pr-3 py-3 border border-theme-secondary rounded-lg bg-theme-background text-theme-accent placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-theme-accent" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="block w-full pl-10 pr-3 py-3 border border-theme-secondary rounded-lg bg-theme-background text-theme-accent placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-theme-accent" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="block w-full pl-10 pr-3 py-3 border border-theme-secondary rounded-lg bg-theme-background text-theme-accent placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-theme-accent" />
                </div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="block w-full pl-10 pr-3 py-3 border border-theme-secondary rounded-lg bg-theme-background text-theme-accent placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-theme-secondary text-white py-3 rounded-lg font-semibold transform transition-all hover:bg-theme-accent disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-theme-accent">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-theme-secondary hover:text-theme-accent transition-colors font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
