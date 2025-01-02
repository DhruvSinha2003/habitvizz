import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const HabitCard = ({ habit: initialHabit }) => {
  const navigate = useNavigate();
  const [habit, setHabit] = useState(initialHabit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestHabitData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/habits/${initialHabit._id}`);
        setHabit(data);
      } catch (err) {
        console.error("Error fetching habit data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestHabitData();
  }, [initialHabit._id]);

  const calculateProgress = () => {
    if (!habit.progress || habit.progress.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const recentProgress = habit.progress.filter((p) => {
      const progressDate = new Date(p.date);
      return progressDate >= weekAgo && progressDate <= today;
    });

    const completed = recentProgress.filter((p) => p.completed).length;
    return Math.round((completed / 7) * 100);
  };

  const handleCardClick = () => {
    navigate(`/view-habit/${habit._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-theme-primary rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
        loading ? "opacity-50" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-theme-accent">
          {habit.title}
        </h3>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
      </div>

      <div className="space-y-4">
        <div className="w-full bg-theme-secondary/20 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${calculateProgress()}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-2 bg-theme-secondary/10 rounded-lg">
            <span className="text-sm text-theme-secondary">Frequency</span>
            <span className="font-medium text-theme-accent">
              {habit.frequency}
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-theme-secondary/10 rounded-lg">
            <span className="text-sm text-theme-secondary">Progress</span>
            <span className="font-medium text-theme-accent">
              {calculateProgress()}%
            </span>
          </div>
          <div className="flex flex-col items-center p-2 bg-theme-secondary/10 rounded-lg">
            <span className="text-sm text-theme-secondary">Streak</span>
            <span className="font-medium text-theme-accent">
              🔥 {habit.streak.current}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
