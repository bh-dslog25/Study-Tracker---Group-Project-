import React from 'react';

const TaskCard = ({ task }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Ô Checkbox vuông bo góc nhẹ */}
        <input 
          type="checkbox" 
          checked={task.completed}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          readOnly
        />
        
        {/* Nội dung text nhiệm vụ */}
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{task.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
        </div>
      </div>

      {/* Khối trạng thái và thời gian bên phải */}
      <div className="flex flex-col items-end gap-1.5">
        {/* Badge Độ ưu tiên */}
        <span className="px-2.5 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-md">
          {task.priority}
        </span>
        
        {/* Thời gian thực hiện */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <span className="material-symbols-outlined text-[13px]">schedule</span>
          <span>{task.time}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;