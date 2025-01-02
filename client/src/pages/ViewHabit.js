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
  const [loading, setLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  useEffect(() => {
    if (id) {
      fetchHabit();
    }
  }, [id]);

  const fetchHabit = async () => {
    try {
      const { data } = await api.get(`/api/habits/${id}`);
      if (data) {
        const processedData = {
          ...data,
          progress:
            data.progress?.map((p) => ({
              ...p,
              date: new Date(p.date),
            })) || [],
        };
        setHabit(processedData);
        generateUpcomingDates(processedData);
        calculateWeeklyProgress(processedData);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching habit:", err);
      toast.error("Error fetching habit");
      navigate("/");
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDateCompleted = (date) => {
    if (!habit?.progress) return false;

    // First check optimistic updates
    const dateStr = date.toISOString().split("T")[0];
    if (optimisticUpdates[dateStr] !== undefined) {
      return optimisticUpdates[dateStr];
    }

    // Then check actual progress
    return habit.progress.some((p) => {
      // Convert both dates to local midnight
      const progressDate = new Date(p.date);
      const compareDate = new Date(date);

      // Convert to local date strings for comparison
      const progressDateStr = progressDate.toLocaleDateString();
      const compareDateStr = compareDate.toLocaleDateString();

      return progressDateStr === compareDateStr && p.completed;
    });
  };

  const generateUpcomingDates = (habitData) => {
    if (!habitData) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    const daysToShow = 30;

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let shouldShow = false;
      const dayOfWeek = currentDate.getDay();

      switch (habitData.frequency) {
        case "daily":
          shouldShow = true;
          break;
        case "weekly":
          shouldShow = dayOfWeek === 1;
          break;
        case "custom":
          if (habitData.customDays && habitData.customDays.length > 0) {
            shouldShow = habitData.customDays.includes(dayOfWeek);
          }
          break;
        default:
          shouldShow = true;
      }

      if (shouldShow) {
        dates.push({
          date: currentDate,
          completed: isDateCompleted(currentDate),
          isToday: isSameDay(currentDate, today),
        });
      }
    }

    setUpcomingDates(dates);
  };

  const calculateWeeklyProgress = (habitData) => {
    if (!habitData?.progress) {
      setWeeklyProgress(0);
      return;
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const uniqueCompletedDays = new Set();

    // Include both actual progress and optimistic updates
    habitData.progress.forEach((p) => {
      const date = new Date(p.date);
      const dateStr = date.toLocaleDateString(); // Use local date string for consistency
      if (date >= startOfWeek && date <= endOfWeek && p.completed) {
        uniqueCompletedDays.add(dateStr);
      }
    });

    // Add optimistic updates
    Object.entries(optimisticUpdates).forEach(([dateStr, completed]) => {
      const date = new Date(dateStr);
      if (date >= startOfWeek && date <= endOfWeek) {
        if (completed) {
          uniqueCompletedDays.add(date.toLocaleDateString());
        } else {
          uniqueCompletedDays.delete(date.toLocaleDateString());
        }
      }
    });

    const completedDays = uniqueCompletedDays.size;
    let requiredDays = 0;

    switch (habitData.frequency) {
      case "daily":
        requiredDays = 7;
        break;
      case "weekly":
        requiredDays = 1;
        break;
      case "custom":
        if (habitData.customDays) {
          requiredDays = habitData.customDays.length;
        }
        break;
      default:
        requiredDays = 7;
    }

    const progress =
      requiredDays > 0 ? (completedDays / requiredDays) * 100 : 0;
    setWeeklyProgress(Math.min(100, progress));
  };

  const handleCompletion = async (date) => {
    if (!habit || !date) return;

    const dateStr = date.toISOString().split("T")[0];
    const isCompleted = isDateCompleted(date);

    // Optimistically update UI
    setOptimisticUpdates((prev) => ({
      ...prev,
      [dateStr]: !isCompleted,
    }));

    try {
      // Make API call
      if (isCompleted) {
        await api.post(`/api/habits/${id}/uncomplete`, { date: dateStr });
      } else {
        await api.post(`/api/habits/${id}/complete`, { date: dateStr });
      }

      // Fetch latest data to sync with server
      await fetchHabit();

      // Clear optimistic update for this date
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[dateStr];
        return newUpdates;
      });
    } catch (err) {
      console.error("Error updating completion status:", err);
      toast.error("Error updating completion status");

      // Revert optimistic update
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[dateStr];
        return newUpdates;
      });

      // Refresh data
      await fetchHabit();
    }
  };

  const getFrequencyDisplay = (habit) => {
    if (!habit) return "";

    switch (habit.frequency) {
      case "daily":
        return "Every day";
      case "weekly":
        return "Every Monday";
      case "custom":
        if (habit.customFrequency?.includes("week")) {
          const days = habit.customDays
            ?.map((dayIndex) => DAYS_OF_WEEK[dayIndex])
            .join(", ");
          return `Every ${days}`;
        }
        if (habit.customFrequency?.includes("month")) {
          const days = habit.customDays
            ?.map((day) => `${day}${getOrdinalSuffix(day)}`)
            .join(", ");
          return `Monthly on: ${days}`;
        }
        if (habit.customFrequency?.includes("year")) {
          const dates = habit.customDays
            ?.map((encoded) => {
              const month = Math.floor(encoded / 31);
              const day = encoded % 31;
              return `${MONTHS[month]} ${day}${getOrdinalSuffix(day)}`;
            })
            .join(", ");
          return `Yearly on: ${dates}`;
        }
        return habit.customFrequency || "Custom";
      default:
        return "Daily";
    }
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent"></div>
        </div>
      </div>
    );
  }

  if (!habit) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6" style={{ backgroundColor: habit.color + "20" }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{habit.title}</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/habits/${id}/edit`)}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
          <p className="text-gray-600">{habit.description}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Current Streak</p>
              <p className="text-2xl font-bold">
                🔥 {habit.streak?.current || 0} days
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Longest Streak</p>
              <p className="text-2xl font-bold">
                ⭐ {habit.streak?.longest || 0} days
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Weekly Progress</p>
              <p className="text-2xl font-bold">
                📈 {weeklyProgress.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Frequency</p>
              <p className="text-lg font-medium">
                {getFrequencyDisplay(habit)}
              </p>
            </div>
          </div>

          {/* Upcoming Dates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
            <div className="space-y-2">
              {upcomingDates.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    item.isToday
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        item.isToday && handleCompletion(item.date)
                      }
                      className={`text-xl ${
                        !item.isToday
                          ? "cursor-default"
                          : "cursor-pointer hover:opacity-80"
                      }`}
                      disabled={!item.isToday}
                    >
                      {item.completed ? "✅" : "⭕"}
                    </button>
                    <span>
                      {item.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                      {item.isToday && " (Today)"}
                    </span>
                  </div>
                  {item.completed && (
                    <span className="text-green-600">Completed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Category</p>
              <p className="font-medium">
                {habit.category === "custom"
                  ? habit.customCategory
                  : habit.category || "Uncategorized"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Priority</p>
              <p className="font-medium">{habit.priority || 1} / 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHabit;
