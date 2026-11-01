import React, { useState } from 'react';
import { SmartReminder } from '../types/study';
import { notificationService } from '../services/notificationService';
import { Bell, BellRing, Check, Plus, Trash2, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface RemindersViewProps {
  reminders: SmartReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<SmartReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermission());
  const [isAdding, setIsAdding] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // New reminder form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newDays, setNewDays] = useState('Segunda a Sexta');

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      notificationService.triggerNotification(
        'Notificações Ativadas!',
        'O StudyFlow agora enviará lembretes inteligentes nos momentos de maior retenção cognitiva.',
        'info'
      );
    }
  };

  const handleSendTestNotification = () => {
    notificationService.triggerNotification(
      '🎯 Hora do Foco StudyFlow!',
      'Você tem 1 objetivo agendado para hoje. Estude 25 minutos para proteger sua ofensiva diária!',
      'streak'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      body: newBody.trim() || 'Lembrete de estudo agendado.',
      time: newTime,
      active: true,
      type: 'custom',
      days: [newDays],
    });

    setNewTitle('');
    setNewBody('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Push Permission Banner */}
      <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <BellRing className="w-4 h-4" />
            <span>Notificações Push &amp; Neuroaprendizagem</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Lembretes Inteligentes de Estudo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Receba notificações personalizadas nos horários de pico atencional e alertas estratégicos para proteger sua curva de retenção de memória.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Habilitar Notificações no Navegador</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>Notificações Habilitadas</span>
            </div>
          )}

          <button
            onClick={handleSendTestNotification}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{testSent ? 'Disparada!' : 'Testar Notificação Agora'}</span>
          </button>
        </div>
      </div>

      {/* Permission helper note */}
      {permission !== 'granted' && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Clique em <strong>"Habilitar Notificações"</strong> acima para permitir que o navegador avise você sobre os blocos de estudo mesmo com o app minimizado.
          </span>
        </div>
      )}

      {/* List of Smart Reminders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Rotina de Lembretes Configurada
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lembrete</span>
          </button>
        </div>

        {/* Add Reminder Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleSaveReminder}
            className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-4"
          >
            <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
              Criar Novo Lembrete Push
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  placeholder="Ex: Revisão Noturna de Foco"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Horário</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Frequência</label>
                <input
                  type="text"
                  placeholder="Ex: Seg a Sex"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mensagem Motivacional</label>
              <input
                type="text"
                placeholder="Ex: 15 minutos de leitura ativa garantem fixação do conteúdo."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs"
              >
                Salvar Lembrete
              </button>
            </div>
          </form>
        )}

        {/* Reminders List */}
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-sm font-bold tabular-nums shrink-0">
                  {rem.time}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{rem.title}</span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{rem.days.join(', ')}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                    {rem.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Active switch */}
                <button
                  onClick={() => onToggleReminder(rem.id)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    rem.active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={rem.active ? 'Lembrete ativo' : 'Lembrete pausado'}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      rem.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                <button
                  onClick={() => onDeleteReminder(rem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Excluir lembrete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
