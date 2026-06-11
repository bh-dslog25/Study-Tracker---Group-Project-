import React from 'react';

const GoalCard = ({ goal, onUpdateStatus, onDelete }) => {
  // Hàm định dạng ngày tháng hiển thị cho đẹp (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Xác định màu sắc tag dựa theo trạng thái của mục tiêu
  const isCompleted = goal.status === 'completed';

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${isCompleted ? 'border-green-200 bg-green-50/10' : 'border-[#dce2f3]'}`}>
      <div>
        {/* Header của Card: Gồm thể loại và trạng thái */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-[#3525cd] bg-[#f0f3ff] px-2.5 py-1 rounded-md uppercase tracking-wider">
            {goal.type || 'Chung'}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {isCompleted ? 'Hoàn thành' : 'Đang làm'}
          </span>
        </div>

        {/* Tiêu đề & Mô tả mục tiêu */}
        <h4 className={`font-bold text-[#151c27] text-base mb-1.5 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
          {goal.title}
        </h4>
        <p className="text-sm text-[#464555] line-clamp-3 mb-4">
          {goal.description || 'Không có mô tả cho mục tiêu này.'}
        </p>
      </div>

      {/* Footer của Card: Hạn chót và Các nút thao tác */}
      <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-xs text-[#464555]">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Hạn: {formatDate(goal.endDate)}</span>
        </div>

        <div className="flex gap-1.5">
          {/* Nút Đổi trạng thái (Hoàn thành / Kích hoạt lại) */}
          <button 
            onClick={() => onUpdateStatus(goal.id, isCompleted ? 'active' : 'completed')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isCompleted ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
            title={isCompleted ? "Kích hoạt lại" : "Đánh dấu hoàn thành"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCompleted ? 'undo' : 'check'}
            </span>
          </button>

          {/* Nút Xóa mục tiêu */}
          <button 
            onClick={() => {
              if(window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này chứ?')) {
                onDelete(goal.id);
              }
            }}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Xóa mục tiêu"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;