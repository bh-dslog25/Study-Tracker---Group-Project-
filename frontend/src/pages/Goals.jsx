import React, { useState, useEffect, useCallback } from 'react';
import GoalList from '../components/GoalList';
import GoalModal from '../components/GoalModal';
import { useAuth } from '../context/AuthContext';

import axios from '../api/axios'; 

const API_URL = '/goals';

const Goals = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(''); 
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setGoals([]); 
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}?page=1&limit=50`);
      const goalsData = response.data.data || response.data.rows || response.data;
      setGoals(Array.isArray(goalsData) ? goalsData : []);
    } catch (error) {
      console.error("Error fetching goals from backend:", error);
      setGoals([]);
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token'); 
        localStorage.removeItem('user_info');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Luôn fetch goals khi component mount (dù auth thay đổi)
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenModal = (goal = null) => {
    setEditingGoal(goal); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmitGoal = async (formData) => {
    try {
      const goalPayload = {
        title: formData.title,
        description: formData.description || null,
        targetHours: parseFloat(formData.targetHours),
        achievedHours: formData.achievedHours ? parseFloat(formData.achievedHours) : 0,
        type: formData.type || 'weekly',
        status: formData.status || 'active',
        startDate: formData.startDate,
        endDate: formData.endDate,
        isAutoRenew: formData.isAutoRenew ? true : false
      };

      // Set default endDate if not provided (endDate is required in DB)
      if (!goalPayload.endDate && goalPayload.startDate) {
        const start = new Date(goalPayload.startDate);
        start.setFullYear(start.getFullYear() + 1);
        goalPayload.endDate = start.toISOString().split('T')[0];
      }

      let savedGoalId;

      if (editingGoal) {
        const response = await axios.put(`${API_URL}/${editingGoal.id}`, goalPayload);
        savedGoalId = editingGoal.id;
        triggerToast('All changes saved!');
      } else {
        const response = await axios.post(API_URL, goalPayload); 
        const newGoal = response.data.data || response.data;
        savedGoalId = newGoal.id;
        triggerToast('New goal created successfully!');
      }

      // Handle tasks: add new ones and delete removed ones
      if (editingGoal) {
        // EDIT MODE: sync tasks
        const oldTasks = editingGoal.tasks || [];
        const newTasks = formData.tasks || [];
        
        // Find tasks to delete (existed in old but not in new)
        const newTaskBackendIds = newTasks.filter(t => t.backendId).map(t => t.backendId);
        const tasksToDelete = oldTasks.filter(t => !newTaskBackendIds.includes(t.id));
        
        for (const task of tasksToDelete) {
          try {
            await axios.delete(`${API_URL}/${savedGoalId}/tasks/${task.id}`);
          } catch (err) {
            console.error("Lỗi khi xóa task cũ:", err);
          }
        }

        // Add new tasks (no backendId)
        const tasksToAdd = newTasks.filter(t => !t.backendId);
        for (const task of tasksToAdd) {
          try {
            await axios.post(`${API_URL}/${savedGoalId}/tasks`, {
              title: task.text || task.title,
              description: '',
              priority: 'medium',
            });
          } catch (err) {
            console.error("Lỗi khi thêm task mới:", err);
          }
        }
      } else {
        // CREATE MODE: add all tasks
        const tasksToAdd = formData.tasks || [];
        for (const task of tasksToAdd) {
          try {
            await axios.post(`${API_URL}/${savedGoalId}/tasks`, {
              title: task.text || task.title,
              description: '',
              priority: 'medium',
            });
          } catch (err) {
            console.error("Lỗi khi lưu task:", err);
          }
        }
      }

      // Always refetch to get fresh data with tasks
      await fetchGoals();
      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi lưu mục tiêu:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Unable to save goal. Please check again.";
      alert(errorMsg);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setGoals(prev => prev.filter(g => g.id !== id));
        triggerToast('Goal deleted successfully!');
      } catch (error) {
        console.error("Lỗi khi xóa mục tiêu:", error);
        alert(error.response?.data?.message || "Failed to delete goal.");
      }
    }
  };

  // ===== TASK MANAGEMENT =====

  const handleAddTask = async (goalId, taskTitle) => {
    try {
      const response = await axios.post(`${API_URL}/${goalId}/tasks`, {
        title: taskTitle,
        priority: 'medium',
      });
      const newTask = response.data.data || response.data;
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          const tasks = [...(g.tasks || []), { ...newTask, completed: newTask.status === 'completed' }];
          return {
            ...g,
            tasks,
            completedTasks: tasks.filter(t => t.completed).length,
            totalTasks: tasks.length,
          };
        }
        return g;
      }));
    } catch (error) {
      console.error("Lỗi khi thêm task:", error);
      triggerToast("Unable to add task.");
    }
  };

  const handleToggleTask = async (goalId, taskId) => {
    try {
      const response = await axios.put(`${API_URL}/${goalId}/tasks/${taskId}/toggle`);
      const updatedTask = response.data.data || response.data;
      
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          const tasks = (g.tasks || []).map(t => 
            t.id === taskId ? { ...t, completed: updatedTask.status === 'completed', status: updatedTask.status } : t
          );
          return {
            ...g,
            tasks,
            completedTasks: tasks.filter(t => t.completed).length,
            totalTasks: tasks.length,
          };
        }
        return g;
      }));
    } catch (error) {
      console.error("Lỗi khi toggle task:", error);
      triggerToast("Unable to update task status.");
    }
  };

  const handleRemoveTask = async (goalId, taskId) => {
    try {
      await axios.delete(`${API_URL}/${goalId}/tasks/${taskId}`);
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          const tasks = (g.tasks || []).filter(t => t.id !== taskId);
          return {
            ...g,
            tasks,
            completedTasks: tasks.filter(t => t.completed).length,
            totalTasks: tasks.length,
          };
        }
        return g;
      }));
      triggerToast('Task deleted.');
    } catch (error) {
      console.error("Lỗi khi xóa task:", error);
      triggerToast("Unable to delete task.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50/50 min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm font-medium">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen relative">
      
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Goals</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your goals progress.</p>
        </div>
        <button 
          onClick={() => handleOpenModal(null)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Goal
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <GoalList 
          goals={goals} 
          onEdit={handleOpenModal} 
          onDelete={handleDeleteGoal} 
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onRemoveTask={handleRemoveTask}
        />
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitGoal}
        goal={editingGoal}
      />

      <div className={`fixed bottom-8 right-8 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all duration-300 transform z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <span className="text-sm font-semibold">{toastMessage}</span>
      </div>

    </div>
  );
};

export default Goals;