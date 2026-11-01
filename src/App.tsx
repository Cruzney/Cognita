import React, { useState, useEffect } from 'react';
import {
  DaySchedule,
  StudyBlock,
  UserStats,
  Quest,
  Achievement,
  SmartReminder,
  StudyObjective,
} from './types/study';
import {
  initialSchedule,
  initialUserStats,
  initialQuests,
  initialAchievements,
  initialReminders,
} from './data/initialData';
import { TopBar } from './components/TopBar';
import { ObjectivesView } from './components/ObjectivesView';
import { ScheduleView } from './components/ScheduleView';
import { PomodoroView } from './components/PomodoroView';
import { GamificationView } from './components/GamificationView';
import { AnalyticsView } from './components/AnalyticsView';
import { RemindersView } from './components/RemindersView';
import { AiPlannerModal } from './components/AiPlannerModal';
import { QuizModal } from './components/QuizModal';
import { notificationService, InAppNotification } from './services/notificationService';
import { soundEffects } from './services/soundEffects';
import { Target, Bell, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  OBJECTIVES: 'studyflow_objectives_v1',
  STATS: 'studyflow_user_stats_v1',
  SCHEDULE: 'studyflow_schedule_v1',
  QUESTS: 'studyflow_quests_v1',
  REMINDERS: 'studyflow_reminders_v1',
  THEME: 'studyflow_dark_mode_v1',
};

// Seed initial objectives if first time
const SEED_OBJECTIVES: StudyObjective[] = [
  {
    id: 'obj-1',
    title: 'Dominar Funções do 1º e 2º Grau e Gráficos',
    description: 'Compreender raízes, vértice da parábola, estudo do sinal e resolver 25 exercícios de provas anteriores.',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'em_andamento',
    category: 'Matemática',
    priority: 'alta',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-2',
    title: 'Interpretação Textual e Regras de Crase',
    description: 'Revisar os 10 casos proibitivos de crase e fazer resumo ativo com mapa mental no caderno.',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'nao_iniciado',
    category: 'Português',
    priority: 'media',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'obj-3',
    title: 'Direitos e Garantias Fundamentais (Art. 5º CF/88)',
    description: 'Leitura comentada dos incisos principais e resolução de 30 questões comentadas.',
    deadline: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'concluido',
    category: 'Direito',
    priority: 'alta',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: new Date().toISOString(),
  },
];

