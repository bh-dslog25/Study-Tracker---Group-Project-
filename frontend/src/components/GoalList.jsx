import React from 'react';
import GoalCard from './GoalCard';

const GoalList = ({ goals, onEdit, onDelete, onAddTask, onToggleTask, onRemoveTask }) => {
  if (goals.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12">
        <h3 className="font-bold text-slate-700 text-lg">You have no goals yet</h3>
        <p className="text-slate-400 text-sm mt-1">Click the add button to create a new plan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((item) => (
        <GoalCard 
          key={item.id} 
          goal={item} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onAddTask={onAddTask}
          onToggleTask={onToggleTask}
          onRemoveTask={onRemoveTask}
        />
      ))}
    </div>
  );
};

export default GoalList;