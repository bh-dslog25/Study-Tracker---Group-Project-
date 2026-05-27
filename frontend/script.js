// script.js
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. NAVIGATION MENU
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            menuItems.forEach(i => {
                i.classList.remove('bg-primary', 'text-white', 'shadow-sm');
                i.classList.add('text-on-surface-variant', 'hover:bg-slate-100');
                const icon = i.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 0";
            });

            item.classList.remove('text-on-surface-variant', 'hover:bg-slate-100');
            item.classList.add('bg-primary', 'text-white', 'shadow-sm');
            const activeIcon = item.querySelector('.material-symbols-outlined');
            if (activeIcon) activeIcon.style.fontVariationSettings = "'FILL' 1";

            console.log(`Đã chuyển hướng giao diện sang mục: ${item.getAttribute('data-target')}`);
        });
    });

    // 2. FOCUS SESSION
    document.getElementById('focus-session-btn')?.addEventListener('click', () => {
        alert('Start! Chúc bạn tập trung học tập thật tốt.');
    });

    // 3. TASK CHECKBOX LOGIC
    document.addEventListener('change', (e) => {
        if (!e.target?.classList.contains('task-checkbox')) return;
        
        const goalList = JSON.parse(localStorage.getItem('mock_goals')) || [];
        if (!goalList.length) {
            alert("Bạn chưa có goal nào cả! Vui lòng tạo mục tiêu trước khi thực hiện tác vụ.");
            e.target.checked = false;
            return;
        }

        const titleEl = e.target.closest('.flex')?.querySelector('.id-task-title');
        if (titleEl) {
            console.log(`Đã ${e.target.checked ? 'kiểm tra hoàn thành' : 'mở lại'} tác vụ: ${titleEl.textContent.trim()}`);
        }
    });

    // 4. CHART BARS HOVER EFFECT
    document.querySelectorAll('.chart-bar').forEach(bar => {
        bar.addEventListener('mouseenter', () => !bar.classList.contains('bg-primary') && (bar.style.opacity = '0.8'));
        bar.addEventListener('mouseleave', () => bar.style.opacity = '1');
    });
    
    // 5. UPDATE GOALS UI
    window.updateGoalsUI = function() {
        const container = document.getElementById('goal-display-container');
        if (!container) return;

        try {
            const goalList = JSON.parse(localStorage.getItem('mock_goals')) || [];

            if (!goalList.length) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                        <div class="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-[#dce2f3] flex items-center justify-center text-slate-400 mb-3">
                            <span class="material-symbols-outlined text-[28px]">target</span>
                        </div>
                        <p class="text-sm font-semibold text-[#151c27]">Bạn chưa có mục tiêu nào</p>
                        <p class="text-xs text-[#464555] mt-1 max-w-[200px]">Hãy nhấn vào tab "Goals" ở menu để thiết lập mục tiêu mới ngay nhé!</p>
                    </div>`;
                return;
            }

            const currentGoal = goalList[0]; 
            const radius = 40;
            const circumference = 2 * Math.PI * radius; 
            const progress = currentGoal.progress || 0;

            container.innerHTML = `
                <div class="relative w-32 h-32 flex items-center justify-center my-2 cursor-pointer transition-transform hover:scale-105" onclick="window.openGoalDetailMock(${currentGoal.id})">
                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="${radius}" stroke="#f1f5f9" stroke-width="9" fill="transparent" />
                        <circle cx="50" cy="50" r="${radius}" stroke="#3525cd" stroke-width="9" fill="transparent" 
                                stroke-dasharray="${circumference}" stroke-dashoffset="${circumference - (progress / 100) * circumference}" 
                                stroke-linecap="round" class="transition-all duration-500"/>
                    </svg>
                    <div class="absolute text-center">
                        <span class="text-2xl font-bold text-[#151c27]">${progress}%</span>
                        <p class="text-[9px] text-[#464555] font-bold uppercase tracking-wider">Completed</p>
                    </div>
                </div>
                <div class="text-center w-full mt-2">
                    <h5 class="font-bold text-[#3525cd] text-base truncate px-4">${currentGoal.title}</h5>
                    <p class="text-xs text-[#464555] mt-0.5 flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">calendar_today</span> Target: ${currentGoal.targetDate || 'Chưa đặt'}
                    </p>
                </div>`;
        } catch (error) {
            console.error("Không thể tải danh sách Goals lên giao diện chính:", error);
        }
    };

    window.updateGoalsUI();

    // 6. OPEN GOAL DETAIL MODAL
    window.openGoalDetailMock = function(goalId) {
        try {
            const goalList = JSON.parse(localStorage.getItem('mock_goals')) || [];
            const goalData = goalList.find(g => g.id === goalId);
            
            if (!goalData) return console.error("Không tìm thấy ID Goal thích hợp!");

            document.getElementById('add-goal-modal')?.classList.remove('hidden');
            document.getElementById('goal-progress-container')?.classList.remove('hidden');
            document.getElementById('task-section')?.classList.remove('hidden');
            
            const modalTitle = document.getElementById('modal-mode-title');
            if (modalTitle) modalTitle.textContent = "Edit Goal Details";

            document.getElementById('goal-title').value = goalData.title || '';
            document.getElementById('goal-date').value = goalData.targetDate || '';
            document.getElementById('goal-category').value = goalData.category || 'Academic';
            document.getElementById('goal-desc').value = goalData.description || '';

            if (typeof GoalTaskManager !== 'undefined' && typeof GoalTaskManager.setGoal === 'function') {
                GoalTaskManager.setGoal(goalData);
            }
        } catch (error) {
            console.error("Lỗi khi mở chi tiết Goal:", error);
        }
    };
});