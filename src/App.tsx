import React, { useState, useEffect, useRef } from 'react';
import { TimerMode, Task, SessionHistory } from './types';
import { playChime } from './utils/audio';
import TaskList from './components/TaskList';
import SettingsModal from './components/SettingsModal';
import HistoryLog from './components/HistoryLog';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Timer as TimerIcon,
  SkipForward,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- STATE INITIALIZATION ---
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoro_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      workTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      autoStartBreaks: false,
      autoStartWork: false,
    };
  });

  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  
  // Time state (stored in seconds)
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [totalDuration, setTotalDuration] = useState(settings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Task state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SessionHistory[]>(() => {
    const saved = localStorage.getItem('pomodoro_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('pomodoro_muted');
    return saved === 'true';
  });

  // --- LOCAL PERSISTENCE TRIGGERS ---
  useEffect(() => {
    localStorage.setItem('pomodoro_muted', String(isMuted));
  }, [isMuted]);

  // --- DYNAMIC BACKGROUND & COLOR CONFIGS ---
  const getTheme = () => {
    switch (mode) {
      case TimerMode.WORK:
        return {
          bg: 'bg-[#0A0502]',
          atmosphere: 'radial-gradient(circle at 50% 50%, #2a0a0a 0%, #050202 100%), radial-gradient(circle at 20% 20%, #3a1510 0%, transparent 50%)',
          cardBorder: 'border-white/[0.08]',
          ringStroke: '#dc2626',
          ringTrack: 'rgba(255, 255, 255, 0.05)',
          accentName: 'rose',
          textAccent: 'text-red-500',
          bgAccent: 'bg-white hover:bg-slate-100 text-black',
          badge: 'bg-red-500/10 border-red-500/25 text-red-400',
          tabActive: 'bg-white/12 text-white border border-white/10 shadow-lg',
          tabHover: 'hover:text-white hover:bg-white/5 text-white/40',
          controlHover: 'hover:bg-white/10 text-white',
          accentLight: 'rgba(220, 38, 38, 0.1)',
          glowShadow: '0 0 40px rgba(220, 38, 38, 0.35)',
        };
      case TimerMode.SHORT_BREAK:
        return {
          bg: 'bg-[#030605]',
          atmosphere: 'radial-gradient(circle at 50% 50%, #0a2d1a 0%, #020503 100%), radial-gradient(circle at 20% 20%, #103a25 0%, transparent 50%)',
          cardBorder: 'border-white/[0.08]',
          ringStroke: '#10b981',
          ringTrack: 'rgba(255, 255, 255, 0.05)',
          accentName: 'emerald',
          textAccent: 'text-emerald-400',
          bgAccent: 'bg-white hover:bg-slate-100 text-black',
          badge: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
          tabActive: 'bg-white/12 text-white border border-white/10 shadow-lg',
          tabHover: 'hover:text-white hover:bg-white/5 text-white/40',
          controlHover: 'hover:bg-white/10 text-white',
          accentLight: 'rgba(16, 185, 129, 0.1)',
          glowShadow: '0 0 40px rgba(16, 185, 129, 0.35)',
        };
      case TimerMode.LONG_BREAK:
        return {
          bg: 'bg-[#030508]',
          atmosphere: 'radial-gradient(circle at 50% 50%, #0a1c2d 0%, #020305 100%), radial-gradient(circle at 20% 20%, #10243a 0%, transparent 50%)',
          cardBorder: 'border-white/[0.08]',
          ringStroke: '#0ea5e9',
          ringTrack: 'rgba(255, 255, 255, 0.05)',
          accentName: 'sky',
          textAccent: 'text-sky-400',
          bgAccent: 'bg-white hover:bg-slate-100 text-black',
          badge: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
          tabActive: 'bg-white/12 text-white border border-white/10 shadow-lg',
          tabHover: 'hover:text-white hover:bg-white/5 text-white/40',
          controlHover: 'hover:bg-white/10 text-white',
          accentLight: 'rgba(14, 165, 233, 0.1)',
          glowShadow: '0 0 40px rgba(14, 165, 233, 0.35)',
        };
    }
  };

  const theme = getTheme();

  // --- DOCUMENT TITLE REFLECTION ---
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel =
      mode === TimerMode.WORK
        ? 'Work'
        : mode === TimerMode.SHORT_BREAK
        ? 'Short Break'
        : 'Long Break';

    if (isRunning) {
      document.title = `(${timeStr}) ${modeLabel} | Pomodoro Timer`;
    } else {
      document.title = 'Pomodoro Timer';
    }
  }, [timeLeft, isRunning, mode]);

  // --- INTERVAL CLOCK LOOP ---
  useEffect(() => {
    let timerId: any = null;
    if (isRunning) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerId) clearInterval(timerId);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, mode, totalDuration, settings]);

  // --- TIMER LOGIC HANDLERS ---
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isMuted) {
      playChime('complete');
    }

    // Add session to log history
    const newSession: SessionHistory = {
      id: generateId(),
      mode,
      durationSeconds: totalDuration,
      timestamp: Date.now(),
    };
    const updatedHistory = [...history, newSession];
    setHistory(updatedHistory);
    localStorage.setItem('pomodoro_history', JSON.stringify(updatedHistory));

    // If it was a Work session, award a Pomodoro to the active task (if any)
    if (mode === TimerMode.WORK) {
      if (activeTaskId) {
        const updatedTasks = tasks.map((t) =>
          t.id === activeTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t
        );
        setTasks(updatedTasks);
        localStorage.setItem('pomodoro_tasks', JSON.stringify(updatedTasks));
      }

      // Automatically determine the next break (Every 4th completed Work session is a Long Break)
      const completedWorkSessions = updatedHistory.filter((h) => h.mode === TimerMode.WORK).length;
      const nextMode = completedWorkSessions % 4 === 0 ? TimerMode.LONG_BREAK : TimerMode.SHORT_BREAK;
      
      setMode(nextMode);
      const nextMins = nextMode === TimerMode.LONG_BREAK ? settings.longBreakTime : settings.shortBreakTime;
      setTimeLeft(nextMins * 60);
      setTotalDuration(nextMins * 60);

      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 500);
      }
    } else {
      // Break session completed -> Back to work
      setMode(TimerMode.WORK);
      setTimeLeft(settings.workTime * 60);
      setTotalDuration(settings.workTime * 60);

      if (settings.autoStartWork) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  };

  const toggleTimer = () => {
    if (!isMuted) {
      playChime('click');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (!isMuted) {
      playChime('click');
    }
    setIsRunning(false);
    let mins = settings.workTime;
    if (mode === TimerMode.SHORT_BREAK) mins = settings.shortBreakTime;
    if (mode === TimerMode.LONG_BREAK) mins = settings.longBreakTime;
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
  };

  const skipTimer = () => {
    if (!isMuted) {
      playChime('switch');
    }
    // Perform manual switch to next phase as if it finished
    handleTimerComplete();
  };

  const switchMode = (newMode: TimerMode) => {
    if (newMode === mode) return;
    
    if (!isMuted) {
      playChime('switch');
    }
    setIsRunning(false);
    setMode(newMode);

    let mins = settings.workTime;
    if (newMode === TimerMode.SHORT_BREAK) mins = settings.shortBreakTime;
    if (newMode === TimerMode.LONG_BREAK) mins = settings.longBreakTime;
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
  };

  // --- SETTINGS DISPATCHERS ---
  const handleSaveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoro_settings', JSON.stringify(newSettings));
    
    // Recalculate timer if not running
    if (!isRunning) {
      let mins = newSettings.workTime;
      if (mode === TimerMode.SHORT_BREAK) mins = newSettings.shortBreakTime;
      if (mode === TimerMode.LONG_BREAK) mins = newSettings.longBreakTime;
      setTimeLeft(mins * 60);
      setTotalDuration(mins * 60);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('pomodoro_history');
    localStorage.removeItem('pomodoro_tasks');
    setHistory([]);
    setTasks([]);
    setActiveTaskId(null);
  };

  // --- TASK LIST DISPATCHERS ---
  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      pomodoros: 0,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem('pomodoro_tasks', JSON.stringify(updated));

    // Auto-focus the newly created task if there isn't one active
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (id: string) => {
    if (!isMuted) {
      playChime('click');
    }
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    localStorage.setItem('pomodoro_tasks', JSON.stringify(updated));

    // If active task was marked completed, clear current focus
    if (id === activeTaskId) {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        setActiveTaskId(null);
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem('pomodoro_tasks', JSON.stringify(updated));
    if (id === activeTaskId) {
      setActiveTaskId(null);
    }
  };

  // --- MATH HELPER FOR STROKE OFFSET ---
  const SVG_RADIUS = 100;
  const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS;
  const progressRatio = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const strokeDashoffset = SVG_CIRCUMFERENCE * (1 - progressRatio);

  const formatTimerDigits = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const { minutes, seconds } = formatTimerDigits();

  const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 11);
  };

  return (
    <div className={`min-h-screen bg-[#0A0502] text-white/90 relative overflow-hidden flex flex-col justify-between p-4 md:p-8 font-sans transition-colors duration-1000`}>
      
      {/* DYNAMIC AMBIENT BACKDROP ATMOSPHERE */}
      <div 
        className="atmosphere" 
        style={{ 
          background: theme.atmosphere,
          transition: 'background 1.5s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} 
      />

      {/* HEADER SECTION */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between select-none shrink-0 py-2 z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-700">
            <TimerIcon className={`w-5 h-5 ${theme.textAccent} transition-colors duration-700`} />
          </div>
          <div>
            <h1 className="font-display font-bold text-base leading-tight tracking-[0.05em] text-white">
              Deep Focus
            </h1>
            <p className="text-[9px] text-white/30 font-semibold tracking-[0.25em] uppercase">
              Pomodoro Engine
            </p>
          </div>
        </div>

        {/* Global Controls (Mute / Settings Toggles) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 glass-panel rounded-xl text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 glass-panel rounded-xl text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Configure intervals"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN TIMER DASHBOARD CARD */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-md w-full mx-auto my-4 shrink-0 z-10 relative">
        <div className="glass-panel rounded-[32px] p-6 md:p-7 w-full relative transition-all duration-700 flex flex-col gap-5">
          
          {/* TAB MODE SWITCHER */}
          <nav className="bg-white/[0.03] border border-white/[0.06] p-1 rounded-2xl flex gap-1 justify-between select-none">
            <button
              onClick={() => switchMode(TimerMode.WORK)}
              className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === TimerMode.WORK ? theme.tabActive : `text-white/40 ${theme.tabHover}`
              }`}
            >
              Work
            </button>
            <button
              onClick={() => switchMode(TimerMode.SHORT_BREAK)}
              className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === TimerMode.SHORT_BREAK ? theme.tabActive : `text-white/40 ${theme.tabHover}`
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => switchMode(TimerMode.LONG_BREAK)}
              className={`flex-1 text-center py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === TimerMode.LONG_BREAK ? theme.tabActive : `text-white/40 ${theme.tabHover}`
              }`}
            >
              Long Break
            </button>
          </nav>

          {/* CIRCULAR TIMER DISPLAY CONTAINER */}
          <div className="flex flex-col items-center justify-center relative py-1">
            <div className="relative w-[210px] h-[210px] flex items-center justify-center select-none">
              
              {/* SVG Ring Path */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 230 230">
                {/* Background Ring */}
                <circle
                  cx="115"
                  cy="115"
                  r={SVG_RADIUS}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="5"
                  className="transition-all duration-700"
                />
                
                {/* Animated Inner Core Progress Ring */}
                <motion.circle
                  cx="115"
                  cy="115"
                  r={SVG_RADIUS}
                  fill="transparent"
                  stroke={theme.ringStroke}
                  strokeWidth="6"
                  strokeDasharray={SVG_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset }}
                  transition={{ ease: 'linear', duration: 0.25 }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Pulsing Backlit Aura when running */}
              {isRunning && (
                <div
                  className="absolute inset-10 rounded-full blur-3xl transition-all opacity-30 duration-1000 animate-pulse pointer-events-none"
                  style={{ backgroundColor: theme.ringStroke }}
                />
              )}

              {/* Central Clock Values */}
              <div className="relative text-center z-10 flex flex-col items-center justify-center">
                {/* Mode Label Badge */}
                <span className={`inline-block px-3 py-0.5 text-[9px] font-bold tracking-[0.18em] uppercase rounded-full border ${theme.badge} mb-2 select-none`}>
                  {mode === TimerMode.WORK ? 'WORK Session' : 'BREAK Session'}
                </span>
                
                {/* Count Down Clock */}
                <div 
                  className="font-display text-[58px] font-extralight tracking-tight leading-none text-white transition-all duration-700 select-none"
                  style={{ textShadow: theme.glowShadow }}
                >
                  {minutes}
                  <span className="animate-pulse relative -top-0.5 mx-0.5 opacity-80">:</span>
                  {seconds}
                </div>

                {/* Focus prompt details */}
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mt-2.5">
                  {isRunning ? 'FOCUS TARGET' : 'PAUSED'}
                </p>
              </div>
            </div>
          </div>

          {/* TIMER TACTILE CONTROLS PANEL */}
          <div className="flex items-center justify-center gap-5">
            {/* Reset Button */}
            <button
              onClick={resetTimer}
              className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Core Play/Pause Toggle */}
            <button
              onClick={toggleTimer}
              className="px-10 py-4.5 rounded-full bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl hover:shadow-white/5 cursor-pointer"
              title={isRunning ? 'Pause interval' : 'Start interval'}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-black text-black" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Start</span>
                </>
              )}
            </button>

            {/* Skip / Jump to next cycle */}
            <button
              onClick={skipTimer}
              className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              title="Skip this cycle"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="border-t border-white/[0.06] my-1" />

          {/* TASK LIST PANEL INTEGRATED DIRECTLY */}
          <div>
            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onSelectActiveTask={setActiveTaskId}
              themeColor={theme.accentName}
            />
          </div>

          {/* SETTINGS OVERLAY DISPLAY PORTAL */}
          <AnimatePresence>
            {isSettingsOpen && (
              <SettingsModal
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onClose={() => setIsSettingsOpen(false)}
                onClearHistory={handleClearHistory}
                themeColor={theme.accentName}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* HISTORY LOGS (STACKED AT BASE) */}
      <footer className="max-w-md w-full mx-auto shrink-0 pb-4 z-10 relative">
        <HistoryLog history={history} themeColor={theme.accentName} />
        
        {/* Simple Inspirational Badge */}
        <p className="text-center text-[9px] font-semibold text-white/20 uppercase tracking-[0.25em] mt-4 flex items-center justify-center gap-1.5 select-none">
          <Sparkles className="w-3 h-3 text-amber-500/55" />
          Quiet composure yields supreme focus
        </p>
      </footer>
    </div>
  );
}
