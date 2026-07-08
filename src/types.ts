export enum TimerMode {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoros: number;
}

export interface SessionHistory {
  id: string;
  mode: TimerMode;
  durationSeconds: number;
  timestamp: number;
}
