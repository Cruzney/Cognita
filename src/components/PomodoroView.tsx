import React, { useState, useEffect, useRef } from 'react';
import { StudyBlock } from '../types/study';
import { soundEffects } from '../services/soundEffects';
import { notificationService } from '../services/notificationService';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles, BookOpen, Coffee, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PomodoroViewProps {
  activeBlock: StudyBlock | null;
  onFinishSession: (minutes: number, xpEarned: number, subject: string) => void;
  onRequestQuiz: (subject: string, topic: string) => void;
}

type TimerMode = 'pomodoro25' | 'pomodoro50' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  pomodoro25: 25 * 60,
  pomodoro50: 50 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  activeBlock,
  onFinishSession,
  onRequestQuiz,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro25');
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATIONS.pomodoro25);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customSubject, setCustomSubject] = useState<string>(activeBlock?.subject || 'Foco Geral');
  const [customTopic, setCustomTopic] = useState<string>(activeBlock?.topic || 'Sessão de Aprendizado Ativo');

  // Ambient focus sound state
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'brown' | 'binaural'>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when activeBlock changes from outside
  useEffect(() => {
    if (activeBlock) {
      setCustomSubject(activeBlock.subject);
      setCustomTopic(activeBlock.topic);
    }
  }, [activeBlock]);

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, customSubject]);

  // Handle ambient sound changes
  const handleToggleAmbient = (type: 'rain' | 'brown' | 'binaural') => {
    if (ambientSound === type) {
      soundEffects.stopAmbient();
      setAmbientSound('off');
    } else {
      soundEffects.startAmbient(type, ambientVolume);
      setAmbientSound(type);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVolume(val);
    soundEffects.setAmbientVolume(val);
  };

  // Switch modes
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  // Complete session logic
  const handleCompleteSession = () => {
    setIsRunning(false);
    soundEffects.playTimerBell();
    soundEffects.stopAmbient();
    setAmbientSound('off');

    const isFocus = mode === 'pomodoro25' || mode === 'pomodoro50';
    const minutes = Math.round(TIMER_DURATIONS[mode] / 60);
    const xpReward = isFocus ? (mode === 'pomodoro50' ? 220 : 120) : 30;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    if (isFocus) {
      notificationService.triggerNotification(
        'Sessão de Foco Concluída!',
        `Parabéns! Você concluiu ${minutes} min de ${customSubject} e ganhou +${xpReward} XP. Hora de descansar!`,
        'pomodoro'
      );
      onFinishSession(minutes, xpReward, customSubject);
    } else {
      notificationService.triggerNotification(
        'Pausa Finalizada!',
        'Sua mente descansou. Pronto para o próximo ciclo de alto rendimento?',
        'info'
      );
    }
  };

  // Format time MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular progress math
  const totalDuration = TIMER_DURATIONS[mode];
  const progressRatio = (totalDuration - timeLeft) / totalDuration;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Active task banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>Sessão em Andamento</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{customSubject}</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {customTopic}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRequestQuiz(customSubject, customTopic)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gerar Quiz Desta Matéria</span>
          </button>
        </div>
      </div>

      {/* Main Timer Stage */}
      <div className="p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-center">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
          <button
            onClick={() => handleSwitchMode('pomodoro25')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'pomodoro25'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pomodoro 25 min
          </button>
          <button
            onClick={() => handleSwitchMode('pomodoro50')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'pomodoro50'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Foco Longo 50 min
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pausa Curta 5 min
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pausa Longa 15 min
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative w-72 h-72 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 280 280">
            {/* Background track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className={mode.startsWith('pomodoro') ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-5xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formattedTime}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
              {isRunning
                ? mode.startsWith('pomodoro')
                  ? 'Foco Ininterrupto'
                  : 'Descanso Ativo'
                : 'Pausado'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reiniciar tempo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Foco</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteSession}
            className="p-3 rounded-full text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Concluir e resgatar recompensas"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Bar (Built-in Web Audio Generator) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full max-w-md flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Sons de Foco Ambiente (Web Audio):</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAmbient('rain')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                ambientSound === 'rain'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Chuva Focada
            </button>
            <button
              onClick={() => handleToggleAmbient('brown')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                ambientSound === 'brown'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Ruído Marrom
            </button>
            <button
              onClick={() => handleToggleAmbient('binaural')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                ambientSound === 'binaural'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Ondas 40Hz
            </button>
            {ambientSound !== 'off' && (
              <button
                onClick={() => {
                  soundEffects.stopAmbient();
                  setAmbientSound('off');
                }}
                className="p-1 text-rose-500 hover:text-rose-600 text-xs"
                title="Desligar som"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>

          {ambientSound !== 'off' && (
            <div className="flex items-center gap-3 w-48 mt-1">
              <span className="text-[10px] text-slate-400">Vol</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={ambientVolume}
                onChange={handleVolumeChange}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
