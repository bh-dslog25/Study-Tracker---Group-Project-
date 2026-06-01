// ==========================================
// --- 1. CẤU HÌNH BIẾN ---
// ==========================================
const TOTAL_MINUTES = 36; // Setup lại 36 phút khớp với giao diện của bạn
let totalTimeInSeconds = TOTAL_MINUTES * 60;
let timeLeft = totalTimeInSeconds;
let timerInterval = null;
let isRunning = false;

// Quản lý trạng thái Session
let currentSession = 1;
const totalSessions = 4;
let sessionStartTime = null;

const CIRCUMFERENCE = 289; // Chu vi SVG

// ==========================================
// --- 2. LẤY CÁC PHẦN TỬ TỪ DOM ---
// ==========================================
const display = document.getElementById('timer-display');
const progressCircle = document.getElementById('progress-circle');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const stopBtn = document.getElementById('stop-btn');
const skipBtn = document.getElementById('skip-btn');

const currentTaskTitle = document.getElementById('current-task-title');
const sessionIndicator = document.getElementById('session-indicator');
const sessionHistoryList = document.getElementById('session-history-list');

// Các ID mới được bổ sung
const clearHistoryMenu = document.getElementById('clear-history-menu');
const viewAllBtn = document.getElementById('view-all-history-btn');
const startFocusBtn = document.getElementById('start-focus-btn');

// ==========================================
// --- 3. LOGIC ĐỒNG HỒ ---
// ==========================================
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progressOffset = CIRCUMFERENCE - (timeLeft / totalTimeInSeconds) * CIRCUMFERENCE;
    if (progressCircle) progressCircle.style.strokeDashoffset = progressOffset;
    if (sessionIndicator) sessionIndicator.textContent = `Session ${currentSession} of ${totalSessions}`;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        playPauseIcon.textContent = 'play_arrow'; 
    } else {
        if (timeLeft === totalTimeInSeconds || !sessionStartTime) {
            sessionStartTime = new Date();
        }
        playPauseIcon.textContent = 'pause'; 
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                handleSessionComplete();
            }
        }, 1000); 
    }
    isRunning = !isRunning;
}

function handleSessionComplete() {
    clearInterval(timerInterval);
    isRunning = false;
    playPauseIcon.textContent = 'play_arrow';

    addHistoryItem('completed');
    
    if (currentSession < totalSessions) {
        currentSession++;
        alert(`Tuyệt vời! Hãy nghỉ ngơi chút trước khi bắt đầu Session ${currentSession}.`);
    } else {
        currentSession = 1;
        alert(`Chúc mừng! Bạn đã hoàn thành toàn bộ chuỗi công việc.`);
    }
    resetTimerData();
}

function stopTimer() {
    if (timeLeft < totalTimeInSeconds && timeLeft > 0) {
        addHistoryItem('interrupted');
    }
    clearInterval(timerInterval);
    isRunning = false;
    playPauseIcon.textContent = 'play_arrow';
    resetTimerData();
}

function skipTimer() {
    if (timeLeft < totalTimeInSeconds && timeLeft > 0) {
        addHistoryItem('interrupted');
    }
    clearInterval(timerInterval);
    isRunning = false;
    playPauseIcon.textContent = 'play_arrow';
    
    if (currentSession < totalSessions) currentSession++;
    else currentSession = 1;
    
    resetTimerData();
}

function resetTimerData() {
    timeLeft = totalTimeInSeconds;
    sessionStartTime = null;
    updateDisplay();
}

// Hàm hỗ trợ format giờ (VD: 09:30 AM)
function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

