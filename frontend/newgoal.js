// newgoal.js
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('add-goal-modal');
    const goalForm = document.getElementById('goal-form');
    const closeX = document.getElementById('modal-close-x');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const goalsMenuBtn = document.querySelector('[data-target="goals"]');
    
    const modalModeTitle = document.getElementById('modal-mode-title');
    const submitGoalBtn = document.getElementById('submit-goal-btn');
    const taskSection = document.getElementById('task-section');
    const progressContainer = document.getElementById('goal-progress-container');

    let isEditMode = false;
    let editingGoalId = null;

    // Hàm điều khiển đóng / mở Modal
    const openModal = (goal = null) => {
        modal.classList.remove('hidden');
        setTimeout(() => modal.querySelector('.transform').classList.add('scale-100'), 10);

        if (goal) {
            // TRẠNG THÁI: XEM CHI TIẾT & SỬA GOAL
            isEditMode = true;
            editingGoalId = goal.id;
            modalModeTitle.textContent = "Goal Details & Tasks";
            submitGoalBtn.textContent = "Save Changes";
            
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-date').value = goal.targetDate;
            document.getElementById('goal-category').value = goal.category;
            document.getElementById('goal-desc').value = goal.description;

            progressContainer.classList.remove('hidden');
            taskSection.classList.remove('hidden');
            
            // Gửi cục dữ liệu Goal sang file task.js để nó tự vẽ phần Task con và thanh tiến độ
            if (typeof GoalTaskManager !== 'undefined') {
                GoalTaskManager.setGoal(goal);
            }
        } else {
            // TRẠNG THÁI: TẠO MỚI GOAL HOÀN TOÀN
            isEditMode = false;
            editingGoalId = null;
            modalModeTitle.textContent = "Add New Goal";
            submitGoalBtn.textContent = "Create Goal";
            
            progressContainer.classList.add('hidden');
            taskSection.classList.add('hidden');
            goalForm.reset();
        }
    };

    const closeModal = () => {
        modal.querySelector('.transform').classList.remove('scale-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            goalForm.reset();
            isEditMode = false;
            editingGoalId = null;
        }, 150);
    };

    if (goalsMenuBtn) goalsMenuBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeX) closeX.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // XỬ LÝ SUBMIT FORM GOAL TRÊN MODAL
    if (goalForm) {
        goalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Lấy dữ liệu chính của Goal từ Form
            const goalData = {
                title: document.getElementById('goal-title').value.trim(),
                targetDate: document.getElementById('goal-date').value,
                category: document.getElementById('goal-category').value,
                description: document.getElementById('goal-desc').value.trim()
            };

            try {
                let url = '/api/goals';
                let method = 'POST';

                if (isEditMode) {
                    url = `/api/goals/${editingGoalId}`;
                    method = 'PUT';
                    // Lấy lại danh sách task hiện tại từ GoalTaskManager để lưu kèm theo thông tin chính
                    if (typeof GoalTaskManager !== 'undefined') {
                        goalData.tasks = GoalTaskManager.getGoal().tasks;
                    }
                }

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(goalData)
                });

                if (response.ok) {
                    alert(isEditMode ? 'Đã lưu mọi thay đổi!' : 'Tạo mục tiêu mới thành công!');
                    closeModal();
                }
            } catch (error) {
                console.error("Lỗi gửi dữ liệu form Goal:", error);
            }
        });
        // Hàm hiển thị thông báo
function showToast() {
    const toast = document.getElementById('toast-success');
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    // Tự ẩn sau 3 giây
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Gắn vào sự kiện submit
document.getElementById('goal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Logic lưu dữ liệu của bạn ở đây...
    console.log("Đã lưu mục tiêu!");

    // 2. Kích hoạt thông báo
    showToast();

    // 3. (Tùy chọn) Đóng modal sau khi tạo thành công
    document.getElementById('add-goal-modal').classList.add('hidden');
    this.reset(); // Xóa trắng form
});
    }

    // Gán hàm test giả lập ra ngoài window để bạn test trong Console F12
    window.openGoalDetailMock = async function(id) {
        const res = await fetch('/api/goals');
        const list = await res.json();
        const found = list.find(g => g.id === id);
        if (found) openModal(found);
        else alert("Vui lòng tạo một Goal trước rồi dùng ID của nó để test nhé!");
    };
});