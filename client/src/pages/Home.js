import React from "react";
import { useAuth } from "../context/AuthContext";

const HeatmapPlaceholder = () => (
  <div className="bg-theme-primary h-64 rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-theme-accent mb-4">
      Habit Tracking Heatmap
    </h3>
    <div className="w-full h-full bg-theme-secondary/20 rounded-lg flex items-center justify-center">
      <p className="text-theme-secondary">Heatmap visualization coming soon</p>
    </div>
  </div>
);

const TaskChecklist = () => (
  <div className="bg-theme-primary h-64 rounded-xl shadow-lg p-6">
    <h3 className="text-xl font-semibold text-theme-accent mb-4">
      Upcoming Tasks
    </h3>
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="rounded text-theme-accent focus:ring-theme-accent"
        />
        <span className="text-theme-secondary">Complete morning routine</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="rounded text-theme-accent focus:ring-theme-accent"
        />
        <span className="text-theme-secondary">Exercise for 30 minutes</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="rounded text-theme-accent focus:ring-theme-accent"
        />
        <span className="text-theme-secondary">Read 20 pages</span>
      </div>
    </div>
  </div>
);

const HabitCard = ({ title = "Habit", progress = 0 }) => (
  <div className="bg-theme-primary p-6 rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-theme-accent mb-2">{title}</h3>
    <div className="w-full bg-theme-secondary/20 rounded-full h-2">
      <div
        className="bg-theme-accent h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="mt-2 text-theme-secondary text-sm">{progress}% Complete</p>
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-bold text-theme-accent">
            Hello, {user?.username || "User"}
          </h1>
          <p className="text-theme-accent mt-2">
            Track your progress and build better habits
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Section */}
          <div className="lg:col-span-2">
            <HeatmapPlaceholder />
          </div>

          {/* Task Checklist Section */}
          <div>
            <TaskChecklist />
          </div>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <HabitCard title="Morning Routine" progress={75} />
          <HabitCard title="Exercise" progress={60} />
          <HabitCard title="Reading" progress={45} />
          <HabitCard title="Meditation" progress={90} />
        </div>
      </div>
    </div>
  );
}
