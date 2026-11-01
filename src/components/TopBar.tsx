import React from 'react';
import { Sparkles, Flame, Moon, Sun, BellRing, Target, Clock, BarChart3, Trophy, BookOpen } from 'lucide-react';

interface TopBarProps {
  currentTab: 'schedule' | 'pomodoro' | 'gamification' | 'analytics' | 'reminders';
  setCurrentTab: (tab: 'schedule' | 'pomodoro' | 'gamification' | 'analytics' | 'reminders') => void;
  streak: number;
  level: number;
  xp: number;
  gems: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenAiPlanner: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  setCurrentTab,
  streak,
  level,
  xp,
  gems,
  darkMode,
  toggleDarkMode,
  onOpenAiPlanner,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Cognita
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setCurrentTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'schedule'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Cronograma
          </button>
          <button
            onClick={() => setCurrentTab('pomodoro')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'pomodoro'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Foco &amp; Pomodoro
          </button>
          <button
            onClick={() => setCurrentTab('gamification')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'gamification'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Quests &amp; Nível
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Estatísticas
          </button>
          <button
            onClick={() => setCurrentTab('reminders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentTab === 'reminders'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            Lembretes Push
          </button>
        </nav>

        {/* Zone 3: Gamification indicators & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak indicator */}
          <div
            title="Sua ofensiva diária de estudos"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold tabular-nums"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streak} d</span>
          </div>

          {/* Level / XP */}
          <div
            title="Nível do Estudante e XP"
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tabular-nums"
          >
            <span>Nv. {level}</span>
            <span className="text-indigo-300 dark:text-indigo-600">·</span>
            <span>{xp} XP</span>
          </div>

          {/* Dark mode switch */}
          <button
            onClick={toggleDarkMode}
            aria-label="Alternar tema escuro/claro"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAiPlanner}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-98 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Criar Cronograma com IA</span>
            <span className="sm:hidden">IA</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="lg:hidden flex items-center justify-around pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs overflow-x-auto gap-2">
        <button
          onClick={() => setCurrentTab('schedule')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'schedule' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          Cronograma
        </button>
        <button
          onClick={() => setCurrentTab('pomodoro')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'pomodoro' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setCurrentTab('gamification')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'gamification' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          Quests
        </button>
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          Estatísticas
        </button>
        <button
          onClick={() => setCurrentTab('reminders')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${currentTab === 'reminders' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          Lembretes
        </button>
      </div>
    </header>
  );
};
