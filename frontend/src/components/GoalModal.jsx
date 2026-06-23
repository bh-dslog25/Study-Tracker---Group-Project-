import React, { useState, useEffect } from 'react';

const INITIAL_FORM_STATE = { 
  title: '', 
  targetHours: '', 
  startDate: '', 
  endDate: '', 
  type: 'study', 
  description: '', 
  tasks: [] 
};

const GoalModal = ({ isOpen, onClose, onSubmit, goal }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        // goal.tasks contains tasks from backend (with id, title, status, completed)
        const existingTasks = (goal.tasks || []).map(t => ({
          id: t.id,
          text: t.title || t.text,
          completed: !!t.completed,
          backendId: t.id, // mark as existing backend task
        }));
        setFormData({
          title: goal.title || '',
          targetHours: goal.targetHours || '',
          startDate: goal.startDate || '',
          endDate: goal.endDate || '',
          type: goal.type || 'study',
          description: goal.description || '',
          tasks: existingTasks,
        });
      } else {
        setFormData(INITIAL_FORM_STATE);
      }
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (!formData.targetHours) return alert('Please enter target hours');
    if (!formData.startDate) return alert('Please select start date');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-8 relative max-h-[90vh] overflow-y-auto">
        
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-[22px] font-bold text-slate-800 mb-6">
          {goal ? "Edit Goal" : "Add New Goal"}
        </h2>

        <form onSubmit={handleSubmitForm} className="space-y-5">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Goal Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3b28cc] focus:ring-1 focus:ring-[#3b28cc]" 
              placeholder="e.g., Master Data Analysis" required 
            />
          </div>

          {/* Target Hours & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Target Hours</label>
              <input 
                type="number" 
                step="1"
                min="1"
                value={formData.targetHours} 
                onChange={(e) => setFormData({...formData, targetHours: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:border-[#3b28cc]" 
                placeholder="e.g., 10" required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Start Date</label>
              <input 
                type="date" 
                value={formData.startDate} 
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:border-[#3b28cc]" 
              />
            </div>
          </div>

          {/* End Date & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">End Date</label>
              <input 
                type="date" 
                value={formData.endDate} 
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:border-[#3b28cc]" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Category</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 bg-white cursor-pointer focus:outline-none focus:border-[#3b28cc]"
              >
                <option value="study">Academic (Study)</option>
                <option value="skills">Skill Development</option>
                <option value="health">Health & Fitness</option>
                <option value="habit">Personal Habit</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Objective Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3b28cc] resize-none" 
              placeholder="Briefly describe what achieving this goal looks like..." 
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#3b28cc] hover:bg-[#2d1e9e] text-white font-semibold text-xs shadow-lg shadow-[#3b28cc]/30">
              {goal ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;