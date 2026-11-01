import React, { useState } from 'react';
import { DaySchedule, StudyBlock } from '../types/study';
import { CheckCircle2, Circle, Clock, Play, Plus, Sparkles, BookOpen, Trash2, Calendar, Target, Flame } from 'lucide-react';

interface ScheduleViewProps {
  schedule: DaySchedule[];
  onToggleCompleteBlock: (dayName: string, blockId: string) => void;
  onStartPomodoroForBlock: (block: StudyBlock) => void;
  onOpenAiPlanner: () => void;
  onAddCustomBlock: (dayName: string, newBlock: Omit<StudyBlock, 'id' | 'completed'>) => void;
  onDeleteBlock: (dayName: string, blockId: string) => void;
  streak: number;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  onToggleCompleteBlock,
  onStartPomodoroForBlock,
  onOpenAiPlanner,
  onAddCustomBlock,
  onDeleteBlock,
  streak,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Segunda');
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Form state for adding custom block
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('14:00 - 15:00');
  const [newMethod, setNewMethod] = useState('Pomodoro (25/5 min)');
  const [newXp, setNewXp] = useState(120);

  const currentDayData = schedule.find((s) => s.day === selectedDay) || schedule[0];
  const completedBlocksCount = currentDayData?.blocks.filter((b) => b.completed).length || 0;
  const totalBlocksCount = currentDayData?.blocks.length || 0;
  const progressPercent = totalBlocksCount > 0 ? Math.round((completedBlocksCount / totalBlocksCount) * 100) : 0;

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;

    onAddCustomBlock(selectedDay, {
      day: selectedDay,
      time: newTime,
      subject: newSubject,
      topic: newTopic,
      method: newMethod,
      xp: Number(newXp) || 100,
      durationMinutes: 50,
    });

    setNewSubject('');
    setNewTopic('');
    setIsAddingBlock(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Generated Visual Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Cronograma Inteligente Otimizado</span>
                <span aria-hidden="true">·</span>
                <span>Metodologia Active Recall &amp; Pomodoro</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Domine suas metas com estudos guiados e gamificação diária
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Seu cronograma se adapta ao seu ritmo. Complete blocos, ganhe XP, mantenha sua ofensiva de {streak} dias e revise nos momentos de máxima retenção sináptica.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAiPlanner}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Regerar Cronograma com IA
              </button>
              <button
                onClick={() => setIsAddingBlock(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Matéria
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-[260px] bg-slate-900">
            <img
              src="/src/assets/images/hero_student_focus_1793536022728.jpg"
              alt="Ambiente de estudos focado com anotações e tecnologia"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-slate-900/60 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{streak} dias de sequência</span>
              </div>
              <span className="text-slate-300 tabular-nums">Ofensiva ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday segmented filter control */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {schedule.map((item) => {
          const isSelected = item.day === selectedDay;
          const dayCompleted = item.blocks.filter((b) => b.completed).length;
          const dayTotal = item.blocks.length;

          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-xl border transition-all shrink-0 min-w-[120px] ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold font-display">{item.day}</span>
                <span className={`text-[10px] tabular-nums ${isSelected ? 'text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>
                  {dayCompleted}/{dayTotal}
                </span>
              </div>
              <span className={`text-[11px] truncate max-w-[110px] ${isSelected ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-400'}`}>
                {item.focus.split(' ')[0]}...
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Header & Progress Bar */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Planejamento de {selectedDay}</span>
            <span aria-hidden="true">·</span>
            <span>Foco: {currentDayData.focus}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Blocos de Estudo do Dia
          </h2>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Progresso</span>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setIsAddingBlock(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Adicionar bloco a este dia"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Custom Block Modal/Inline Form */}
      {isAddingBlock && (
        <form
          onSubmit={handleCreateBlock}
          className="p-5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
              Novo Bloco de Estudo para {selectedDay}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingBlock(false)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Matéria</label>
              <input
                type="text"
                placeholder="Ex: Direito Constitucional"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tópico Específico</label>
              <input
                type="text"
                placeholder="Ex: Teoria dos Direitos Fundamentais"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
              <input
                type="text"
                placeholder="Ex: 09:00 - 10:00"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Método</label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pomodoro (25/5 min)">Pomodoro (25/5 min)</option>
                <option value="Pomodoro Longo (50/10 min)">Pomodoro Longo (50/10 min)</option>
                <option value="Active Recall">Active Recall</option>
                <option value="Técnica de Feynman">Técnica de Feynman</option>
                <option value="Resolução de Questões">Resolução de Questões</option>
                <option value="Repetição Espaçada">Repetição Espaçada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              Salvar Bloco de Estudo
            </button>
          </div>
        </form>
      )}

      {/* List of Study Blocks */}
      <div className="space-y-3">
        {currentDayData.blocks.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum bloco agendado para este dia</p>
            <p className="text-xs text-slate-500 mt-1">Gere um cronograma com IA ou adicione matérias manualmente.</p>
            <button
              onClick={() => setIsAddingBlock(true)}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100"
            >
              + Adicionar Bloco
            </button>
          </div>
        ) : (
          currentDayData.blocks.map((block) => (
            <div
              key={block.id}
              className={`group p-4 sm:p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                block.completed
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Complete checkbox button */}
                <button
                  onClick={() => onToggleCompleteBlock(selectedDay, block.id)}
                  aria-label={block.completed ? 'Marcar como não concluído' : 'Marcar como concluído'}
                  className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {block.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{block.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {block.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 dark:text-slate-400">{block.method}</span>
                  </div>

                  <h3
                    className={`text-sm font-semibold ${
                      block.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {block.topic}
                  </h3>
                </div>
              </div>

              {/* Action and XP */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  +{block.xp} XP
                </div>

                {!block.completed && (
                  <button
                    onClick={() => onStartPomodoroForBlock(block)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg shadow-xs transition-all active:scale-95"
                    title="Iniciar cronômetro de foco para esta matéria"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focar</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteBlock(selectedDay, block.id)}
                  aria-label="Excluir bloco"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
