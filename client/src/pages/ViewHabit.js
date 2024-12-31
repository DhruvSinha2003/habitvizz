// src/pages/ViewHabit.js
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

  if (!habit) return <div>Loading...</div>;

  const calculateProgress = () => {
    if (!habit.progress || habit.progress.length === 0) return 0;
    const recentProgress = habit.progress.slice(-7);
    const completed = recentProgress.filter((p) => p.completed).length;
    return Math.round((completed / 7) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-theme-primary rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-theme-accent">
            {habit.title}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/habits/${id}/edit`)}
              className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-opacity-90"
            >
              Edit
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent hover:text-white"
            >
              Back
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-theme-accent mb-2">
              Description
            </h2>
            <p className="text-theme-secondary">
              {habit.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-theme-accent mb-2">
                Details
              </h2>
              <div className="space-y-2">
                <p className="text-theme-secondary">
                  Category: {habit.category}
                </p>
                <p className="text-theme-secondary">
                  Frequency: {habit.frequency}
                </p>
                <p className="text-theme-secondary">
                  Priority: {habit.priority}/5
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-theme-accent mb-2">
                Progress
              </h2>
              <div className="space-y-2">
                <p className="text-theme-secondary">
                  Current Streak: {habit.streak.current} days
                </p>
                <p className="text-theme-secondary">
                  Longest Streak: {habit.streak.longest} days
                </p>
                <p className="text-theme-secondary">
                  Weekly Progress: {calculateProgress()}%
                </p>
              </div>
            </div>
          </div>

          {habit.progress && habit.progress.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-theme-accent mb-2">
                Recent Activity
              </h2>
              <div className="space-y-2">
                {habit.progress.slice(-5).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 text-theme-secondary"
                  >
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <span>
                      {entry.completed ? "✅ Completed" : "❌ Missed"}
                    </span>
                    {entry.notes && <span>📝 {entry.notes}</span>}
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
