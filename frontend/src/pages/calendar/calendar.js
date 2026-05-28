document.addEventListener('DOMContentLoaded', () => {
    // --- 1. STATE & DATABASE ---
    // We now use YYYY-MM-DD format as keys so tasks work across different months/years
    let tasksData = {
        "2026-05-09": [
            { id: 1, title: "History Midterm", time: "10:00 AM", priority: "high", desc: "Chapters 4-8. Focus on the industrial revolution impacts." },
            { id: 2, title: "Review Notes", time: "2:00 PM", priority: "medium", desc: "Consolidate lecture notes for upcoming CS seminar." },
            { id: 3, title: "Lab Report Due", time: "11:59 PM", priority: "assignment", desc: "Physics lab report" }
        ],
        "2026-05-11": [
            { id: 4, title: "Project Pitch", time: "09:00 AM", priority: "high", desc: "System Analysis and Design presentation." }
        ]
    };

    let currentDate = new Date(); // The month currently being viewed
    let selectedDateStr = formatDate(new Date()); // The specific day the user clicked (Defaults to today)
    let editingTaskId = null;

    // --- 2. DOM ELEMENTS ---
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearTitle = document.getElementById('month-year-title');
    const sidePanelDate = document.getElementById('side-panel-date');
    const sidePanelTasks = document.getElementById('side-panel-tasks');
    
    // Navigation
    const btnPrev = document.getElementById('btn-prev-month');
    const btnNext = document.getElementById('btn-next-month');
    const btnToday = document.getElementById('btn-today');

    // Modal
    const modal = document.getElementById('task-modal');
    const btnNewTask = document.getElementById('btn-new-task');
    const btnCancel = document.getElementById('btn-cancel-task');
    const btnSave = document.getElementById('btn-save-task');
    const modalTitle = document.querySelector('#task-modal h2');

    const priorityStyles = {
        high: { bg: 'bg-error-container', text: 'text-on-error-container', bar: 'bg-error', label: 'High Priority' },
        medium: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', bar: 'bg-secondary', label: 'Medium' },
        assignment: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', bar: 'bg-tertiary', label: 'Assignment' }
    };

    // --- 3. HELPER FUNCTIONS ---
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`; // Returns format "2023-10-09"
    }

    function parseDateStr(dateStr) {
        const [y, m, d] = dateStr.split('-');
        return new Date(y, m - 1, d);
    }

    // --- 4. CORE RENDER FUNCTIONS ---

    // Generates the grid for the current month
    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Clear the old grid
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update Title (e.g., "October 2023")
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        if (monthYearTitle) monthYearTitle.textContent = `${monthNames[month]} ${year}`;

        // Date Math
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 28, 29, 30, or 31
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // 1. Render Previous Month's fading days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            calendarGrid.insertAdjacentHTML('beforeend', `
                <div class="bg-surface-bright p-2 min-h-[100px] flex flex-col opacity-50 cursor-not-allowed">
                    <span class="font-body-sm text-body-sm text-on-surface-variant ml-1">${dayNum}</span>
                </div>
            `);
        }

        // 2. Render Current Month's active days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(new Date(year, month, day));
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === formatDate(new Date());

            // Build Day Cell
            const cellDiv = document.createElement('div');
            cellDiv.className = `bg-surface-container-lowest p-2 min-h-[100px] flex flex-col hover:bg-surface-container-low transition-colors cursor-pointer ${isSelected ? 'relative bg-surface-container' : ''}`;
            cellDiv.dataset.date = dateStr;

            // Day Number Span
            let daySpanClass = "font-body-sm text-body-sm font-medium ml-1 mb-1 ";
            if (isToday) {
                daySpanClass += "text-on-primary bg-primary w-6 h-6 flex items-center justify-center rounded-full";
            } else {
                daySpanClass += "text-on-surface";
            }
            cellDiv.innerHTML = `<span class="${daySpanClass}">${day}</span>`;

            // Active Ring
            if (isSelected) {
                cellDiv.insertAdjacentHTML('beforeend', '<div class="absolute inset-0 border-2 border-primary rounded z-10 pointer-events-none"></div>');
            }

            // Append Task Chips
            if (tasksData[dateStr]) {
                tasksData[dateStr].forEach(task => {
                    const style = priorityStyles[task.priority];
                    cellDiv.insertAdjacentHTML('beforeend', `<div class="${style.bg} ${style.text} font-label-sm text-label-sm px-1.5 py-0.5 rounded mb-1 truncate shadow-sm">${task.title}</div>`);
                });
            }

            // Click Event to select day
            cellDiv.addEventListener('click', () => {
                selectedDateStr = dateStr;
                renderCalendar();
                renderSidePanel();
            });

            calendarGrid.appendChild(cellDiv);
        }

        // 3. Render Next Month's fading days to fill the 35-cell grid
        const totalCellsRendered = firstDayOfMonth + daysInMonth;
        const remainingCells = 35 - totalCellsRendered; // Standard 5-row grid
        
        for (let day = 1; day <= (remainingCells > 0 ? remainingCells : 42 - totalCellsRendered); day++) {
            calendarGrid.insertAdjacentHTML('beforeend', `
                <div class="bg-surface-bright p-2 min-h-[100px] flex flex-col opacity-50 cursor-not-allowed">
                    <span class="font-body-sm text-body-sm text-on-surface-variant ml-1">${day}</span>
                </div>
            `);
        }
    }

    // Renders the Task List on the right
    function renderSidePanel() {
        const selectedDateObj = parseDateStr(selectedDateStr);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        sidePanelDate.textContent = selectedDateObj.toLocaleDateString('en-US', options); // e.g., "Monday, Oct 9"
        
        sidePanelTasks.innerHTML = ''; 
        const dayTasks = tasksData[selectedDateStr] || [];
        const subTitle = sidePanelDate.nextElementSibling;
        
        if (dayTasks.length === 0) {
            sidePanelTasks.innerHTML = `<p class="text-on-surface-variant text-center mt-4">No tasks scheduled for this day.</p>`;
            if (subTitle) subTitle.textContent = "0 items scheduled";
            return;
        }

        if (subTitle) subTitle.textContent = `${dayTasks.length} ${dayTasks.length === 1 ? 'item' : 'items'} scheduled`;

        dayTasks.forEach(task => {
            const style = priorityStyles[task.priority];
            const taskHTML = `
                <div class="bg-surface-bright border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group cursor-default relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 ${style.bar}"></div>
                    <div class="flex justify-between items-start mb-2 pl-2">
                        <span class="${style.bg} ${style.text} font-label-sm text-label-sm px-2 py-0.5 rounded-full">${style.label}</span>
                        <span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">schedule</span> ${task.time}
                        </span>
                    </div>
                    <h4 class="font-body-lg text-body-lg font-semibold text-on-surface pl-2 mb-1">${task.title}</h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant pl-2 line-clamp-2">${task.desc || ''}</p>
                    
                    <div class="mt-3 pl-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="btn-edit-task text-on-surface-variant hover:text-primary transition-colors" data-id="${task.id}">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button class="btn-delete-task text-on-surface-variant hover:text-error transition-colors" data-id="${task.id}">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </div>
            `;
            sidePanelTasks.insertAdjacentHTML('beforeend', taskHTML);
        });

        setupTaskEvents();
    }

    // --- 5. EVENT LISTENERS ---

    // Edit and Delete Tasks
    function setupTaskEvents() {
        document.querySelectorAll('.btn-delete-task').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); 
                const taskId = parseInt(this.getAttribute('data-id'));
                if (confirm("Are you sure you want to delete this task?")) {
                    if (tasksData[selectedDateStr]) {
                        tasksData[selectedDateStr] = tasksData[selectedDateStr].filter(task => task.id !== taskId);
                        if (tasksData[selectedDateStr].length === 0) delete tasksData[selectedDateStr];
                    }
                    renderCalendar();
                    renderSidePanel();
                }
            });
        });

        document.querySelectorAll('.btn-edit-task').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const taskId = parseInt(this.getAttribute('data-id'));
                const taskToEdit = tasksData[selectedDateStr].find(task => task.id === taskId);

                if (taskToEdit) {
                    document.getElementById('task-title').value = taskToEdit.title;
                    document.getElementById('task-desc').value = taskToEdit.desc || '';
                    document.getElementById('task-priority').value = taskToEdit.priority;

                    if (taskToEdit.time && taskToEdit.time !== "All Day") {
                        let [timeStr, modifier] = taskToEdit.time.split(' ');
                        let [hours, minutes] = timeStr.split(':');
                        hours = parseInt(hours, 10);
                        if (modifier === 'PM' && hours < 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;
                        document.getElementById('task-time').value = `${hours.toString().padStart(2, '0')}:${minutes}`;
                    } else {
                        document.getElementById('task-time').value = '';
                    }

                    editingTaskId = taskId;
                    modalTitle.textContent = "Edit Task";
                    modal.classList.remove('hidden');
                }
            });
        });
    }

    // Month Navigation
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (btnToday) {
        btnToday.addEventListener('click', () => {
            currentDate = new Date();
            selectedDateStr = formatDate(currentDate);
            renderCalendar();
            renderSidePanel();
        });
    }

    // Modal Controls
    if (btnNewTask) {
        btnNewTask.addEventListener('click', () => {
            editingTaskId = null; 
            modalTitle.textContent = "Create New Task";
            document.getElementById('task-title').value = '';
            document.getElementById('task-time').value = '';
            document.getElementById('task-desc').value = '';
            document.getElementById('task-priority').value = 'high'; 
            modal.classList.remove('hidden');
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const title = document.getElementById('task-title').value;
            const timeInput = document.getElementById('task-time').value;
            const priority = document.getElementById('task-priority').value;
            const desc = document.getElementById('task-desc').value;

            if (!title) {
                alert("Vui lòng nhập tên công việc!");
                return;
            }

            let formattedTime = "All Day";
            if (timeInput) {
                let [hour, minute] = timeInput.split(':');
                let ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                formattedTime = `${hour}:${minute} ${ampm}`;
            }

            if (!tasksData[selectedDateStr]) {
                tasksData[selectedDateStr] = [];
            }

            if (editingTaskId) {
                const taskIndex = tasksData[selectedDateStr].findIndex(t => t.id === editingTaskId);
                if (taskIndex > -1) {
                    tasksData[selectedDateStr][taskIndex] = {
                        id: editingTaskId, 
                        title: title,
                        time: formattedTime,
                        priority: priority,
                        desc: desc
                    };
                }
            } else {
                tasksData[selectedDateStr].push({
                    id: Date.now(),
                    title: title,
                    time: formattedTime,
                    priority: priority,
                    desc: desc
                });
            }

            modal.classList.add('hidden');
            editingTaskId = null; 
            
            renderCalendar();
            renderSidePanel();
        });
    }

    // --- INITIALIZE ---
    renderCalendar();
    renderSidePanel();
});