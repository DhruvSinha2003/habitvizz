import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const NewHabit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    customCategory: "",
    frequency: "daily",
    customDays: [],
    color: "#008170",
    priority: 3,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        user: user.id, // Include user ID from auth context
        customCategory:
          formData.category === "custom" ? formData.customCategory : undefined,
      };
      await api.post("/api/habits", dataToSubmit);
      toast.success("Habit created successfully!");
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login again");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Error creating habit");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-theme-primary rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-theme-accent mb-6">
          Create New Habit
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-theme-secondary mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
              placeholder="Enter habit title"
            />
          </div>

          <div>
            <label className="block text-theme-secondary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent min-h-[100px]"
              placeholder="Describe your habit"
            />
          </div>

          <div>
            <label className="block text-theme-secondary mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
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
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, customCategory: e.target.value })
                  }
                  className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
                  placeholder="Enter custom category"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-theme-secondary mb-2">
                Priority (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
              />
            </div>

            <div>
              <label className="block text-theme-secondary mb-2">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-10 p-1 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewHabit;
