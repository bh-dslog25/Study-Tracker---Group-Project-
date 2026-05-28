
    // --- CẤU HÌNH BIẾN ---
    const TOTAL_MINUTES = 36;
    let totalTimeInSeconds = TOTAL_MINUTES * 60 + 36; 
    let timeLeft = totalTimeInSeconds;
    let timerInterval = null;
    let isRunning = false;

    // --- LẤY CÁC PHẦN TỬ TỪ DOM ---
    const display = document.getElementById('timer-display');
    const progressCircle = document.getElementById('progress-circle');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const stopBtn = document.getElementById('stop-btn');
    const skipBtn = document.getElementById('skip-btn');

    const currentTaskTitle = document.getElementById('current-task-title');
    const sessionHistoryList = document.getElementById('session-history-list');


    // Chu vi của vòng tròn (stroke-dasharray đang set là 289)
    const CIRCUMFERENCE = 289;

    // --- CÁC HÀM XỬ LÝ ---

    // 1. Cập nhật giao diện (Số giờ + Vòng tròn)
    function updateDisplay() {
        // Tính phút và giây
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // Định dạng hiển thị MM:SS (thêm số 0 ở đầu nếu < 10)
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Tính toán độ dài viền tròn còn lại
        // Khi đầy là 0, khi cạn là 289
        const progressOffset = CIRCUMFERENCE - (timeLeft / totalTimeInSeconds) * CIRCUMFERENCE;
        progressCircle.style.strokeDashoffset = progressOffset;
    }

    // 2. Hàm Bật / Tạm dừng
    function toggleTimer() {
        if (isRunning) {
            // Đang chạy -> Tạm dừng
            clearInterval(timerInterval);
            playPauseIcon.textContent = 'play_arrow'; // Đổi icon thành Play
        } else {
            // Đang dừng -> Chạy
            playPauseIcon.textContent = 'pause'; // Đổi icon thành Pause
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    // Hết giờ
                    clearInterval(timerInterval);
                    isRunning = false;
                    playPauseIcon.textContent = 'play_arrow';
                    
                    // Code xử lý khi hoàn thành Task ở đây (lưu lịch sử, âm thanh báo...)
                    alert("Hoàn thành phiên làm việc!"); 
                }
            }, 1000); // Lặp lại mỗi 1000ms = 1 giây
        }
        isRunning = !isRunning;
    }

    // 3. Hàm Dừng hẳn (Reset về ban đầu)
    function stopTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = totalTimeInSeconds; // Reset thời gian
        playPauseIcon.textContent = 'play_arrow';
        updateDisplay();
    }

    // 4. Hàm Bỏ qua (Skip) --> Cap nhat ham Skip
    function skipTimer() {

    // 1. Lấy tên task đang làm (nếu không có thì để mặc định)
    const taskName = currentTaskTitle ? currentTaskTitle.textContent : "Unknown Task";
    
    // 2. Tính toán xem bạn đã chạy được bao nhiêu phút trước khi bấm skip
    const timeElapsedSeconds = totalTimeInSeconds - timeLeft;
    const minutesElapsed = Math.floor(timeElapsedSeconds / 60);
    // Nếu chưa được 1 phút thì hiện "< 1m"
    const timeString = minutesElapsed > 0 ? `${minutesElapsed}m` : `< 1m`;

    // 3. Tạo code HTML cho item bị hủy (bê nguyên các class Tailwind từ mẫu của bạn sang)
    const interruptedItemHTML = `
    <div class="flex items-start gap-sm p-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-default opacity-70">
        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-outline">
            <span class="material-symbols-outlined" data-icon="cancel">cancel</span>
        </div>
        <div class="flex-1 min-w-0">
            <p class="font-body-md text-body-md font-medium text-on-surface truncate line-through">${taskName}</p>
            <p class="font-label-sm text-label-sm text-error mt-unit">Interrupted</p>
        </div>
        <div class="text-right">
            <span class="font-h3 text-h3 text-on-surface-variant">${timeString}</span>
        </div>
    </div>
    `;

    // 4. Bơm đoạn HTML vừa tạo lên ĐẦU danh sách lịch sử
    if (sessionHistoryList) {
        // afterbegin nghĩa là nhét vào ngay dưới thẻ mở <div>, đẩy các item cũ xuống dưới
        sessionHistoryList.insertAdjacentHTML('afterbegin', interruptedItemHTML);
    }

    //5. The Warudo
        stopTimer();
        // Sau này bạn có thể thêm logic chuyển sang Session nghỉ ngơi (Break time) ở đây
        alert("Đã bỏ qua Session này!");
    }

    // --- GẮN SỰ KIỆN CLick CHO NÚT ---
    playPauseBtn.addEventListener('click', toggleTimer);
    stopBtn.addEventListener('click', stopTimer);
    skipBtn.addEventListener('click', skipTimer);

    // Khởi tạo hiển thị lần đầu khi load trang
    updateDisplay();


/*### Cách hoạt động (Giải thích ngắn gọn):
* **`setInterval(..., 1000)`**: Cứ mỗi 1000ms (1 giây), nó sẽ trừ biến `timeLeft` đi 1 đơn vị.
* **Toán học vòng tròn**: Vòng tròn SVG của bạn có chu vi là `289` (do thuộc tính `stroke-dasharray="289"` bạn đã set). Bằng cách dùng toán học `(timeLeft / totalTimeInSeconds) * 289`, chúng ta tính ra được phần trăm thời gian còn lại tương ứng với độ dài vòng tròn và truyền vào `stroke-dashoffset` để tạo hiệu ứng thanh chạy tụt dần.
* **`padStart(2, '0')`**: Đảm bảo nếu giây là `9` thì sẽ hiển thị là `09` cho đẹp mắt.

Bạn chỉ cần paste đoạn JS này vào, gắn đúng các `id` vào HTML là bộ đếm giờ sẽ hoạt động như một ứng dụng thật!*/