import {
  Cog6ToothIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTimezone } from "../context/TimezoneContext";
import TimezoneSelector from "./TimezoneSelector";

export default function Header() {
  const { user } = useAuth();
  const { toggleTheme, currentTheme } = useTheme();
  const { timezone } = useTimezone();
  const [showSettings, setShowSettings] = useState(false);
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);

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

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-theme-secondary rounded-full"
            >
              <Cog6ToothIcon className="h-6 w-6 text-theme-accent" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowSettings(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Toggle Theme
                  </button>

                  <div className="px-4 py-2">
                    <div className="text-sm text-gray-500">
                      Current timezone: {timezone}
                    </div>
                    <button
                      onClick={() => {
                        setShowTimezoneSelector(true);
                        setShowSettings(false);
                      }}
                      className="w-full text-left py-1 hover:text-blue-600"
                    >
                      Set Timezone
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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

      {showTimezoneSelector && (
        <TimezoneSelector onClose={() => setShowTimezoneSelector(false)} />
      )}
    </header>
  );
}
