// ViewHabit.js
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const ViewHabit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data } = await api.get(`/api/habits/${id}`);
        setHabit(data);
      } catch (err) {
        toast.error("Error fetching habit details");
        navigate("/");
      }
    };

    fetchHabit();
  }, [id, navigate]);

  if (!habit)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent"></div>
      </div>
    );

  const calculateProgress = () => {
    if (!habit.progress || habit.progress.length === 0) return 0;
    const recentProgress = habit.progress.slice(-7);
    const completed = recentProgress.filter((p) => p.completed).length;
    return Math.round((completed / 7) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-theme-primary rounded-xl shadow-lg">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-theme-accent to-theme-accent/80 rounded-t-xl p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {habit.title}
              </h1>
              <p className="text-white/80">
                {habit.description || "No description provided"}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/habits/${id}/edit`)}
                className="px-4 py-2 bg-white text-theme-accent rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Current Streak</div>
              <div className="text-3xl font-bold text-theme-accent">
                🔥 {habit.streak.current}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  days
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Longest Streak</div>
              <div className="text-3xl font-bold text-theme-accent">
                ⭐ {habit.streak.longest}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  days
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Weekly Progress</div>
              <div className="text-3xl font-bold text-theme-accent">
                📈 {calculateProgress()}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-theme-accent mb-4">
              Habit Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-theme-secondary mb-1">Category</div>
                <div className="font-medium">{habit.category}</div>
              </div>
              <div>
                <div className="text-theme-secondary mb-1">Frequency</div>
                <div className="font-medium">{habit.frequency}</div>
              </div>
              <div>
                <div className="text-theme-secondary mb-1">Priority</div>
                <div className="font-medium">{habit.priority}/5</div>
              </div>
              <div>
                <div className="text-theme-secondary mb-1">Color</div>
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="font-medium">{habit.color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {habit.progress && habit.progress.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-theme-accent mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {habit.progress.slice(-5).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">
                        {entry.completed ? "✅" : "❌"}
                      </span>
                      <span className="font-medium">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {entry.notes && (
                      <span className="text-theme-secondary italic">
                        "{entry.notes}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewHabit;
