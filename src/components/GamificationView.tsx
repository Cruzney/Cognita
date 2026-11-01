import React from 'react';
import { UserStats, Quest, Achievement } from '../types/study';
import { soundEffects } from '../services/soundEffects';
import { notificationService } from '../services/notificationService';
import { Flame, Trophy, Award, Sparkles, CheckCircle2, Shield, Gift, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GamificationViewProps {
  stats: UserStats;
  quests: Quest[];
  achievements: Achievement[];
  onClaimQuest: (questId: string) => void;
  onPurchaseReward: (title: string, costGems: number) => void;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  stats,
  quests,
  achievements,
  onClaimQuest,
  onPurchaseReward,
}) => {
  const xpPercent = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  const handleClaim = (quest: Quest) => {
    soundEffects.playXPChime();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });
    notificationService.triggerNotification(
      'Recompensa de Quest Resgatada!',
      `+${quest.xpReward} XP e +${quest.gemsReward} Gemas adicionadas ao seu perfil.`,
      'achievement'
    );
    onClaimQuest(quest.id);
  };

  const handleBuy = (title: string, cost: number) => {
    if (stats.gems < cost) {
      alert(`Gemas insuficientes! Você tem ${stats.gems} gemas e precisa de ${cost}. Estude mais blocos para ganhar gemas!`);
      return;
    }
    soundEffects.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
    });
    onPurchaseReward(title, cost);
  };

  return (
    <div className="space-y-8">
      {/* Level and XP Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Jornada de Aprendizado Gamificada</span>
              <span aria-hidden="true">·</span>
              <span>Multiplicador de Ofensiva Ativo (+15% XP)</span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                  Nível {stats.level}
                </span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {stats.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Faltam {stats.xpToNextLevel - stats.xp} XP para alcançar o Nível {stats.level + 1}: "Mestre da Disciplina".
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                <span>{stats.xp} XP</span>
                <span>{stats.xpToNextLevel} XP</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Side Badges & Gem Balance */}
          <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-around md:justify-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 font-extrabold text-2xl font-display tabular-nums">
                <Flame className="w-6 h-6 fill-amber-500" />
                <span>{stats.streak}</span>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Dias de Ofensiva</span>
            </div>

            <div className="h-8 w-px md:w-full md:h-px bg-slate-200 dark:bg-slate-700" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl font-display tabular-nums">
                <Sparkles className="w-5 h-5" />
                <span>{stats.gems}</span>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gemas de Foco</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Quests &amp; Missões de Hoje
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cumpra os objetivos para acelerar seu ganho de XP e desbloquear recompensas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => {
            const isCompleted = quest.progress >= quest.target;
            const progressRatio = Math.min(100, Math.round((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="capitalize">{quest.category === 'daily' ? 'Diária' : 'Semanal'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                        +{quest.xpReward} XP
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold tabular-nums">
                        +{quest.gemsReward} Gemas
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {quest.description}
                    </p>
                  </div>

                  {quest.completed ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resgatado</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-all active:scale-95 animate-pulse"
                    >
                      Resgatar!
                    </button>
                  ) : (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                      {quest.progress}/{quest.target}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progressRatio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges and Achievements */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Galeria de Conquistas &amp; Insígnias
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Marcos históricos gravados na sua trajetória de estudos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                ach.unlocked
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              {/* Badge Visual Asset or Icon */}
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                {ach.imageSrc ? (
                  <img
                    src={ach.imageSrc}
                    alt={ach.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${!ach.unlocked ? 'grayscale opacity-50' : ''}`}
                  />
                ) : (
                  <Award className={`w-7 h-7 ${ach.unlocked ? 'text-amber-500' : 'text-slate-400'}`} />
                )}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {ach.title}
                  </h3>
                  {ach.unlocked ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Desbloqueado
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Bloqueado</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {ach.description}
                </p>
                <div className="pt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {ach.requirement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Rewards Shop */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Loja de Recompensas de Foco
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Troque suas Gemas de Foco por itens cosméticos, sons exclusivos e vantagens de produtividade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Escudo de Ofensiva</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Congela sua ofensiva por 24 horas em dias de descanso sem perder sua sequência.
              </p>
            </div>
            <button
              onClick={() => handleBuy('Escudo de Ofensiva', 150)}
              className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>150 Gemas</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-500 mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Bônus 2x XP por 24h</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Dobre todo o XP recebido nas próximas 24 horas de estudos e quizzes.
              </p>
            </div>
            <button
              onClick={() => handleBuy('Bônus 2x XP por 24h', 80)}
              className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>80 Gemas</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-500 mb-2">
                <Star className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Título: Polímata</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Desbloqueie o título honorário de "Polímata Lendário" no seu perfil de estudante.
              </p>
            </div>
            <button
              onClick={() => handleBuy('Título: Polímata', 100)}
              className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>100 Gemas</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500 mb-2">
                <Gift className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Pacote Som Chuva Alfa</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Frequência binaural personalizada para indução de foco profundo e relaxamento.
              </p>
            </div>
            <button
              onClick={() => handleBuy('Pacote Som Chuva Alfa', 50)}
              className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>50 Gemas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
