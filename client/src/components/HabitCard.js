// src/components/HabitCard.js
import React from "react";
import { useNavigate } from "react-router-dom";

// HabitCard.js
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
      className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{habit.title}</h3>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
      </div>

      <div className="space-y-4">
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${calculateProgress()}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Frequency</span>
            <span className="font-medium">{habit.frequency}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="font-medium">{calculateProgress()}%</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Streak</span>
            <span className="font-medium">🔥 {habit.streak.current}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
