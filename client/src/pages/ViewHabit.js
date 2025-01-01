import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ViewHabit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [upcomingDates, setUpcomingDates] = useState([]);

  const getNextOccurrences = (habit) => {
    const today = new Date();
    const dates = [];

    if (habit.frequency === "daily") {
      // Next 7 days for daily habits
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
    } else if (habit.frequency === "weekly") {
      // Next occurrence of each selected day this week
      const dayOfWeek = today.getDay();
      const thisWeek = new Date(today);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + (7 - dayOfWeek));

      dates.push(thisWeek);
      dates.push(nextWeek);
    } else if (habit.frequency === "custom") {
      if (habit.customFrequency?.includes("week")) {
        // Handle weekly custom frequency
        habit.customDays.forEach((day) => {
          const date = new Date();
          const currentDay = date.getDay();
          const daysUntilNext = (day - currentDay + 7) % 7;
          date.setDate(date.getDate() + daysUntilNext);
          dates.push(date);

          // Add next week's date too
          const nextWeekDate = new Date(date);
          nextWeekDate.setDate(date.getDate() + 7);
          dates.push(nextWeekDate);
        });
      } else if (habit.customFrequency?.includes("month")) {
        // Handle monthly custom frequency
        const currentDate = today.getDate();
        habit.customDays.forEach((day) => {
          if (day >= currentDate) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            dates.push(date);
          }
          const nextMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            day
          );
          dates.push(nextMonth);
        });
      }
    }

    return dates.sort((a, b) => a - b);
  };

  const isDateCompleted = (date) => {
    if (!habit.progress) return false;
    return habit.progress.some((p) => {
      const progressDate = new Date(p.date);
      return progressDate.toDateString() === date.toDateString() && p.completed;
    });
  };

  const handleCompletion = async (date) => {
    try {
      let completionDates = [date];

      // For weekly habits, mark the whole week
      if (
        habit.frequency === "weekly" ||
        (habit.frequency === "custom" &&
          habit.customFrequency?.includes("week"))
      ) {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        for (let i = 0; i < 7; i++) {
          const weekDate = new Date(startOfWeek);
          weekDate.setDate(startOfWeek.getDate() + i);
          completionDates.push(weekDate);
        }
      }
      // For monthly habits, mark the whole month
      else if (
        habit.frequency === "custom" &&
        habit.customFrequency?.includes("month")
      ) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
          completionDates.push(new Date(year, month, i));
        }
      }

      // Remove duplicates and format dates
      completionDates = [
        ...new Set(completionDates.map((d) => d.toISOString())),
      ];

      const response = await api.put(`/api/habits/${id}`, {
        ...habit,
        progress: [
          ...habit.progress,
          ...completionDates.map((date) => ({
            date,
            completed: true,
            notes: "Completed",
          })),
        ],
      });

      setHabit(response.data);

      // Show motivational message
      const messages = [
        "Great job! Keep up the momentum! 🎉",
        "You're crushing it! 💪",
        "Another step toward your goals! ⭐",
        "Consistency is key, and you're nailing it! 🔥",
        "Excellence becomes a habit, and you're proving it! 🌟",
      ];
      toast.success(messages[Math.floor(Math.random() * messages.length)]);
    } catch (err) {
      toast.error("Error updating habit completion");
    }
  };

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data } = await api.get(`/api/habits/${id}`);
        setHabit(data);
        setUpcomingDates(getNextOccurrences(data));
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
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header Section */}
        <div className="bg-theme-accent rounded-t-xl p-8">
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
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Current Streak</div>
              <div className="text-3xl font-bold text-theme-accent">
                🔥 {habit.streak.current}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  days
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Longest Streak</div>
              <div className="text-3xl font-bold text-theme-accent">
                ⭐ {habit.streak.longest}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  days
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="text-theme-secondary mb-2">Weekly Progress</div>
              <div className="text-3xl font-bold text-theme-accent">
                📈 {calculateProgress()}
                <span className="text-lg font-normal text-theme-secondary ml-1">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Occurrences */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-theme-accent mb-4">
              Upcoming Schedule
            </h2>
            <div className="space-y-3">
              {upcomingDates.map((date, index) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const completed = isDateCompleted(date);

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${
                      isToday ? "bg-theme-accent/10" : "bg-white"
                    } rounded-lg border border-gray-200`}
                  >
                    <div className="flex items-center space-x-4">
                      {isToday && !completed ? (
                        <input
                          type="checkbox"
                          checked={completed}
                          onChange={() => handleCompletion(date)}
                          className="w-5 h-5 text-theme-accent rounded focus:ring-theme-accent"
                        />
                      ) : (
                        <span className="text-2xl">
                          {completed ? "✅" : "⭕"}
                        </span>
                      )}
                      <span className="font-medium">
                        {date.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {isToday && " (Today)"}
                      </span>
                    </div>
                    {completed && (
                      <span className="text-green-600 font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-theme-accent mb-4">
              Habit Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-theme-secondary mb-1">Category</div>
                <div className="font-medium">
                  {habit.category === "custom"
                    ? habit.customCategory
                    : habit.category}
                </div>
              </div>
              <div>
                <div className="text-theme-secondary mb-1">Frequency</div>
                <div className="font-medium">
                  {habit.frequency === "custom"
                    ? habit.customFrequency
                    : habit.frequency}
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default ViewHabit;
