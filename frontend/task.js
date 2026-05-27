document.addEventListener('DOMContentLoaded', () => {
    // 1. LOGIC ĐÓNG / MỞ MODAL
    const taskNavBtn = document.querySelector('[data-target="tasks"]');
    const taskModal = document.getElementById('add-task-modal');
    const taskModalInner = taskModal?.querySelector('div');
    const closeElements = ['task-modal-close-x', 'task-cancel-btn'];

    const toggleModal = (isOpen) => {
        if (!taskModal || !taskModalInner) return;
        if (isOpen) {
            taskModal.classList.remove('hidden');
            setTimeout(() => taskModalInner.classList.replace('scale-95', 'scale-100'), 10);
        } else {
            taskModalInner.classList.replace('scale-100', 'scale-95');
            setTimeout(() => taskModal.classList.add('hidden'), 200);
        }
    };

    taskNavBtn?.addEventListener('click', (e) => { e.preventDefault(); toggleModal(true); });
    closeElements.forEach(id => document.getElementById(id)?.addEventListener('click', () => toggleModal(false)));
    taskModal?.addEventListener('click', (e) => e.target === taskModal && toggleModal(false));

    // 2. LOGIC CHỌN PRIORITY (Đã tối ưu hóa class bằng Object)
    const priorityStyles = {
        low: {
            normal: "priority-btn flex-1 py-2.5 rounded-[12px] border border-slate-300 text-sm font-medium text-[#464555] bg-white transition-colors hover:bg-slate-50",
            active: "priority-btn flex-1 py-2.5 rounded-[12px] border border-slate-400 bg-slate-100 text-[#151c27] text-sm font-medium transition-colors shadow-sm"
        },
        medium: {
            normal: "priority-btn flex-1 py-2.5 rounded-[12px] border border-slate-300 text-sm font-medium text-[#464555] bg-white transition-colors hover:bg-slate-50",
            active: "priority-btn flex-1 py-2.5 rounded-[12px] border border-[#3525cd] bg-[#3525cd] text-white text-sm font-medium transition-colors shadow-sm"
        },
        high: {
            normal: "priority-btn flex-1 py-2.5 rounded-[12px] border border-[#ffb4b4] text-sm font-medium text-[#f03e3e] bg-white transition-colors hover:bg-red-50",
            active: "priority-btn flex-1 py-2.5 rounded-[12px] border border-[#f03e3e] bg-[#f03e3e] text-white text-sm font-medium transition-colors shadow-sm"
        }
    };

    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentBtn = e.currentTarget;
            const val = currentBtn.getAttribute('data-priority');

            // Reset tất cả nút về trạng thái normal
            Object.keys(priorityStyles).forEach(key => {
                const target = document.querySelector(`[data-priority="${key}"]`);
                if (target) target.className = priorityStyles[key].normal;
            });

            // Kích hoạt trạng thái active cho nút được bấm
            if (priorityStyles[val]) currentBtn.className = priorityStyles[val].active;
        });
    });

    // 3. LOGIC CHỌN GOAL, LIỆT KÊ NHIỆM VỤ & TÍNH TIẾN ĐỘ
    const goalSelect = document.getElementById('task-goal-select'); // Thẻ <select> chọn Goal
    const subtaskContainer = document.getElementById('subtask-list-container'); // Vùng chứa danh sách nhiệm vụ cần làm
    const progressText = document.getElementById('goal-progress-text'); // Chữ hiển thị tiến độ (ví dụ: 2/5 hoàn thành)
    const progressBar = document.getElementById('goal-progress-bar'); // Thanh tiến độ (nếu có)

    // Giả định dữ liệu Goals được lấy từ localStorage (hoặc API của bạn)
    const mockGoals = JSON.parse(localStorage.getItem('mock_goals')) || [
        { id: 1, title: "Học Lập Trình Web", tasks: [{ id: 101, name: "Học HTML/CSS", done: true }, { id: 102, name: "Học JavaScript căn bản", done: false }, { id: 103, name: "Làm project thực hành", done: false }] },
        { id: 2, title: "Luyện Thi IELTS", tasks: [{ id: 201, name: "Học 20 từ vựng mới", done: true }, { id: 202, name: "Giải 1 đề Listening", done: true }] }
    ];

    // Hàm render danh sách Goal vào thẻ <select> công việc
    function initGoalDropdown() {
        if (!goalSelect) return;
        goalSelect.innerHTML = '<option value="">-- Chọn mục tiêu (Goal) --</option>' + 
            mockGoals.map(goal => `<option value="${goal.id}">${goal.title}</option>`).join('');
    }

    // Hàm tính toán và cập nhật UI tiến độ hoàn thành
    function updateProgress(tasks) {
        if (!tasks.length) {
            if (progressText) progressText.textContent = "0%";
            if (progressBar) progressBar.style.width = "0%";
            return;
        }
        const completedCount = tasks.filter(t => t.done).length;
        const percentage = Math.round((completedCount / tasks.length) * 100);

        if (progressText) progressText.textContent = `${completedCount}/${tasks.length} nhiệm vụ (${percentage}%)`;
        if (progressBar) progressBar.style.width = `${percentage}%`;
    }

    // Hàm hiển thị danh sách nhiệm vụ cần làm tương ứng với Goal được chọn
    function renderSubtasks(goalId) {
        if (!subtaskContainer) return;
        const selectedGoal = mockGoals.find(g => g.id == goalId);

        if (!selectedGoal || !selectedGoal.tasks.length) {
            subtaskContainer.innerHTML = '<p class="text-xs text-slate-400">Không có nhiệm vụ nào cho mục tiêu này.</p>';
            updateProgress([]);
            return;
        }

        // Tạo danh sách checkbox nhiệm vụ cần làm
        subtaskContainer.innerHTML = selectedGoal.tasks.map(task => `
            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
                <input type="checkbox" class="subtask-checkbox rounded border-slate-300 text-primary" data-task-id="${task.id}" ${task.done ? 'checked' : ''}>
                <span class="${task.done ? 'line-through text-slate-400' : 'text-[#151c27]'}">${task.name}</span>
            </label>
        `).join('');

        updateProgress(selectedGoal.tasks);
    }

    // Sự kiện khi người dùng đổi lựa chọn Goal trong Dropdown
    goalSelect?.addEventListener('change', (e) => {
        renderSubtasks(e.target.value);
    });

    // Sự kiện khi tích chọn/bỏ chọn một nhiệm vụ cần làm để tính lại tiến độ trực tiếp
    subtaskContainer?.addEventListener('change', (e) => {
        if (!e.target.classList.contains('subtask-checkbox')) return;

        const goalId = goalSelect.value;
        const taskId = e.target.getAttribute('data-task-id');
        const selectedGoal = mockGoals.find(g => g.id == goalId);

        if (selectedGoal) {
            const currentTask = selectedGoal.tasks.find(t => t.id == taskId);
            if (currentTask) {
                currentTask.done = e.target.checked; // Cập nhật trạng thái
                
                // Hiệu ứng gạch ngang chữ khi làm xong nhiệm vụ
                const labelText = e.target.nextElementSibling;
                if (labelText) {
                    labelText.className = currentTask.done ? 'line-through text-slate-400' : 'text-[#151c27]';
                }

                // Lưu lại trạng thái mới vào localStorage (tùy chọn)
                localStorage.setItem('mock_goals', JSON.stringify(mockGoals));
                
                // Cập nhật lại thanh tiến độ hiển thị
                updateProgress(selectedGoal.tasks);
            }
        }
    });
    const addSubTaskBtn = document.getElementById('add-sub-task-btn');
const subTaskInput = document.getElementById('sub-task-input');
const subTasksList = document.getElementById('sub-tasks-list');

addSubTaskBtn.addEventListener('click', () => {
    const text = subTaskInput.value.trim();
    if (text) {
        const li = document.createElement('li');
        li.className = "text-sm bg-blue-50 text-blue-800 px-3 py-2 rounded-lg flex justify-between items-center";
        li.innerHTML = `${text} <span class="material-symbols-outlined text-[16px] cursor-pointer">close</span>`;
        
        // Xóa task khi nhấn nút đóng
        li.querySelector('span').onclick = () => li.remove();
        
        subTasksList.appendChild(li);
        subTaskInput.value = ''; // Reset input
    }
});

    // Khởi tạo giao diện ban đầu
    initGoalDropdown();
});