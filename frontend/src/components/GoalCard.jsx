import React, { useState } from 'react';
import GoalCard from '../components/GoalCard';

const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Danh sách dữ liệu ban đầu
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Học lập trình Assembly 8051",
      description: "Cày hết bộ ngân hàng 100 câu hỏi trắc nghiệm cấu trúc máy tính và thực hành Proteus.",
      type: "study",
      status: "in_progress",
      endDate: "2026-06-25",
      tasks: [
        { id: 101, text: "Học tập lệnh di chuyển dữ liệu MOV", completed: true },
        { id: 102, text: "Cấu hình bộ định thời Timer 0 hệ thống", completed: false }
      ]
    },
    {
      id: 2,
      title: "Thiết kế sơ đồ Sequence hệ thống",
      description: "Vẽ hoàn thiện biểu đồ tuần tự chức năng và sơ đồ ERD cơ sở dữ liệu cho AI Chatbot.",
      type: "skills",
      status: "completed",
      endDate: "2026-06-15",
      tasks: [{ id: 201, text: "Thiết kế Sequence Diagram chức năng Đăng ký", completed: true }]
    }
  ]);

  // State quản lý dữ liệu Form nhập
  const [formData, setFormData] = useState({ title: '', endDate: '', type: 'study', description: '', tasks: [] });

  // Hàm điều khiển mở Modal
  const handleOpenModal = (goal = null) => {
    if (goal) {
      setIsEditMode(true);
      setEditingGoalId(goal.id);
      setFormData({
        title: goal.title || '',
        endDate: goal.endDate || '',
        type: goal.type || 'study',
        description: goal.description || '',
        tasks: goal.tasks || []
      });
    } else {
      setIsEditMode(false);
      setEditingGoalId(null);
      setFormData({ title: '', endDate: '', type: 'study', description: '', tasks: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Xử lý Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (isEditMode) {
      setGoals(goals.map(g => g.id === editingGoalId ? { ...g, ...formData } : g));
    } else {
      const newGoal = {
        id: Date.now(),
        title: formData.title,
        endDate: formData.endDate,
        type: formData.type,
        description: formData.description,
        status: 'pending',
        tasks: []
      };
      setGoals([newGoal, ...goals]);
    }

    triggerToast();
    handleCloseModal();
  };

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen relative">
      
      {/* Khối Tiêu đề trang */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mục tiêu của tôi</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi tiến độ các mục tiêu ngắn hạn & dài hạn.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Thêm mục tiêu
        </button>
      </div>

      {/* Grid danh sách hiển thị các thẻ GoalCard */}
      {goals.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12">
          <h3 className="font-bold text-slate-700 text-lg">Bạn chưa có mục tiêu nào</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((item) => (
            <GoalCard 
              key={item.id} 
              goal={item} 
              onEdit={handleOpenModal} 
              onDelete={(id) => {
                if(window.confirm("Bạn có chắc muốn xóa?")) setGoals(goals.filter(g => g.id !== id));
              }} 
            />
          ))}
        </div>
      )}

      {/* ================= MODAL ADD NEW / DETAILS GOAL (ĐÃ CẬP NHẬT GIAO DIỆN) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-8 relative transition-all transform scale-100">
            
            {/* Nút X đóng modal */}
            <button 
              onClick={handleCloseModal} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Tiêu đề Modal */}
            <h2 className="text-[22px] font-bold text-slate-800 mb-8">
              {isEditMode ? "Goal Details & Tasks" : "Add New Goal"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* GOAL TITLE */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Goal Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3b28cc] focus:ring-1 focus:ring-[#3b28cc] placeholder-slate-400" 
                  placeholder="e.g., Master Data Analysis" required 
                />
              </div>

              {/* TARGET DATE & CATEGORY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Target Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:border-[#3b28cc] focus:ring-1 focus:ring-[#3b28cc]" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Category</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-slate-700 bg-white cursor-pointer focus:outline-none focus:border-[#3b28cc] focus:ring-1 focus:ring-[#3b28cc]"
                  >
                    <option value="study">Academic (Study)</option>
                    <option value="skills">Skill Development</option>
                    <option value="health">Health & Fitness</option>
                    <option value="habit">Personal Habit</option>
                  </select>
                </div>
              </div>

              {/* KHỐI HIỂN THỊ TIẾN ĐỘ & TASK CON KHI XEM CHI TIẾT SỬA */}
              {isEditMode && (
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Goal Progress</span>
                      <span>{formData.tasks.length > 0 ? Math.round((formData.tasks.filter(t => t.completed).length / formData.tasks.length) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#3b28cc] rounded-full transition-all duration-300" 
                        style={{ width: `${formData.tasks.length > 0 ? (formData.tasks.filter(t => t.completed).length / formData.tasks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block">Tasks Section</label>
                    {formData.tasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Mục tiêu này hiện chưa có nhiệm vụ con.</p>
                    ) : (
                      formData.tasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2.5 text-sm text-slate-700 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                          <input 
                            type="checkbox" 
                            checked={t.completed} 
                            onChange={() => {
                              const updatedTasks = formData.tasks.map(task => task.id === t.id ? { ...task, completed: !task.completed } : task);
                              setFormData({ ...formData, tasks: updatedTasks });
                            }}
                            className="rounded text-[#3b28cc] w-4 h-4 cursor-pointer focus:ring-0" 
                          />
                          <span className={t.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>{t.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* OBJECTIVE DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">Objective Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#3b28cc] focus:ring-1 focus:ring-[#3b28cc] resize-none placeholder-slate-400" 
                  placeholder="Briefly describe what achieving this goal looks like..." 
                />
              </div>

              {/* NÚT BẤM */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-[#3b28cc] hover:bg-[#2d1e9e] text-white font-semibold text-sm shadow-lg shadow-[#3b28cc]/30 transition-colors"
                >
                  {isEditMode ? "Save Changes" : "Create Goal"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST SUCCESS NOTIFICATION */}
      <div className={`fixed bottom-8 right-8 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all duration-300 transform z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <span className="text-sm font-semibold">{isEditMode ? 'Đã lưu mọi thay đổi!' : 'Tạo mục tiêu mới thành công!'}</span>
      </div>

    </div>
  );
};

export default Goals;