import React, { useState, useEffect } from 'react';
import { UserStats } from '../types/study';
import { Clock, CheckCircle2, TrendingUp, Sparkles, BookOpen, Brain, RefreshCw } from 'lucide-react';

interface AnalyticsViewProps {
  stats: UserStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const [advice, setAdvice] = useState<{ coachTip: string; suggestedChallenge: string } | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/study-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: stats.streak,
          totalMinutes: stats.totalMinutesStudied,
          level: stats.level,
          weakestSubject: 'Ciências da Natureza',
        }),
      });
      const data = await res.json();
      setAdvice(data);
    } catch (e) {
      console.warn('Failed to fetch advice:', e);
      setAdvice({
        coachTip: 'Estudos com recuperação ativa e testes constantes consolidam 70% mais conteúdo que resumos passivos.',
        suggestedChallenge: 'Resolva uma bateria de 10 exercícios antes do final da tarde.',
      });
    } finally {
      setLoadingAdvice(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [stats.streak, stats.totalMinutesStudied]);

  const totalHours = (stats.totalMinutesStudied / 60).toFixed(1);
  const weeklyTargetHours = (stats.weeklyTargetMinutes / 60).toFixed(0);
  const weeklyPacingPercent = Math.min(100, Math.round((stats.totalMinutesStudied / stats.weeklyTargetMinutes) * 100));

  // Find max daily minutes for bar chart scaling
  const maxDailyMinutes = Math.max(...stats.dailyHistory.map((d) => d.minutes), 120);

  // Subject distribution calculations
  const totalSubjectMinutes = Object.values(stats.subjectBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 4-Zone KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tempo Total Estudado</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {totalHours}h
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 block">
              {stats.totalMinutesStudied} minutos registrados
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Sessões Concluídas</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.completedSessionsCount}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 block">
              Blocos de foco e pomodoros
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Taxa de Retenção</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.accuracyRate}%
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 block">
              Média em Quizzes de Fixação
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ritmo da Meta Semanal</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {weeklyPacingPercent}%
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 block">
              Meta: {weeklyTargetHours} horas / semana
            </span>
          </div>
        </div>
      </div>

      {/* AI Coach Strategic Insights */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Análise Cognitiva &amp; Diagnóstico IA</span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {advice ? advice.coachTip : 'Carregando recomendações personalizadas...'}
            </p>
            {advice?.suggestedChallenge && (
              <div className="text-xs text-indigo-950 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/60 inline-flex items-center gap-2">
                <span className="font-bold">Desafio Estratégico:</span>
                <span>{advice.suggestedChallenge}</span>
              </div>
            )}
          </div>

          <button
            onClick={fetchAdvice}
            disabled={loadingAdvice}
            className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
            title="Atualizar diagnóstico"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAdvice ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Daily Study Minutes Chart (14 days) */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Histórico Diário de Estudos (Últimos 14 dias)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Minutos dedicados por dia e evolução do ritmo de estudos.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-600" />
              <span>Minutos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span>Bônus XP</span>
            </div>
          </div>
        </div>

        {/* Bar chart canvas container */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-2">
            {stats.dailyHistory.map((item, idx) => {
              const heightRatio = Math.max(10, Math.round((item.minutes / maxDailyMinutes) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10 tabular-nums">
                    {item.minutes} min · +{item.xp} XP
                  </div>

                  {/* Visual Bar */}
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-indigo-700 to-indigo-500 hover:from-indigo-600 hover:to-indigo-400 transition-all duration-300"
                    style={{ height: `${heightRatio}%` }}
                  />
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    {item.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column: Subject Distribution + Consistency Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Distribuição do Tempo por Matéria
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Equilíbrio da carga horária para evitar pontos cegos.
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(stats.subjectBreakdown).map(([subj, minutes]) => {
              const percent = Math.round((minutes / totalSubjectMinutes) * 100);
              const hours = (minutes / 60).toFixed(1);

              return (
                <div key={subj} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{subj}</span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {hours}h ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 60-Day Consistency Heatmap */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Mapa de Consistência (Últimos 60 dias)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cada bloco representa a intensidade de estudo no dia.
            </p>
          </div>

          <div className="pt-2">
            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5">
              {Array.from({ length: 60 }).map((_, i) => {
                // Simulate recent realistic activity: most recent 20 days have high activity
                const daysAgo = 59 - i;
                let intensityClass = 'bg-slate-100 dark:bg-slate-800';
                if (daysAgo < 5) intensityClass = 'bg-emerald-500';
                else if (daysAgo < 15 && i % 2 === 0) intensityClass = 'bg-emerald-400';
                else if (daysAgo < 30 && i % 3 === 0) intensityClass = 'bg-emerald-300 dark:bg-emerald-600';
                else if (daysAgo < 45 && i % 4 === 0) intensityClass = 'bg-emerald-200 dark:bg-emerald-700';

                return (
                  <div
                    key={i}
                    title={`Dia -${daysAgo}`}
                    className={`w-full aspect-square rounded-sm ${intensityClass} transition-colors hover:ring-1 hover:ring-emerald-400`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>Menos focado</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-700" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              </div>
              <span>Mais focado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