// ==========================================
// --- 4. HÀM TẠO LỊCH SỬ ĐỘNG ---
// ==========================================
function addHistoryItem(status) {
    if (!sessionHistoryList) return;

    const taskName = currentTaskTitle ? currentTaskTitle.textContent : "Unknown Task";
    const timeElapsedSeconds = totalTimeInSeconds - timeLeft;
    const minutesElapsed = Math.floor(timeElapsedSeconds / 60);
    let htmlString = "";

    if (status === 'completed') {
        const endTime = new Date();
        const timeString = sessionStartTime ? `${formatAMPM(sessionStartTime)} - ${formatAMPM(endTime)}` : 'Just now';
        const durationStr = `${Math.floor(totalTimeInSeconds / 60)}m`;

        htmlString = `
        <div class="history-item group relative flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
            <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-on-surface-variant">
                <span class="material-symbols-outlined text-primary" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <div class="flex-1 min-w-0 pointer-events-none">
                <p class="font-body-md text-body-md font-medium text-on-surface truncate">${taskName}</p>
                <p class="font-label-sm text-label-sm text-outline mt-unit">${timeString}</p>
            </div>
            <div class="text-right pointer-events-none transition-opacity group-hover:opacity-0">
                <span class="font-h3 text-h3 text-primary">${durationStr}</span>
            </div>
            <button class="delete-btn absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-outline hover:text-error transition-opacity">
                <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </div>`;
    } else {
        const timeString = minutesElapsed > 0 ? `${minutesElapsed}m` : `< 1m`;
        htmlString = `
        <div class="history-item group relative flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer opacity-70 border border-transparent hover:border-outline-variant">
            <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-outline">
                <span class="material-symbols-outlined" data-icon="cancel">cancel</span>
            </div>
            <div class="flex-1 min-w-0 pointer-events-none">
                <p class="font-body-md text-body-md font-medium text-on-surface truncate line-through">${taskName}</p>
                <p class="font-label-sm text-label-sm text-error mt-unit">Interrupted</p>
            </div>
            <div class="text-right pointer-events-none transition-opacity group-hover:opacity-0">
                <span class="font-h3 text-h3 text-on-surface-variant">${timeString}</span>
            </div>
            <button class="delete-btn absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-outline hover:text-error transition-opacity">
                <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </div>`;
    }
    sessionHistoryList.insertAdjacentHTML('afterbegin', htmlString);
}

// ==========================================
// --- 5. TƯƠNG TÁC GIAO DIỆN ---
// ==========================================

// Sự kiện cho Sidebar: Start Focus Session
if (startFocusBtn) {
    startFocusBtn.addEventListener('click', () => {
        // Cuộn màn hình xuống vùng có đồng hồ (rất tiện cho dùng điện thoại)
        display.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Nếu đồng hồ đang dừng thì tự động bật luôn
        if (!isRunning) {
            toggleTimer();
        }
    });
}

// Sự kiện Lịch sử (Xóa & Tái sử dụng)
if (sessionHistoryList) {
    sessionHistoryList.addEventListener('click', function(e) {
        // Nút xóa
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const item = deleteBtn.closest('.history-item'); 
            if (item) {
                item.style.transition = 'opacity 0.2s';
                item.style.opacity = '0';
                setTimeout(() => item.remove(), 200); 
            }
            return;
        }

        // Click để set lại tên Task
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            // Lấy tên thông qua class truncate (vì tiêu đề task đang dùng class này)
            const taskNameEl = historyItem.querySelector('.truncate');
            if (taskNameEl && currentTaskTitle) {
                currentTaskTitle.textContent = taskNameEl.textContent;
                currentTaskTitle.style.transition = 'color 0.3s ease';
                currentTaskTitle.style.color = '#3525cd'; 
                setTimeout(() => currentTaskTitle.style.color = '', 500); 
            }
        }
    });
}

// Dọn dẹp tất cả (Nút 3 chấm)
if (clearHistoryMenu) {
    clearHistoryMenu.addEventListener('click', () => {
        if (!sessionHistoryList || sessionHistoryList.children.length === 0) return; 
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
            sessionHistoryList.innerHTML = '';
        }
    });
}

// Nút Thống kê (View All History)
if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
        if (!sessionHistoryList) return;
        const allItems = sessionHistoryList.querySelectorAll('.history-item');
        let completedCount = 0;
        let interruptedCount = 0;

        allItems.forEach(item => {
            if (item.innerHTML.includes('check_circle')) completedCount++;
            else if (item.innerHTML.includes('cancel')) interruptedCount++;
        });

        if (allItems.length === 0) {
            alert("Lịch sử trống. Hãy bấm Start Focus Session để bắt đầu!");
        } else {
            alert(`📊 THỐNG KÊ LỊCH SỬ:\n\n• Tổng số phiên: ${allItems.length}\n• Hoàn thành: ${completedCount} 🏆\n• Bị gián đoạn: ${interruptedCount} ⚠️`);
        }
    });
}

// ==========================================
// --- 6. KHỞI TẠO ---
// ==========================================
if (playPauseBtn) playPauseBtn.addEventListener('click', toggleTimer);
if (stopBtn) stopBtn.addEventListener('click', stopTimer);
if (skipBtn) skipBtn.addEventListener('click', skipTimer);

// Vẽ giao diện lần đầu
updateDisplay();
