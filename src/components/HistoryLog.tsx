import React, { useState } from 'react';
import { SessionHistory, TimerMode } from '../types';
import { Clock, Calendar, ChevronDown, ChevronUp, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogProps {
  history: SessionHistory[];
  themeColor: string;
}

export default function HistoryLog({ history, themeColor }: HistoryLogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute total focus stats
  const workSessions = history.filter((h) => h.mode === TimerMode.WORK);
  const totalWorkSeconds = workSessions.reduce((acc, h) => acc + h.durationSeconds, 0);
  const totalFocusMinutes = Math.round(totalWorkSeconds / 60);

  const shortBreakSessions = history.filter((h) => h.mode === TimerMode.SHORT_BREAK);
  const longBreakSessions = history.filter((h) => h.mode === TimerMode.LONG_BREAK);

  const getModeLabel = (mode: TimerMode) => {
    switch (mode) {
      case TimerMode.WORK:
        return 'Work Session';
      case TimerMode.SHORT_BREAK:
        return 'Short Break';
      case TimerMode.LONG_BREAK:
        return 'Long Break';
    }
  };

  const getModeStyle = (mode: TimerMode) => {
    switch (mode) {
      case TimerMode.WORK:
        return 'bg-red-500/10 text-red-300 border-red-500/25';
      case TimerMode.SHORT_BREAK:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case TimerMode.LONG_BREAK:
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] rounded-2xl overflow-hidden transition-all duration-300">
      {/* Collapsible Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-white/50 hover:text-white font-bold text-[10px] uppercase tracking-[0.18em] select-none bg-white/[0.01] hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <span>Activity Log & Stats ({history.length})</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-white/[0.05] space-y-4 bg-black/10">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-1.5">
                    <Zap className="w-4 h-4 fill-amber-400/15" />
                    <span className="text-[9px] font-bold text-white/35 uppercase tracking-[0.15em]">Focus Time</span>
                  </div>
                  <p className="font-display font-bold text-xl text-white">
                    {totalFocusMinutes} <span className="text-xs font-semibold text-white/40">mins</span>
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400 mb-1.5">
                    <Sparkles className="w-4 h-4 fill-red-400/15" />
                    <span className="text-[9px] font-bold text-white/35 uppercase tracking-[0.15em]">Completed</span>
                  </div>
                  <p className="font-display font-bold text-xl text-white">
                    {workSessions.length} <span className="text-xs font-semibold text-white/40">cycles</span>
                  </p>
                </div>
              </div>

              {/* Tomato dots representation */}
              {workSessions.length > 0 && (
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[9px] font-bold text-white/35 uppercase tracking-[0.15em] mr-1">Cycles:</span>
                  {workSessions.map((_, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-700 shadow-lg inline-block"
                      title="Completed Pomodoro"
                    />
                  ))}
                </div>
              )}

              {/* History List */}
              <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {history.length === 0 ? (
                  <p className="text-center text-xs text-white/25 py-3 italic">
                    No completed sessions logged today.
                  </p>
                ) : (
                  [...history].reverse().map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2.5 bg-white/[0.01] border border-white/5 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getModeStyle(item.mode)}`}>
                          {getModeLabel(item.mode)}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-white/60">
                          {Math.round(item.durationSeconds / 60)} min
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-white/30 font-medium">
                        <span>{formatDate(item.timestamp)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
