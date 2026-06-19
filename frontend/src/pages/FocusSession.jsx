import React, { useState, useEffect, useRef } from 'react';

const FocusSession = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Mặc định 25 phút
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);

  const durations = [
    { label: '25 min', value: 25, desc: 'Standard Pomodoro' },
    { label: '45 min', value: 45, desc: 'Deep focus session' },
    { label: '60 min', value: 60, desc: 'Long study session' },
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Phiên học hoàn thành
      setIsActive(false);
      setCompletedSessions(prev => prev + 1);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setTimeLeft(selectedDuration * 60);
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
    setTimeLeft(selectedDuration * 60);
  };

  const handleDurationSelect = (value) => {
    if (!isActive) {
      setSelectedDuration(value);
      setTimeLeft(value * 60);
    }
  };

  // Tính phần trăm tiến độ
  const progress = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  // Circumference cho SVG circle
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Focus Session</h1>
        <p className="text-sm text-gray-500 mt-1">Focus on completing your study goals</p>
      </div>

      {/* Timer Circle */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="#3525cd"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Timer text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-slate-800">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-400 mt-2">
            {isActive ? 'Focusing...' : 'Ready to start'}
          </span>
        </div>
      </div>

      {/* Duration Selection */}
      <div className="flex gap-3">
        {durations.map((d) => (
          <button
            key={d.value}
            onClick={() => handleDurationSelect(d.value)}
            disabled={isActive}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedDuration === d.value
                ? 'bg-[#3525cd] text-white shadow-md shadow-indigo-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isActive ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="text-center">
              <div>{d.label}</div>
              <div className="text-[10px] opacity-75 mt-0.5">{d.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-[#3525cd] text-white hover:bg-[#2a1db5] hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            Start Focus
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-100 active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">stop</span>
            End Early
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="material-symbols-outlined text-[20px] text-green-500">check_circle</span>
          <span className="text-sm font-medium">Completed: <span className="font-bold text-slate-700">{completedSessions}</span> sessions</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="material-symbols-outlined text-[20px] text-[#3525cd]">self_improvement</span>
          <span className="text-sm font-medium">Total time: <span className="font-bold text-slate-700">{completedSessions * selectedDuration} mins</span></span>
        </div>
      </div>
    </div>
  );
};

export default FocusSession;