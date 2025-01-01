import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

const CustomFrequencyForm = ({ formData, setFormData }) => {
  const [frequencyType, setFrequencyType] = useState("week");
  const [selectedDays, setSelectedDays] = useState([]);
  const [monthlyDays, setMonthlyDays] = useState([]);
  const [yearlyDates, setYearlyDates] = useState([]);

  useEffect(() => {
    if (formData.customDays) {
      setSelectedDays(formData.customDays);
    }
  }, [formData.customDays]);

  const handleFrequencyTypeChange = (type) => {
    setFrequencyType(type);
    setSelectedDays([]);
    setMonthlyDays([]);
    setYearlyDates([]);
    setFormData({
      ...formData,
      customDays: [],
      customFrequency: `custom times per ${type}`,
    });
  };

  const handleDayToggle = (dayIndex) => {
    const updatedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex];

    setSelectedDays(updatedDays);
    setFormData({
      ...formData,
      customDays: updatedDays,
      customFrequency: `${updatedDays.length} times per ${frequencyType}`,
    });
  };

  const handleMonthlyDayChange = (e) => {
    const day = parseInt(e.target.value);
    if (day >= 1 && day <= 31) {
      const updatedDays = monthlyDays.includes(day)
        ? monthlyDays.filter((d) => d !== day)
        : [...monthlyDays, day];
      setMonthlyDays(updatedDays);
      setFormData({
        ...formData,
        customDays: updatedDays,
        customFrequency: `${updatedDays.length} times per month`,
      });
    }
  };

  const handleYearlyDateAdd = (month, day) => {
    if (day >= 1 && day <= 31) {
      const dateString = `${month}-${day}`;
      const updatedDates = yearlyDates.includes(dateString)
        ? yearlyDates.filter((d) => d !== dateString)
        : [...yearlyDates, dateString];
      setYearlyDates(updatedDates);
      setFormData({
        ...formData,
        customDays: updatedDates.map((date) => {
          const [m, d] = date.split("-");
          return MONTHS.indexOf(m) * 31 + parseInt(d);
        }),
        customFrequency: `${updatedDates.length} times per year`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => handleFrequencyTypeChange("week")}
          className={`px-4 py-2 rounded ${
            frequencyType === "week"
              ? "bg-theme-accent text-white"
              : "bg-gray-200"
          }`}
        >
          Weekly
        </button>
        <button
          type="button"
          onClick={() => handleFrequencyTypeChange("month")}
          className={`px-4 py-2 rounded ${
            frequencyType === "month"
              ? "bg-theme-accent text-white"
              : "bg-gray-200"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => handleFrequencyTypeChange("year")}
          className={`px-4 py-2 rounded ${
            frequencyType === "year"
              ? "bg-theme-accent text-white"
              : "bg-gray-200"
          }`}
        >
          Yearly
        </button>
      </div>

      {frequencyType === "week" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map((day, index) => (
            <label
              key={day}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDays.includes(index)}
                onChange={() => handleDayToggle(index)}
                className="form-checkbox h-5 w-5 text-theme-accent"
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      )}

      {frequencyType === "month" && (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <label
              key={day}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={monthlyDays.includes(day)}
                onChange={handleMonthlyDayChange}
                value={day}
                className="form-checkbox h-5 w-5 text-theme-accent"
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
      )}

      {frequencyType === "year" && (
        <div className="space-y-4">
          {MONTHS.map((month) => (
            <div key={month} className="space-y-2">
              <h4 className="font-medium">{month}</h4>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <label
                    key={`${month}-${day}`}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={yearlyDates.includes(`${month}-${day}`)}
                      onChange={() => handleYearlyDateAdd(month, day)}
                      className="form-checkbox h-5 w-5 text-theme-accent"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HabitForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    customCategory: "",
    frequency: "daily",
    customFrequency: "",
    customDays: [],
    color: "#008170",
    priority: 3,
    streak: {
      current: 0,
      longest: 0,
    },
  });

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data } = await api.get(`/api/habits/${id}`);
        if (data.user.toString() !== user.id.toString()) {
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        setFormData({
          ...data,
          customCategory: data.category === "custom" ? data.customCategory : "",
          customFrequency:
            data.frequency === "custom" ? data.customFrequency : "",
        });
        setIsLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching habit");
        navigate("/");
      }
    };

    if (isEdit) {
      fetchHabit();
    }
  }, [id, navigate, user.id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        customCategory:
          formData.category === "custom" ? formData.customCategory : undefined,
        customFrequency:
          formData.frequency === "custom"
            ? formData.customFrequency
            : undefined,
      };

      if (isEdit) {
        await api.put(`/api/habits/${id}`, dataToSubmit);
        toast.success("Habit updated successfully!");
      } else {
        await api.post("/api/habits", dataToSubmit);
        toast.success("Habit created successfully!");
      }
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Error ${isEdit ? "updating" : "creating"} habit`
      );
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        await api.delete(`/api/habits/${id}`);
        toast.success("Habit deleted successfully!");
        navigate("/");
      } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting habit");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? `Edit ${formData.title}` : "Create New Habit"}
          </h1>
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Habit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              placeholder="Enter habit title"
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent min-h-[100px]"
              placeholder="Describe your habit"
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
            >
              <option value="health">Health</option>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="fitness">Fitness</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="productivity">Productivity</option>
              <option value="social">Social</option>
              <option value="finance">Finance</option>
              <option value="custom">Custom</option>
              <option value="other">Other</option>
            </select>

            {formData.category === "custom" && (
              <input
                type="text"
                value={formData.customCategory}
                onChange={(e) =>
                  setFormData({ ...formData, customCategory: e.target.value })
                }
                className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
                placeholder="Enter custom category"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>

            {formData.frequency === "custom" && (
              <div className="mt-4">
                <CustomFrequencyForm
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">
              Priority (1-5)
              {isEdit && (
                <span className="ml-2 text-gray-500">
                  Current: {formData.priority}
                </span>
              )}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-700 font-medium">
                {formData.priority}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-24 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
              />
              <span className="text-gray-500">
                Selected color: {formData.color}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 border-2 border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-theme-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {isEdit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Current Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold text-theme-accent">
                  🔥 {formData.streak.current} days
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">Longest Streak</p>
                <p className="text-2xl font-bold text-theme-accent">
                  ⭐ {formData.streak.longest} days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create the specific components for New and Edit habits
export const NewHabit = () => {
  return <HabitForm isEdit={false} />;
};

export const EditHabit = () => {
  return <HabitForm isEdit={true} />;
};

export default HabitForm;
