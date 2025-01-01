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

  useEffect(() => {
    fetchHabit();
  }, [id]);

  const fetchHabit = async () => {
    try {
      const { data } = await api.get(`/api/habits/${id}`);
      setHabit(data);
      generateUpcomingDates(data);
      setLoading(false);
    } catch (err) {
      toast.error("Error fetching habit");
      navigate("/");
    }
  };

  const generateUpcomingDates = (habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    const daysToShow = 30;

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let shouldShow = false;

      switch (habit.frequency) {
        case "daily":
          shouldShow = true;
          break;

        case "weekly":
          shouldShow = currentDate.getDay() === 1;
          break;

        case "custom":
          if (habit.customFrequency?.includes("week")) {
            shouldShow = habit.customDays.includes(currentDate.getDay());
          } else if (habit.customFrequency?.includes("month")) {
            shouldShow = habit.customDays.includes(currentDate.getDate());
          } else if (habit.customFrequency?.includes("year")) {
            const monthIndex = currentDate.getMonth();
            const day = currentDate.getDate();
            const encodedDate = monthIndex * 31 + day;
            shouldShow = habit.customDays.includes(encodedDate);
          }
          break;
        default:
          break;
      }

      if (shouldShow) {
        dates.push({
          date: currentDate,
          completed: isDateCompleted(currentDate, habit),
          isToday: currentDate.getTime() === today.getTime(),
        });
      }
    }

    setUpcomingDates(dates);
  };

  const isDateCompleted = (date, habit) => {
    if (!habit?.completions) return false;
    const dateStr = date.toISOString().split("T")[0];
    return habit.completions.includes(dateStr);
  };

  const handleCompletion = async (date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const isCompleted = isDateCompleted(date, habit);

      if (isCompleted) {
        await api.post(`/api/habits/${id}/uncomplete`, { date: dateStr });
        toast.success("Progress removed");
      } else {
        await api.post(`/api/habits/${id}/complete`, { date: dateStr });
        toast.success("Great job! Keep it up! 🎉");
      }

      fetchHabit();
    } catch (err) {
      toast.error("Error updating completion status");
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
            .map((dayIndex) => DAYS_OF_WEEK[dayIndex])
            .join(", ");
          return `Every ${days}`;
        }
        if (habit.customFrequency?.includes("month")) {
          const days = habit.customDays
            .map((day) => `${day}${getOrdinalSuffix(day)}`)
            .join(", ");
          return `Monthly on: ${days}`;
        }
        if (habit.customFrequency?.includes("year")) {
          const dates = habit.customDays
            .map((encoded) => {
              const month = Math.floor(encoded / 31);
              const day = encoded % 31;
              return `${MONTHS[month]} ${day}${getOrdinalSuffix(day)}`;
            })
            .join(", ");
          return `Yearly on: ${dates}`;
        }
        return habit.customFrequency;
      default:
        return habit.frequency;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {item.isToday ? (
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleCompletion(item.date)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-xl">
                        {item.completed ? "✅" : "⭕"}
                      </span>
                    )}
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
                  : habit.category}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-1">Priority</p>
              <p className="font-medium">{habit.priority} / 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHabit;
