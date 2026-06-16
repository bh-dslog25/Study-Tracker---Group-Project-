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
  const [newTaskText, setNewTaskText] = useState('');

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
      setNewTaskText('');
    }
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const totalTasks = formData.tasks?.length || 0;
  const completedTasks = formData.tasks?.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTaskInline = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      backendId: null, // new task, not yet in backend
    };
    setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setNewTaskText('');
  };

  const handleToggleTaskInline = (taskId) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const handleDeleteTaskInline = (taskId) => {
    setFormData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (!formData.targetHours) return alert('Vui lòng nhập số giờ mục tiêu');
    if (!formData.startDate) return alert('Vui lòng chọn ngày bắt đầu');
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
          {goal ? "Goal Details & Tasks" : "Add New Goal"}
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
                step="0.5"
                min="0.1"
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

          {/* Task Section */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Goal Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#3b28cc]'}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {totalTasks > 0 && (
                <p className="text-[11px] text-slate-400 mt-1">{completedTasks}/{totalTasks} nhiệm vụ hoàn thành</p>
              )}
            </div>

            {/* Add task input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block">Tasks Section</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#3b28cc]"
                  onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTaskInline(); } }}
                />
                <button type="button" onClick={handleAddTaskInline} className="bg-slate-800 text-white px-3 text-xs font-bold rounded-xl hover:bg-[#3b28cc]">Add</button>
              </div>

              {totalTasks === 0 ? (
                <p className="text-xs text-slate-400 italic pt-1">Chưa có nhiệm vụ con nào.</p>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {formData.tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-sm text-slate-700 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm group/task">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <input 
                          type="checkbox" 
                          checked={t.completed} 
                          onChange={() => handleToggleTaskInline(t.id)}
                          className="rounded text-[#3b28cc] w-4 h-4 cursor-pointer focus:ring-0" 
                        />
                        <span className={`text-xs truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{t.text}</span>
                      </div>
                      <button type="button" onClick={() => handleDeleteTaskInline(t.id)} className="text-slate-300 hover:text-rose-500 p-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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