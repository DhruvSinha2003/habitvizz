// src/pages/EditHabit.js
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const EditHabit = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const { data } = await api.get(`/api/habits/${id}`);
        // Verify habit belongs to current user
        if (data.user.toString() !== user.id.toString()) {
          toast.error("Unauthorized access");
          navigate("/");
          return;
        }
        setFormData(data);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Please login again");
          navigate("/login");
        } else {
          toast.error("Error fetching habit details");
          navigate("/");
        }
      }
    };

    fetchHabit();
  }, [id, navigate, user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/habits/${id}`, formData);
      toast.success("Habit updated successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating habit");
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

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-theme-accent">Edit Habit</h1>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Delete Habit
        </button>
      </div>

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
          />
        </div>

        <div>
          <label className="block text-theme-secondary mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-theme-secondary mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              className="w-full p-2 border border-theme-secondary rounded-lg focus:outline-none focus:border-theme-accent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-opacity-90"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHabit;
