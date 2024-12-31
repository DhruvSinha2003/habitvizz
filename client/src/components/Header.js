// src/components/Header.js
import {
  Cog6ToothIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-primary-dark p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white">
          HabitVizz
        </Link>

        <div className="flex items-center space-x-4">
          <button className="btn-primary">New Habit</button>

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-primary-light rounded-full"
          >
            <Cog6ToothIcon className="h-6 w-6 text-white" />
          </button>

          <div className="flex items-center space-x-2 text-white">
            <TrophyIcon className="h-6 w-6" />
            <span>10</span>
          </div>

          <div className="flex items-center space-x-2 text-white">
            <FireIcon className="h-6 w-6" />
            <span>5 days</span>
          </div>

          <div className="flex items-center space-x-2 text-white">
            <StarIcon className="h-6 w-6" />
            <span>100 pts</span>
          </div>

          <Link
            to="/profile"
            className="p-2 hover:bg-primary-light rounded-full"
          >
            <UserIcon className="h-6 w-6 text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}
