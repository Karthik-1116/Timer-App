import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Check, Trash, Circle, Flame, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectActiveTask: (id: string | null) => void;
  themeColor: string; // Tailwind accent color (e.g., 'rose', 'emerald', 'sky')
}

export default function TaskList({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSelectActiveTask,
  themeColor,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Determine dynamic border/text styles based on active theme
  const accentText = 
    themeColor === 'rose' ? 'text-red-400' : 
    themeColor === 'emerald' ? 'text-emerald-400' : 'text-sky-400';
  
  const accentBg = 
    themeColor === 'rose' ? 'bg-red-500' : 
    themeColor === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500';

  const accentBorder = 
    themeColor === 'rose' ? 'border-white/10 focus:border-red-500/40 focus:ring-red-500/10' : 
    themeColor === 'emerald' ? 'border-white/10 focus:border-emerald-500/40 focus:ring-emerald-500/10' : 
    'border-white/10 focus:border-sky-500/40 focus:ring-sky-500/10';

  return (
    <div className="space-y-4">
      {/* Active Focus Alert */}
      {activeTask && !activeTask.completed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border bg-white/[0.02] ${
            themeColor === 'rose' ? 'border-red-500/20 text-red-300' :
            themeColor === 'emerald' ? 'border-emerald-500/20 text-emerald-300' :
            'border-sky-500/20 text-sky-300'
          }`}
        >
          <Target className="w-5 h-5 shrink-0 animate-pulse text-current" />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.2em] font-semibold opacity-40 leading-none">
              Current Focus Target
            </p>
            <p className="font-medium text-sm truncate mt-1.5 text-white/90">
              {activeTask.title}
            </p>
          </div>
          <button
            onClick={() => onSelectActiveTask(null)}
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </motion.div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id="task-input"
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What are you working on next?"
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm border bg-white/[0.02] hover:bg-white/[0.04] text-white placeholder-white/20 shadow-inner transition-all focus:bg-white/[0.05] focus:outline-none focus:ring-3 ${accentBorder}`}
        />
        <button
          type="submit"
          className={`p-2.5 text-black bg-white hover:bg-slate-100 rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-95 shrink-0 cursor-pointer`}
          title="Add task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Task List Container */}
      <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-white/25 text-xs italic">
              No tasks added yet. Create one above to log your cycles!
            </div>
          ) : (
            tasks.map((task) => {
              const isActive = task.id === activeTaskId;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-white/[0.06] border-white/15 shadow-md'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        task.completed
                          ? `bg-white border-transparent text-black`
                          : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* Title */}
                    <div 
                      onClick={() => !task.completed && onSelectActiveTask(isActive ? null : task.id)}
                      className={`text-sm font-medium truncate cursor-pointer flex-1 py-0.5 select-none ${
                        task.completed 
                          ? 'line-through text-white/30' 
                          : 'text-white/80 hover:text-white'
                      }`}
                      title={task.completed ? "Task completed" : "Click to focus on this task"}
                    >
                      {task.title}
                    </div>
                  </div>

                  {/* Actions & Pomodoro Count */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Pomodoro count display */}
                    {task.pomodoros > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                        {task.pomodoros}
                      </span>
                    )}

                    {/* Focus toggle button */}
                    {!task.completed && (
                      <button
                        onClick={() => onSelectActiveTask(isActive ? null : task.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? `${accentBg} text-white`
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                        title={isActive ? "Stop focusing" : "Focus on this task"}
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-white/20 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
