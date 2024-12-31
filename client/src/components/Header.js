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
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { user } = useAuth();
  const { toggleTheme, currentTheme } = useTheme();

  return (
    <header className="bg-theme-primary shadow-lg">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold text-theme-accent">
          HabitVizz
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/habits/new">
            <button className="btn-primary">New Habit</button>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-theme-secondary rounded-full"
            title={`Switch to ${
              currentTheme === "dark" ? "light" : "dark"
            } mode`}
          >
            <Cog6ToothIcon className="h-6 w-6 text-theme-accent" />
          </button>

          <div className="flex items-center space-x-2 text-theme-accent">
            <TrophyIcon className="h-6 w-6" />
            <span>10</span>
          </div>

          <div className="flex items-center space-x-2 text-theme-accent">
            <FireIcon className="h-6 w-6" />
            <span>5 days</span>
          </div>

          <div className="flex items-center space-x-2 text-theme-accent">
            <StarIcon className="h-6 w-6" />
            <span>100 pts</span>
          </div>

          <Link
            to="/profile"
            className="p-2 hover:bg-theme-secondary rounded-full"
          >
            <UserIcon className="h-6 w-6 text-theme-accent" />
          </Link>
        </div>
      </div>
    </header>
  );
}
