import React, { useState } from 'react';

const GoalCard = ({ goal, onEdit, onDelete, onAddTask, onToggleTask, onRemoveTask }) => {
  const { title, description, endDate, type, tasks = [] } = goal;

  const [isExpanded, setIsExpanded] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryConfig = {
    study: { label: 'Academic (Study)', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    skills: { label: 'Skill Development', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    health: { label: 'Health & Fitness', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    habit: { label: 'Personal Habit', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    daily: { label: 'Daily', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    weekly: { label: 'Weekly', color: 'bg-violet-50 text-violet-600 border-violet-100' },
    monthly: { label: 'Monthly', color: 'bg-pink-50 text-pink-600 border-pink-100' },
    custom: { label: 'Custom', color: 'bg-slate-50 text-slate-600 border-slate-100' },
  };

  const currentCategory = categoryConfig[type] || categoryConfig.study;

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    onAddTask(goal.id, newTaskText.trim());
    setNewTaskText('');
  };

  const handleToggle = (taskId) => {
    onToggleTask(goal.id, taskId);
  };

  const handleRemoveTask = (taskId) => {
    onRemoveTask(goal.id, taskId);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${currentCategory.color}`}>
            {currentCategory.label}
          </span>
          <span className={`text-xs font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
            {progressPercent}% Done
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-800 line-clamp-1 mb-1.5 group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
          {description || <span className="italic text-slate-400">Chưa có mô tả chi tiết.</span>}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Tasks info */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer w-full text-left"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Nhiệm vụ: <span className="text-slate-700 font-bold">{completedTasks}/{totalTasks}</span>
        </button>

        {/* Expanded Tasks Section */}
        {isExpanded && (
          <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
            {/* Add task input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }}
                placeholder="Thêm nhiệm vụ mới..."
                className="flex-1 px-3 py-2 border border-gray-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTask}
                className="bg-indigo-600 text-white px-3 text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Thêm
              </button>
            </div>

            {/* Task list */}
            {totalTasks === 0 ? (
              <p className="text-xs text-slate-400 italic pt-1">Chưa có nhiệm vụ nào. Hãy thêm nhiệm vụ!</p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-sm bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm group/task hover:border-indigo-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!t.completed}
                        onChange={() => handleToggle(t.id)}
                        className="rounded border-gray-300 text-indigo-600 w-4 h-4 cursor-pointer focus:ring-indigo-500"
                      />
                      <span className={`text-xs truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {t.title || t.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveTask(t.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 font-medium">
          Hạn định: <span className="text-slate-600 font-semibold">{endDate || 'Không có'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(goal)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(goal.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;