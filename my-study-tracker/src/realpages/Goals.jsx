import React, { useState, useEffect } from 'react';
import GoalCard from '../../../frontend/src/components/GoalCard';
import goalService from '../../../frontend/src/services/goalService';

const Goals = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dữ liệu Goals từ Backend
    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const response = await goalService.getAll();
            const goalsData = response.rows || response || [];
            setGoals(Array.isArray(goalsData) ? goalsData : []);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi fetch goals:', err);
            setError('Không thể tải dữ liệu mục tiêu');
            // Dữ liệu mẫu fallback nếu API lỗi
            setGoals([
                {
                    id: 1,
                    title: "Học lập trình Assembly 8051",
                    description: "Cày hết bộ ngân hàng 100 câu hỏi trắc nghiệm.",
                    type: "study",
                    status: "in_progress",
                    endDate: "2026-06-25",
                    tasks: [{ id: 101, text: "Học tập lệnh di chuyển dữ liệu MOV", completed: true }]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // State quản lý dữ liệu Form nhập
    const [formData, setFormData] = useState({ title: '', endDate: '', type: 'study', description: '', tasks: [] });
    const [submitLoading, setSubmitLoading] = useState(false);

    // Hàm mở Modal (Xử lý gộp cả Thêm mới & Sửa/Chi tiết)
    const handleOpenModal = (goal = null) => {
        if (goal) {
            setIsEditMode(true);
            setEditingGoalId(goal.id);
            setFormData({
                title: goal.title,
                endDate: goal.targetDate || goal.endDate || '',
                type: goal.category || goal.type || 'study',
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

    // Kích hoạt Toast thông báo thành công trong 3 giây
    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Xử lý Submit Form (Gộp cả POST tạo mới và PUT cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        try {
            setSubmitLoading(true);
            const goalData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                endDate: formData.endDate
            };

            if (isEditMode) {
                // Logic UPDATE dữ liệu (Tương đương PUT /api/goals/:id)
                await goalService.update(editingGoalId, goalData);
            } else {
                // Logic CREATE dữ liệu mới (Tương đương POST /api/goals)
                await goalService.create(goalData);
            }

            triggerToast(); // Bật thông báo toast thành công
            handleCloseModal(); // Đóng modal
            fetchGoals(); // Refresh danh sách
        } catch (err) {
            console.error('Lỗi khi submit form:', err);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen relative overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Mục tiêu của tôi</h2>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi tiến độ mục tiêu ngắn hạn & dài hạn.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                    🎯 Add New Goal
                </button>
            </div>

            {/* Grid Render danh sách thẻ GoalCard */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-500 font-semibold">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center text-red-600">
                        <p className="font-semibold mb-2">{error}</p>
                        <button onClick={fetchGoals} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                            Thử lại
                        </button>
                    </div>
                </div>
            ) : goals.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">target</span>
                        <p className="text-slate-500 font-semibold">Chưa có mục tiêu nào</p>
                        <p className="text-slate-400 text-sm mb-4">Bắt đầu bằng cách nhấn nút Add New Goal</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(item => (
                        <GoalCard key={item.id} goal={item} onEdit={handleOpenModal} onDelete={async (id) => {
                            try {
                                await goalService.remove(id);
                                setGoals(goals.filter(g => g.id !== id));
                                triggerToast();
                            } catch (err) {
                                console.error('Lỗi khi xóa:', err);
                                alert('Không thể xóa mục tiêu này!');
                            }
                        }} />
                    ))}
                </div>
            )}

            {/* ================= MODAL POPUP (THÊM / SỬA CHI TIẾT) ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 transition-all transform scale-100">

                        {/* Modal Header: Tiêu đề động tùy theo chế độ */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEditMode ? "Goal Details & Tasks" : "Add New Goal"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {/* GOAL TITLE */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Goal Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                                    placeholder="e.g., Master Data Analysis" required
                                />
                            </div>

                            {/* ROW: TARGET DATE & CATEGORY */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Target Date</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Category</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                                        <option value="study">🎓 Học tập (Study)</option>
                                        <option value="skills">🛠️ Kỹ năng (Skills)</option>
                                        <option value="health">💪 Sức khỏe (Health)</option>
                                        <option value="habit">🔄 Thói quen (Habit)</option>
                                    </select>
                                </div>
                            </div>

                            {/* PHẦN TIẾN ĐỘ & TASK CON (Chỉ hiển thị khi bấm vào nút SỬA/CHI TIẾT) */}
                            {isEditMode && (
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    {/* Thanh tiến độ giả lập */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                            <span>Goal Progress</span>
                                            <span>50%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '50%' }}></div>
                                        </div>
                                    </div>
                                    {/* Danh sách task con */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block">Tasks Section</label>
                                        {formData.tasks.map(t => (
                                            <div key={t.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                <input type="checkbox" checked={t.completed} readOnly className="rounded text-indigo-600" />
                                                <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OBJECTIVE DESCRIPTION */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Objective Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none" placeholder="Briefly describe..." />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                                <button type="button" onClick={handleCloseModal} disabled={submitLoading} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={submitLoading} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2">
                                    {submitLoading ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        isEditMode ? "Save Changes" : "Create Goal"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= TOAST SUCCESS NOTIFICATION (Khớp logic showToast) ================= */}
            <div className={`fixed bottom-8 right-8 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all duration-300 transform z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span className="text-sm font-semibold">{isEditMode ? 'Đã cập nhật thay đổi thành công!' : 'Tạo mục tiêu mới thành công!'}</span>
            </div>

        </div>
    );
};

export default Goals;