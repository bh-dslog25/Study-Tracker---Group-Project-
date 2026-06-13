
import React from 'react';
const TaskCard = ({ title, subject, dueDate, status }) => {
  // Hàm xử lý hiển thị màu sắc theo trạng thái của Task
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'in progress':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-50 transition-all flex items-center justify-between">
      {/* Thông tin Task */}
      <div className="flex items-start gap-4">
        {/* Checkbox tượng trưng */}
        <div className="mt-1">
          <input 
            type="checkbox" 
            checked={status?.toLowerCase() === 'completed'} 
            readOnly
            className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
        
        <div>
          <h4 className={`font-semibold text-slate-800 text-base ${status?.toLowerCase() === 'completed' ? 'line-through text-slate-400' : ''}`}>
            {title || 'Untitled Task'}
          </h4>
          <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-400">
            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[11px]">
              {subject || 'General'}
            </span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Due: {dueDate || 'No deadline'}
            </span>
          </div>
        </div>
      </div>

      {/* Trạng thái Label Tag */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusStyle(status)}`}>
        {status || 'Pending'}
      </span>
    </div>
  );
};

export default TaskCard;