type AppTab = 'objectives' | 'schedule' | 'pomodoro' | 'gamification' | 'analytics' | 'reminders';

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<AppTab>('objectives');

  // StudyFlow Objectives with LocalStorage persistence
  const [objectives, setObjectives] = useState<StudyObjective[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return SEED_OBJECTIVES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
  }, [objectives]);

  // User Stats with LocalStorage persistence
  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialUserStats;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(userStats));
  }, [userStats]);

  // Schedule with LocalStorage persistence
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialSchedule;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  // Quests & Reminders
  const [quests, setQuests] = useState<Quest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialQuests;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }, [quests]);

  const [reminders, setReminders] = useState<SmartReminder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialReminders;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);

  // Active block for Pomodoro
  const [pomodoroBlock, setPomodoroBlock] = useState<StudyBlock | null>(null);

  // Modals state
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [quizSubject, setQuizSubject] = useState<{ subject: string; topic: string } | null>(null);

  // In-app floating toast notifications
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notif) => {
      setActiveToast(notif);
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  // Objectives Handlers (StudyFlow CRUD)
  const handleAddObjective = (newObj: Omit<StudyObjective, 'id' | 'createdAt'>) => {
    const created: StudyObjective = {
      ...newObj,
      id: 'obj-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setObjectives((prev) => [created, ...prev]);

    // Give small XP reward for planning
    awardXP(50, 5);
    notificationService.triggerNotification(
      'Objetivo Cadastrado!',
      `Meta "${created.title}" foi salva com sucesso. Você ganhou +50 XP de planejamento!`,
      'info'
    );
  };

  const handleUpdateObjective = (id: string, updated: Partial<StudyObjective>) => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          const merged = { ...obj, ...updated };
          // If just marked as completed, celebrate!
          if (updated.status === 'concluido' && obj.status !== 'concluido') {
            soundEffects.playLevelUp();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
            awardXP(150, 20);
            notificationService.triggerNotification(
              '🎯 Meta Concluída!',
              `Parabéns por concluir "${obj.title}"! +150 XP e +20 Gemas resgatadas.`,
              'achievement'
            );
          }
          return merged;
        }
        return obj;
      })
    );
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((obj) => obj.id !== id));
    notificationService.triggerNotification(
      'Objetivo Removido',
      'O item foi excluído do seu painel de estudos.',
      'info'
    );
  };

  const handleStartPomodoroForObjective = (title: string, category: string) => {
    setPomodoroBlock({
      id: 'custom-' + Date.now(),
      time: '25 min',
      subject: category,
      topic: title,
      method: 'Pomodoro Foco',
      xp: 120,
      completed: false,
      durationMinutes: 25,
      day: 'Hoje',
    });
    setCurrentTab('pomodoro');
  };

  // Gamification & XP Awarding helper
  const awardXP = (xpAmount: number, gemsAmount = 0) => {
    soundEffects.playXPChime();
    setUserStats((prev) => {
      let newXp = prev.xp + xpAmount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;

      if (newXp >= newXpToNext) {
        newLevel += 1;
        newXp = newXp - newXpToNext;
        newXpToNext = Math.round(newXpToNext * 1.3);
        soundEffects.playLevelUp();
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
        });
        notificationService.triggerNotification(
          '🎉 SUBIU DE NÍVEL!',
          `Você agora é Nível ${newLevel}: Mestre do Conhecimento!`,
          'achievement'
        );
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        gems: prev.gems + gemsAmount,
      };
    });
  };

  // Schedule Block Toggling
  const handleToggleCompleteBlock = (dayName: string, blockId: string) => {
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.day !== dayName) return day;
        return {
          ...day,
          blocks: day.blocks.map((b) => {
            if (b.id === blockId) {
              const nextStatus = !b.completed;
              if (nextStatus) {
                awardXP(b.xp, 10);
              }
              return { ...b, completed: nextStatus };
            }
            return b;
          }),
        };
      })
    );
  };

  const handleAddCustomBlock = (dayName: string, newBlock: Omit<StudyBlock, 'id' | 'completed'>) => {
    const fullBlock: StudyBlock = {
      ...newBlock,
      id: 'block-' + Date.now(),
      completed: false,
    };
    setSchedule((prev) =>
      prev.map((day) => (day.day === dayName ? { ...day, blocks: [...day.blocks, fullBlock] } : day))
    );
    awardXP(40, 5);
  };

  const handleDeleteBlock = (dayName: string, blockId: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.day === dayName
          ? { ...day, blocks: day.blocks.filter((b) => b.id !== blockId) }
          : day
      )
    );
  };

  // Pomodoro Completion
  const handleFinishPomodoroSession = (minutes: number, xpEarned: number, subject: string) => {
    awardXP(xpEarned, 15);
    setUserStats((prev) => ({
      ...prev,
      totalMinutesStudied: prev.totalMinutesStudied + minutes,
      completedSessionsCount: prev.completedSessionsCount + 1,
      subjectBreakdown: {
        ...prev.subjectBreakdown,
        [subject]: (prev.subjectBreakdown[subject] || 0) + minutes,
      },
    }));
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          awardXP(q.xpReward, q.gemsReward);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  // Purchase Shop Reward
  const handlePurchaseReward = (title: string, costGems: number) => {
    setUserStats((prev) => ({
      ...prev,
      gems: prev.gems - costGems,
    }));
    notificationService.triggerNotification(
      'Compra Realizada!',
      `Você adquiriu "${title}" com sucesso!`,
      'achievement'
    );
  };

  // Reminder Toggles
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleAddReminder = (newRem: Omit<SmartReminder, 'id'>) => {
    setReminders((prev) => [{ ...newRem, id: 'rem-' + Date.now() }, ...prev]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        currentTab={currentTab as any}
        setCurrentTab={setCurrentTab as any}
        streak={userStats.streak}
        level={userStats.level}
        xp={userStats.xp}
        gems={userStats.gems}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCurrentTab('objectives')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'objectives'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Objetivos StudyFlow</span>
          </button>

          <button
            onClick={() => setCurrentTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Cronograma Semanal</span>
          </button>

          <button
            onClick={() => setCurrentTab('pomodoro')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Timer Pomodoro</span>
          </button>

          <button
            onClick={() => setCurrentTab('gamification')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'gamification'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Quests &amp; Conquistas</span>
          </button>

          <button
            onClick={() => setCurrentTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Estatísticas de Progresso</span>
          </button>

          <button
            onClick={() => setCurrentTab('reminders')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'reminders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Lembretes Push</span>
          </button>
        </div>

        {/* Dynamic View Rendering */}
        {currentTab === 'objectives' && (
          <ObjectivesView
            objectives={objectives}
            onAddObjective={handleAddObjective}
            onUpdateObjective={handleUpdateObjective}
            onDeleteObjective={handleDeleteObjective}
            onStartPomodoroForObjective={handleStartPomodoroForObjective}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            onToggleCompleteBlock={handleToggleCompleteBlock}
            onStartPomodoroForBlock={(block) => {
              setPomodoroBlock(block);
              setCurrentTab('pomodoro');
            }}
            onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
            onAddCustomBlock={handleAddCustomBlock}
            onDeleteBlock={handleDeleteBlock}
            streak={userStats.streak}
          />
        )}

        {currentTab === 'pomodoro' && (
          <PomodoroView
            activeBlock={pomodoroBlock}
            onFinishSession={handleFinishPomodoroSession}
            onRequestQuiz={(subj, topic) => {
              setQuizSubject({ subject: subj, topic });
            }}
          />
        )}

        {currentTab === 'gamification' && (
          <GamificationView
            stats={userStats}
            quests={quests}
            achievements={achievements}
            onClaimQuest={handleClaimQuest}
            onPurchaseReward={handlePurchaseReward}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView stats={userStats} />}

        {currentTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        )}
      </main>

      {/* Floating In-App Push Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-2xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeToast.title}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeToast.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {activeToast.body}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Schedule Planner Modal */}
      <AiPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onApplySchedule={(newSched) => {
          setSchedule(newSched);
          setCurrentTab('schedule');
          notificationService.triggerNotification(
            'Novo Cronograma Aplicado!',
            'Seu planejamento semanal foi gerado e adaptado à sua meta.',
            'info'
          );
        }}
      />

      {/* Quiz Modal */}
      {quizSubject && (
        <QuizModal
          isOpen={Boolean(quizSubject)}
          onClose={() => setQuizSubject(null)}
          subject={quizSubject.subject}
          topic={quizSubject.topic}
          onQuizCompleted={(score, total, earnedXp) => {
            awardXP(earnedXp, 10);
            notificationService.triggerNotification(
              'Quiz Concluído!',
              `Você marcou ${score}/${total} no teste de fixação e ganhou +${earnedXp} XP!`,
              'achievement'
            );
          }}
        />
      )}
    </div>
  );
}
