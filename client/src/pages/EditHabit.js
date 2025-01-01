// import React, { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import api from "../utils/api";

// const EditHabit = () => {
//   const { user } = useAuth();
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Initialize form data with all required fields including custom inputs
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "other",
//     customCategory: "",
//     frequency: "daily",
//     customFrequency: "",
//     customDays: [],
//     color: "#008170",
//     priority: 3,
//     streak: {
//       current: 0,
//       longest: 0,
//     },
//   });

//   // Fetch existing habit data when component mounts
//   useEffect(() => {
//     const fetchHabit = async () => {
//       try {
//         const { data } = await api.get(`/api/habits/${id}`);
//         // Security check: Verify habit belongs to current user
//         if (data.user.toString() !== user.id.toString()) {
//           toast.error("Unauthorized access");
//           navigate("/");
//           return;
//         }
//         // Set form data with existing habit information
//         setFormData({
//           ...data,
//           customCategory: data.category === "custom" ? data.customCategory : "",
//           customFrequency:
//             data.frequency === "custom" ? data.customFrequency : "",
//         });
//       } catch (err) {
//         if (err.response?.status === 401) {
//           toast.error("Please login again");
//           navigate("/login");
//         } else {
//           toast.error("Error fetching habit details");
//           navigate("/");
//         }
//       }
//     };

//     fetchHabit();
//   }, [id, navigate, user.id]);

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Prepare data for submission
//       const dataToSubmit = {
//         ...formData,
//         customCategory:
//           formData.category === "custom" ? formData.customCategory : undefined,
//         customFrequency:
//           formData.frequency === "custom"
//             ? formData.customFrequency
//             : undefined,
//       };

//       await api.put(`/api/habits/${id}`, dataToSubmit);
//       toast.success("Habit updated successfully!");
//       navigate("/");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error updating habit");
//     }
//   };

//   // Handle habit deletion with confirmation
//   const handleDelete = async () => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this habit? This action cannot be undone."
//       )
//     ) {
//       try {
//         await api.delete(`/api/habits/${id}`);
//         toast.success("Habit deleted successfully!");
//         navigate("/");
//       } catch (err) {
//         toast.error(err.response?.data?.message || "Error deleting habit");
//       }
//     }
//   };

//   // Show loading state while fetching data
//   if (!formData.title)
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent"></div>
//       </div>
//     );

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <div className="bg-white rounded-xl shadow-lg p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Edit Habit</h1>
//           <button
//             onClick={handleDelete}
//             className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//           >
//             Delete Habit
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">Title</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData({ ...formData, title: e.target.value })
//               }
//               required
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
//               placeholder="Enter habit title"
//             />
//           </div>

//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">Description</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent min-h-[100px]"
//               placeholder="Describe your habit"
//             />
//           </div>

//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">Category</label>
//             <select
//               value={formData.category}
//               onChange={(e) =>
//                 setFormData({ ...formData, category: e.target.value })
//               }
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
//             >
//               <option value="health">Health</option>
//               <option value="work">Work</option>
//               <option value="learning">Learning</option>
//               <option value="fitness">Fitness</option>
//               <option value="mindfulness">Mindfulness</option>
//               <option value="productivity">Productivity</option>
//               <option value="social">Social</option>
//               <option value="finance">Finance</option>
//               <option value="custom">Custom</option>
//               <option value="other">Other</option>
//             </select>

//             {formData.category === "custom" && (
//               <input
//                 type="text"
//                 value={formData.customCategory}
//                 onChange={(e) =>
//                   setFormData({ ...formData, customCategory: e.target.value })
//                 }
//                 className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
//                 placeholder="Enter custom category"
//                 required
//               />
//             )}
//           </div>

//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">Frequency</label>
//             <select
//               value={formData.frequency}
//               onChange={(e) =>
//                 setFormData({ ...formData, frequency: e.target.value })
//               }
//               className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
//             >
//               <option value="daily">Daily</option>
//               <option value="weekly">Weekly</option>
//               <option value="custom">Custom</option>
//             </select>

//             {formData.frequency === "custom" && (
//               <input
//                 type="text"
//                 value={formData.customFrequency}
//                 onChange={(e) =>
//                   setFormData({ ...formData, customFrequency: e.target.value })
//                 }
//                 className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent"
//                 placeholder="Enter custom frequency (e.g., '3 times per week')"
//                 required
//               />
//             )}
//           </div>

//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">
//               Priority (1-5)
//               <span className="ml-2 text-gray-500">
//                 Current: {formData.priority}
//               </span>
//             </label>
//             <div className="flex items-center gap-4">
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 value={formData.priority}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     priority: parseInt(e.target.value),
//                   })
//                 }
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//               <span className="text-gray-700 font-medium">
//                 {formData.priority}
//               </span>
//             </div>
//           </div>

//           <div className="form-group">
//             <label className="block text-gray-700 mb-2">Color</label>
//             <div className="flex items-center gap-4">
//               <input
//                 type="color"
//                 value={formData.color}
//                 onChange={(e) =>
//                   setFormData({ ...formData, color: e.target.value })
//                 }
//                 className="w-24 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
//               />
//               <span className="text-gray-500">
//                 Selected color: {formData.color}
//               </span>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 pt-6">
//             <button
//               type="button"
//               onClick={() => navigate("/")}
//               className="px-6 py-2 border-2 border-theme-accent text-theme-accent rounded-lg hover:bg-theme-accent hover:text-white transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-theme-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>

//         {/* Display current streak information */}
//         <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//           <h3 className="text-lg font-semibold text-gray-700 mb-2">
//             Current Progress
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="p-3 bg-white rounded-lg shadow-sm">
//               <p className="text-gray-500">Current Streak</p>
//               <p className="text-2xl font-bold text-theme-accent">
//                 🔥 {formData.streak.current} days
//               </p>
//             </div>
//             <div className="p-3 bg-white rounded-lg shadow-sm">
//               <p className="text-gray-500">Longest Streak</p>
//               <p className="text-2xl font-bold text-theme-accent">
//                 ⭐ {formData.streak.longest} days
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditHabit;
