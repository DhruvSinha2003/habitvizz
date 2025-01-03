import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTimezone } from "../context/TimezoneContext";
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
  const { timezone } = useTimezone();
  const [loading, setLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState(0);

  useEffect(() => {
    if (id) {
      fetchHabit();
    }
  }, [id]);

  useEffect(() => {
    if (habit) {
      generateUpcomingDates(habit);
    }
  }, [timezone, habit]);

  const calculateWeeklyProgress = (habitData) => {
    if (!habitData?.progress) {
      setWeeklyProgress(0);
      return;
    }

    const today = new Date();
    const userToday = new Date(
      today.toLocaleString("en-US", { timeZone: timezone })
    );

    const startOfWeek = new Date(userToday);
    startOfWeek.setDate(userToday.getDate() - userToday.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const uniqueCompletedDays = new Set();

    habitData.progress.forEach((p) => {
      const progressDate = new Date(p.date);
      const userProgressDate = new Date(
        progressDate.toLocaleString("en-US", { timeZone: timezone })
      );

      if (
        userProgressDate >= startOfWeek &&
        userProgressDate <= endOfWeek &&
        p.completed
      ) {
        uniqueCompletedDays.add(userProgressDate.toISOString().split("T")[0]);
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
        if (habitData.customDays?.length > 0) {
          let customDayCount = 0;
          let currentDay = new Date(startOfWeek);
          while (currentDay <= endOfWeek) {
            if (habitData.customDays.includes(currentDay.getDay())) {
              customDayCount++;
            }
            currentDay.setDate(currentDay.getDate() + 1);
          }
          requiredDays = customDayCount;
        }
        break;
      default:
        requiredDays = 7;
    }

    const progress =
      requiredDays > 0 ? (completedDays / requiredDays) * 100 : 0;
    setWeeklyProgress(Math.min(100, progress));
  };

  useEffect(() => {
    if (id) {
      fetchHabit();
    }
  }, [id]);

  useEffect(() => {
    if (habit) {
      generateUpcomingDates(habit);
      calculateWeeklyProgress(habit);
    }
  }, [habit, timezone]);

  const fetchHabit = async () => {
    try {
      const { data } = await api.get(`/api/habits/${id}`);
      if (data) {
        setHabit(data);
        generateUpcomingDates(data);
        calculateWeeklyProgress(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching habit:", err);
      toast.error("Error fetching habit");
      navigate("/");
    }
  };

  const generateUpcomingDates = (habitData) => {
    if (!habitData) return;

    const today = new Date();
    const userToday = new Date(
      today.toLocaleString("en-US", { timeZone: timezone })
    );
    userToday.setHours(0, 0, 0, 0);

    const dates = [];
    const daysToShow = 30;

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(userToday);
      currentDate.setDate(userToday.getDate() + i);

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
          if (habitData.customDays?.length > 0) {
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
          isToday: isToday(currentDate),
        });
      }
    }

    setUpcomingDates(dates);
  };

  const isDateCompleted = (date) => {
    if (!habit?.progress) return false;

    const userDate = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    userDate.setHours(0, 0, 0, 0);

    return habit.progress.some((p) => {
      const progressDate = new Date(p.date);
      const userProgressDate = new Date(
        progressDate.toLocaleString("en-US", { timeZone: timezone })
      );
      userProgressDate.setHours(0, 0, 0, 0);
      return userProgressDate.getTime() === userDate.getTime() && p.completed;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const userDate = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    const userToday = new Date(
      today.toLocaleString("en-US", { timeZone: timezone })
    );

    return (
      userDate.getFullYear() === userToday.getFullYear() &&
      userDate.getMonth() === userToday.getMonth() &&
      userDate.getDate() === userToday.getDate()
    );
  };

  const handleCompletion = async (date) => {
    if (!habit) return;

    const userDate = new Date(
      date.toLocaleString("en-US", { timeZone: timezone })
    );
    const dateStr = userDate.toISOString().split("T")[0];
    const completed = isDateCompleted(date);

    try {
      const updatedHabit = {
        ...habit,
        progress: completed
          ? habit.progress.filter(
              (p) => new Date(p.date).toISOString().split("T")[0] !== dateStr
            )
          : [...habit.progress, { date: userDate, completed: true }],
      };
      setHabit(updatedHabit);
      generateUpcomingDates(updatedHabit);

      if (completed) {
        await api.post(`/api/habits/${id}/uncomplete`, {
          date: dateStr,
          timezone,
        });
      } else {
        await api.post(`/api/habits/${id}/complete`, {
          date: dateStr,
          timezone,
        });
      }

      await fetchHabit();
    } catch (err) {
      console.error("Error updating completion status:", err);
      toast.error("Error updating completion status");
      await fetchHabit();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold">
                🔥 {habit.streak?.current || 0} days
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold">
                ⭐ {habit.streak?.longest || 0} days
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Weekly Progress</p>
              <p className="text-2xl font-bold">
                📈 {weeklyProgress.toFixed(1)}%
              </p>
            </div>
          </div>

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
                    {item.isToday && (
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleCompletion(item.date)}
                        className="w-5 h-5 cursor-pointer"
                      />
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
        </div>
      </div>
    </div>
  );
};

export default ViewHabit;
