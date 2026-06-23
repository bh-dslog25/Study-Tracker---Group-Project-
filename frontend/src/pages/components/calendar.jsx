import React, { useState, useMemo, useEffect } from 'react';
import { loadJSON, saveJSON } from '../../utils/storage';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateStr = (str) => {
  const [y, m, d] = str.split('-');
  return new Date(y, m - 1, d);
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const PRIORITY_STYLES = {
  high:       { bg: 'bg-red-100',    text: 'text-red-800',    bar: 'bg-red-500',   chip: 'bg-red-100 text-red-800',   label: 'High Priority' },
  medium:     { bg: 'bg-green-100',  text: 'text-green-800',  bar: 'bg-green-600', chip: 'bg-green-100 text-green-800', label: 'Medium' },
  assignment: { bg: 'bg-cyan-100',   text: 'text-cyan-800',   bar: 'bg-cyan-600',  chip: 'bg-cyan-100 text-cyan-800',   label: 'Assignment' },
};

const CALENDAR_TASKS_KEY = 'study_tracker_calendar_tasks';
const CALENDAR_SELECTED_DATE_KEY = 'study_tracker_calendar_selected_date';

// Keys used by other pages
const TIMER_SESSIONS_KEY = 'study_tracker_timer_sessions';
const TASKS_STORAGE_KEY = 'study_tracker_tasks';

const INITIAL_TASKS = {
  '2026-05-09': [
    { id: 1, title: 'History Midterm', time: '10:00 AM', priority: 'high',       desc: 'Chapters 4-8. Focus on the industrial revolution impacts.' },
    { id: 2, title: 'Review Notes',    time: '2:00 PM',  priority: 'medium',     desc: 'Consolidate lecture notes for upcoming CS seminar.' },
    { id: 3, title: 'Lab Report Due',  time: '11:59 PM', priority: 'assignment', desc: 'Physics lab report' },
  ],
  '2026-05-11': [
    { id: 4, title: 'Project Pitch',   time: '09:00 AM', priority: 'high',       desc: 'System Analysis and Design presentation.' },
  ],
};

// ── Modal component ───────────────────────────────────────────────────────────
function TaskModal({ isOpen, isEditing, form, setForm, onSave, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {isEditing ? 'Chỉnh sửa Nhiệm vụ' : 'Tạo Nhiệm vụ Mới'}
        </h2>
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Tên Nhiệm vụ (ví dụ: Đọc Chương 4)"
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-indigo-500"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              type="time"
              className="w-1/2 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-indigo-500"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <select
              className="w-1/2 p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-indigo-500"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <textarea
            placeholder="Mô tả (tùy chọn)"
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-indigo-500 resize-none h-20"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Lưu Nhiệm vụ
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Calendar component ───────────────────────────────────────────────────
export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate]     = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate]   = useState(() => loadJSON(CALENDAR_SELECTED_DATE_KEY, formatDate(today)));
  const [tasksData, setTasksData]         = useState(() => loadJSON(CALENDAR_TASKS_KEY, INITIAL_TASKS));
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState({ title: '', time: '', priority: 'high', desc: '' });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Calendar grid cells ───────────────────────────────────────────────────
  const cells = useMemo(() => {
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    const result      = [];

    // Prev month filler
    for (let i = firstDay - 1; i >= 0; i--)
      result.push({ type: 'filler', day: daysInPrev - i });

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month, d));
      result.push({ type: 'current', day: d, dateStr });
    }

    // Next month filler
    const total = result.length;
    const rows  = Math.ceil(total / 7);
    for (let d = 1; d <= rows * 7 - total; d++)
      result.push({ type: 'filler', day: d });

    return result;
  }, [year, month]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDate(today));
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null);
    setForm({ title: '', time: '', priority: 'high', desc: '' });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingId(task.id);
    let timeVal = '';
    if (task.time && task.time !== 'All Day') {
      const [timePart, mod] = task.time.split(' ');
      let [h, min] = timePart.split(':');
      h = parseInt(h);
      if (mod === 'PM' && h < 12) h += 12;
      if (mod === 'AM' && h === 12) h = 0;
      timeVal = `${String(h).padStart(2,'0')}:${min}`;
    }
    setForm({ title: task.title, time: timeVal, priority: task.priority, desc: task.desc || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { alert('Vui lòng nhập tên công việc!'); return; }

    let formattedTime = 'All Day';
    if (form.time) {
      let [h, min] = form.time.split(':');
      h = parseInt(h);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      formattedTime = `${h}:${min} ${ampm}`;
    }

    setTasksData((prev) => {
      const list = [...(prev[selectedDate] || [])];
      const newId = Date.now();
      if (editingId) {
        const idx = list.findIndex((t) => t.id === editingId);
        if (idx > -1) list[idx] = { id: editingId, title: form.title, time: formattedTime, priority: form.priority, desc: form.desc };
      } else {
        list.push({ id: newId, title: form.title, time: formattedTime, priority: form.priority, desc: form.desc });

        // Also add to Timer sessions (default duration 25) so user can track it immediately
        try {
          const existing = loadJSON(TIMER_SESSIONS_KEY, []);
          const exists = existing.some((s) => s.id === newId);
          if (!exists) {
            const newSession = { id: newId, title: form.title, project: selectedDate, duration: 25 };
            saveJSON(TIMER_SESSIONS_KEY, [...existing, newSession]);
          }
        } catch (e) {
          console.warn('Failed to add session to Timer from Calendar', e);
        }

        // Also add to Tasks page storage so it appears in Tasks list
        try {
          const existingTasks = loadJSON(TASKS_STORAGE_KEY, []);
          const existsT = existingTasks.some((t) => t.id === newId);
          if (!existsT) {
            const newTaskItem = { id: newId, name: form.title, deadline: selectedDate, goal: '', priority: 'medium', description: form.desc || '', done: false };
            saveJSON(TASKS_STORAGE_KEY, [...existingTasks, newTaskItem]);
          }
        } catch (e) {
          console.warn('Failed to add task to Tasks storage from Calendar', e);
        }
      }
      return { ...prev, [selectedDate]: list };
    });
    setModalOpen(false);
  };

  useEffect(() => {
    saveJSON(CALENDAR_TASKS_KEY, tasksData);
  }, [tasksData]);

  useEffect(() => {
    saveJSON(CALENDAR_SELECTED_DATE_KEY, selectedDate);
  }, [selectedDate]);

  const handleDelete = (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasksData((prev) => {
      const list = (prev[selectedDate] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (list.length === 0) delete next[selectedDate];
      else next[selectedDate] = list;
      return next;
    });
  };

  // ── Side panel data ───────────────────────────────────────────────────────
  const selectedDateObj  = parseDateStr(selectedDate);
  const selectedLabel    = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const dayTasks         = tasksData[selectedDate] || [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f9f9ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Lịch</h1>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
            Today
          </button>
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="text-base font-semibold text-gray-800 w-40 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Calendar grid ─────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 flex-1 border-l border-t border-gray-200">
            {cells.map((cell, idx) => {
              if (cell.type === 'filler') return (
                <div key={`f-${idx}`} className="border-r border-b border-gray-200 p-2 min-h-[100px] bg-gray-50 opacity-50 cursor-not-allowed">
                  <span className="text-xs text-gray-400 ml-1">{cell.day}</span>
                </div>
              );

              const isSelected = cell.dateStr === selectedDate;
              const isToday    = cell.dateStr === formatDate(today);
              const cellTasks  = tasksData[cell.dateStr] || [];

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`border-r border-b border-gray-200 p-2 min-h-[100px] flex flex-col cursor-pointer transition-colors relative
                    ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : 'bg-white hover:bg-gray-50'}`}
                >
                  <span className={`text-xs font-semibold ml-1 mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                    {cell.day}
                  </span>
                  {cellTasks.map((t) => (
                    <div key={t.id} className={`${PRIORITY_STYLES[t.priority].chip} text-[10px] font-semibold px-1.5 py-0.5 rounded mb-0.5 truncate`}>
                      {t.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </main>

        {/* ── Side panel ────────────────────────────────── */}
        <aside className="w-72 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-base font-bold text-gray-900">{selectedLabel}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {dayTasks.length === 0 ? '0 mục được lên lịch' : `${dayTasks.length} ${dayTasks.length === 1 ? 'mục' : 'mục'} được lên lịch`}
            </p>
            <button
              onClick={openNew}
              className="mt-3 w-full flex items-center justify-center gap-1.5 border border-gray-300 text-indigo-600 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Nhiệm vụ mới
            </button>
          </div>

          {/* Task list */}
          <div className="p-3 flex flex-col gap-2 overflow-y-auto flex-1">
            {dayTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-6">Không có nhiệm vụ nào được lên lịch cho ngày này.</p>
            ) : (
              dayTasks.map((task) => {
                const s = PRIORITY_STYLES[task.priority];
                return (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
                    <div className="flex justify-between items-start mb-1.5 pl-2">
                      <span className={`${s.chip} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{s.label}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {task.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 pl-2 mb-0.5">{task.title}</h4>
                    {task.desc && <p className="text-xs text-gray-500 pl-2 line-clamp-2">{task.desc}</p>}
                    <div className="mt-2 pl-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(task)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* ── Modal ─────────────────────────────────────────── */}
      <TaskModal
        isOpen={modalOpen}
        isEditing={!!editingId}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}