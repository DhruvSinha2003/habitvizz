// src/components/HabitCard.js
import React from "react";
import { useNavigate } from "react-router-dom";

const HabitCard = ({ habit }) => {
  const navigate = useNavigate();

  const calculateProgress = () => {
    if (!habit.progress || habit.progress.length === 0) return 0;
    const recentProgress = habit.progress.slice(-7);
    const completed = recentProgress.filter((p) => p.completed).length;
    return Math.round((completed / 7) * 100);
  };

  return (
    <div
      onClick={() => navigate(`/view-habit/${habit._id}`)}
      className="bg-theme-primary rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-theme-accent">
            {habit.title}
          </h3>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-full bg-theme-secondary/20 rounded-full h-2">
          <div
            className="bg-theme-accent h-2 rounded-full"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm text-theme-secondary">
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{habit.frequency}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✓</span>
            <span>{calculateProgress()}%</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏆</span>
            <span>{habit.streak.current}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
