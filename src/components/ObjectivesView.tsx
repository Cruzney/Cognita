import React, { useState } from 'react';
import { StudyObjective, ObjectiveStatus } from '../types/study';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  Play,
  AlertCircle,
  X,
  Target,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

interface ObjectivesViewProps {
  objectives: StudyObjective[];
  onAddObjective: (obj: Omit<StudyObjective, 'id' | 'createdAt'>) => void;
  onUpdateObjective: (id: string, updated: Partial<StudyObjective>) => void;
  onDeleteObjective: (id: string) => void;
  onStartPomodoroForObjective: (title: string, category: string) => void;
}

export const ObjectivesView: React.FC<ObjectivesViewProps> = ({
  objectives,
  onAddObjective,
  onUpdateObjective,
  onDeleteObjective,
  onStartPomodoroForObjective,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');

  // Modal / form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<ObjectiveStatus>('nao_iniciado');
  const [formCategory, setFormCategory] = useState('Matemática');
  const [formPriority, setFormPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [formError, setFormError] = useState('');

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Open modal for new objective
  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    // Default deadline: 7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormDeadline(nextWeek.toISOString().split('T')[0]);
    setFormStatus('nao_iniciado');
    setFormCategory('Matemática');
    setFormPriority('media');
    setFormError('');
    setIsFormOpen(true);
  };

  // Open modal for editing existing objective
  const handleOpenEditModal = (obj: StudyObjective) => {
    setEditingId(obj.id);
    setFormTitle(obj.title);
    setFormDescription(obj.description);
    setFormDeadline(obj.deadline);
    setFormStatus(obj.status);
    setFormCategory(obj.category || 'Geral');
    setFormPriority(obj.priority || 'media');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Por favor, informe um título para o objetivo de estudo.');
      return;
    }
    if (!formDeadline) {
      setFormError('Por favor, selecione uma data limite (prazo).');
      return;
    }

    if (editingId) {
      onUpdateObjective(editingId, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        deadline: formDeadline,
        status: formStatus,
        category: formCategory,
        priority: formPriority,
        completedAt: formStatus === 'concluido' ? new Date().toISOString() : undefined,
      });
    } else {
      onAddObjective({
        title: formTitle.trim(),
        description: formDescription.trim(),
        deadline: formDeadline,
        status: formStatus,
        category: formCategory,
        priority: formPriority,
      });
    }

    setIsFormOpen(false);
  };

  // Calculate deadline urgency helper
  const getDeadlineBadge = (deadlineStr: string, status: ObjectiveStatus) => {
    if (status === 'concluido') {
      return { text: 'Concluído', colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr + 'T00:00:00');
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Atrasado há ${Math.abs(diffDays)}d`, colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
    } else if (diffDays === 0) {
      return { text: 'Vence hoje!', colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    } else if (diffDays === 1) {
      return { text: 'Vence amanhã', colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    } else {
      return { text: `Restam ${diffDays} dias`, colorClass: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
    }
  };

  // Filter and sort objectives
  const filteredObjectives = objectives
    .filter((obj) => {
      if (filterStatus !== 'todos' && obj.status !== filterStatus) return false;
      if (
        searchTerm &&
        !obj.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !obj.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !obj.category.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'priority') {
        const priorityWeight = { alta: 3, media: 2, baixa: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Summary counts
  const totalCount = objectives.length;
  const inProgressCount = objectives.filter((o) => o.status === 'em_andamento').length;
  const notStartedCount = objectives.filter((o) => o.status === 'nao_iniciado').length;
  const completedCount = objectives.filter((o) => o.status === 'concluido').length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Target className="w-4 h-4" />
            <span>StudyFlow · Organização de Metas de Aprendizado</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Meus Objetivos de Estudo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Cadastre matérias, defina prazos e acompanhe sua evolução de forma clara e visual. Seus dados são salvos automaticamente no navegador.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Objetivo</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total de Metas</span>
          <div className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {totalCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Não Iniciados</span>
          <div className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {notStartedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Em Andamento</span>
          <div className="font-display text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono tabular-nums">
            {inProgressCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Concluídos</span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">{completionPercent}%</span>
          </div>
          <div className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterStatus === 'todos'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('nao_iniciado')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterStatus === 'nao_iniciado'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Não Iniciado ({notStartedCount})
          </button>
          <button
            onClick={() => setFilterStatus('em_andamento')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterStatus === 'em_andamento'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Em Andamento ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterStatus('concluido')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterStatus === 'concluido'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Concluídos ({completedCount})
          </button>
        </div>

        {/* Search input & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'deadline' | 'priority' | 'created')}
              className="text-xs bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="deadline">Por Prazo</option>
              <option value="priority">Por Prioridade</option>
              <option value="created">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of Objectives */}
      <div className="space-y-3">
        {filteredObjectives.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Target className="w-10 h-10 mx-auto text-indigo-500/70 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhum objetivo encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || filterStatus !== 'todos'
                ? 'Nenhum item corresponde aos filtros selecionados. Tente limpar os critérios.'
                : 'Você ainda não cadastrou nenhum objetivo de estudo. Dê o primeiro passo agora!'}
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              + Cadastrar Meu Primeiro Objetivo
            </button>
          </div>
        ) : (
          filteredObjectives.map((obj) => {
            const urgency = getDeadlineBadge(obj.deadline, obj.status);
            const isCompleted = obj.status === 'concluido';

            return (
              <div
                key={obj.id}
                className={`group p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs'
                }`}
              >
                {/* Left section: Checkbox + details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => {
                      const nextStatus: ObjectiveStatus =
                        obj.status === 'concluido' ? 'nao_iniciado' : 'concluido';
                      onUpdateObjective(obj.id, {
                        status: nextStatus,
                        completedAt: nextStatus === 'concluido' ? new Date().toISOString() : undefined,
                      });
                    }}
                    title={isCompleted ? 'Desmarcar conclusão' : 'Marcar como concluído'}
                    className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-emerald-500 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {obj.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${urgency.colorClass}`}
                      >
                        {urgency.text}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <Calendar className="w-3 h-3" />
                        {new Date(obj.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      {obj.priority === 'alta' && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                            Alta Prioridade
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {obj.title}
                    </h3>

                    {obj.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                        {obj.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right action controls */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Status switcher button */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => onUpdateObjective(obj.id, { status: 'nao_iniciado' })}
                      className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                        obj.status === 'nao_iniciado'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Parado
                    </button>
                    <button
                      onClick={() => onUpdateObjective(obj.id, { status: 'em_andamento' })}
                      className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                        obj.status === 'em_andamento'
                          ? 'bg-amber-500 text-white font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Em Andamento
                    </button>
                    <button
                      onClick={() =>
                        onUpdateObjective(obj.id, {
                          status: 'concluido',
                          completedAt: new Date().toISOString(),
                        })
                      }
                      className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                        obj.status === 'concluido'
                          ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Concluído
                    </button>
                  </div>

                  {!isCompleted && (
                    <button
                      onClick={() => onStartPomodoroForObjective(obj.title, obj.category)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-all active:scale-95"
                      title="Estudar agora com o timer Pomodoro"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Focar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(obj)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Editar objetivo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(obj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Excluir objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cadastrar / Editar Objetivo */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {editingId ? 'Editar Objetivo de Estudo' : 'Cadastrar Novo Objetivo'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Objetivo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dominar Funções Trigonométricas"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição e Metas Específicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Assistir aulas 1 a 4, resolver 25 exercícios da lista e criar resumo no caderno..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Prazo e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prazo / Data Limite <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria / Matéria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Matemática">Matemática &amp; Raciocínio</option>
                    <option value="Português">Língua Portuguesa &amp; Redação</option>
                    <option value="Direito">Direito / Legislação</option>
                    <option value="Ciências">Ciências da Natureza</option>
                    <option value="História & Geografia">Humanidades &amp; História</option>
                    <option value="Idiomas">Idiomas (Inglês / Espanhol)</option>
                    <option value="Programação">Programação &amp; TI</option>
                    <option value="Geral">Outros</option>
                  </select>
                </div>
              </div>

              {/* Status e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Atual
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ObjectiveStatus)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="nao_iniciado">Não iniciado</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as 'baixa' | 'media' | 'alta')}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Objetivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Excluir Objetivo?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Essa ação é irreversível. O objetivo e seu histórico serão removidos do seu dispositivo.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteObjective(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
