import React, { useState } from 'react';
import { X, Volume2, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { playChime } from '../utils/audio';

interface Settings {
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

interface SettingsModalProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  onClose: () => void;
  onClearHistory: () => void;
  themeColor: string;
}

export default function SettingsModal({
  settings,
  onSaveSettings,
  onClose,
  onClearHistory,
  themeColor,
}: SettingsModalProps) {
  const [workTime, setWorkTime] = useState(settings.workTime);
  const [shortBreakTime, setShortBreakTime] = useState(settings.shortBreakTime);
  const [longBreakTime, setLongBreakTime] = useState(settings.longBreakTime);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartWork, setAutoStartWork] = useState(settings.autoStartWork);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      workTime: Math.max(1, Math.min(180, workTime)),
      shortBreakTime: Math.max(1, Math.min(60, shortBreakTime)),
      longBreakTime: Math.max(1, Math.min(120, longBreakTime)),
      autoStartBreaks,
      autoStartWork,
    });
    onClose();
  };

  const handleTestChime = () => {
    playChime('complete');
  };

  // Theme dynamic colors
  const accentBg = 
    themeColor === 'rose' ? 'bg-white text-black hover:bg-slate-200' : 
    themeColor === 'emerald' ? 'bg-white text-black hover:bg-slate-200' : 'bg-white text-black hover:bg-slate-200';

  const accentBorder = 
    themeColor === 'rose' ? 'focus:border-red-500/40 focus:ring-red-500/10' : 
    themeColor === 'emerald' ? 'focus:border-emerald-500/40 focus:ring-emerald-500/10' : 
    'focus:border-sky-500/40 focus:ring-sky-500/10';

  const checkboxAccent = 
    themeColor === 'rose' ? 'text-red-500 focus:ring-red-500/20' : 
    themeColor === 'emerald' ? 'text-emerald-500 focus:ring-emerald-500/20' : 
    'text-sky-500 focus:ring-sky-500/20';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md rounded-[32px] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="glass-panel w-full max-w-sm rounded-[24px] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[95%]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="font-display font-bold text-sm tracking-wide text-white">Timer Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* Time settings */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em]">Durations (Minutes)</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1.5">Work</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={workTime}
                  onChange={(e) => setWorkTime(parseInt(e.target.value) || 25)}
                  className={`w-full px-3 py-2 text-sm border border-white/10 rounded-xl text-center font-mono font-semibold text-white bg-white/[0.02] transition-all focus:bg-white/[0.04] focus:outline-none focus:ring-3 ${accentBorder}`}
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1.5">Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakTime}
                  onChange={(e) => setShortBreakTime(parseInt(e.target.value) || 5)}
                  className={`w-full px-3 py-2 text-sm border border-white/10 rounded-xl text-center font-mono font-semibold text-white bg-white/[0.02] transition-all focus:bg-white/[0.04] focus:outline-none focus:ring-3 ${accentBorder}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1.5">Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={longBreakTime}
                  onChange={(e) => setLongBreakTime(parseInt(e.target.value) || 15)}
                  className={`w-full px-3 py-2 text-sm border border-white/10 rounded-xl text-center font-mono font-semibold text-white bg-white/[0.02] transition-all focus:bg-white/[0.04] focus:outline-none focus:ring-3 ${accentBorder}`}
                />
              </div>
            </div>
          </div>

          {/* Automations */}
          <div className="space-y-3 border-t border-white/[0.06] pt-4">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em]">Automations</h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-medium text-white/70">Auto-start Breaks</span>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className={`w-4.5 h-4.5 rounded-md border-white/10 bg-white/[0.02] cursor-pointer ${checkboxAccent}`}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-medium text-white/70">Auto-start Work Sessions</span>
                <input
                  type="checkbox"
                  checked={autoStartWork}
                  onChange={(e) => setAutoStartWork(e.target.checked)}
                  className={`w-4.5 h-4.5 rounded-md border-white/10 bg-white/[0.02] cursor-pointer ${checkboxAccent}`}
                />
              </label>
            </div>
          </div>

          {/* Sound & Alerts */}
          <div className="space-y-3 border-t border-white/[0.06] pt-4">
            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.18em]">Audio Alert</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Test Chime Alert Sound</span>
              <button
                type="button"
                onClick={handleTestChime}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 rounded-lg transition-all cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Play Chime
              </button>
            </div>
          </div>

          {/* Reset Stats / History */}
          <div className="border-t border-white/[0.06] pt-4">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset App Data
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center space-y-2.5">
                <p className="text-xs font-medium text-red-200">Wipe all tasks, stats, and session logs?</p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setShowConfirmReset(false);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 shrink-0">
            <button
              type="submit"
              className={`w-full font-bold text-xs uppercase tracking-[0.18em] py-3 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer ${accentBg}`}
            >
              Apply & Save Settings
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
