export interface StudyBlock {
  id: string;
  time: string;
  subject: string;
  topic: string;
  method: string;
  xp: number;
  completed: boolean;
  durationMinutes: number;
  day: string;
}

export interface DaySchedule {
  day: string;
  focus: string;
  blocks: StudyBlock[];
}

export interface UserStats {
  level: number;
  title: string;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  gems: number;
  totalMinutesStudied: number;
  completedSessionsCount: number;
  weeklyTargetMinutes: number;
  accuracyRate: number;
  subjectBreakdown: { [subject: string]: number }; // minutes
  dailyHistory: { date: string; dayLabel: string; minutes: number; xp: number }[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  gemsReward: number;
  progress: number;
  target: number;
  completed: boolean;
  category: 'daily' | 'weekly' | 'milestone';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageSrc?: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

export interface SmartReminder {
  id: string;
  time: string;
  title: string;
  body: string;
  active: boolean;
  type: 'peak_focus' | 'spaced_repetition' | 'streak_save' | 'custom';
  days: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FlashcardQuiz {
  quizTitle: string;
  xpReward: number;
  questions: QuizQuestion[];
}

export type ObjectiveStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';

export interface StudyObjective {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: ObjectiveStatus;
  category: string;
  priority: 'baixa' | 'media' | 'alta';
  createdAt: string;
  completedAt?: string;
}

