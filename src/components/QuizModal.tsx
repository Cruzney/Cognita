import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Award, ArrowRight, Loader2 } from 'lucide-react';
import { FlashcardQuiz } from '../types/study';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  topic: string;
  onQuizCompleted: (score: number, total: number, xpReward: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  subject,
  topic,
  onQuizCompleted,
}) => {
  const [quiz, setQuiz] = useState<FlashcardQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);

    const loadQuiz = async () => {
      try {
        const res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, topic }),
        });
        const data = await res.json();
        if (isMounted) {
          setQuiz(data);
        }
      } catch (err) {
        console.error('Quiz loading error:', err);
        if (isMounted) {
          setQuiz({
            quizTitle: `Fixação: ${subject}`,
            xpReward: 150,
            questions: [
              {
                question: `Qual a estratégia mais eficaz para memorização duradoura de "${topic}"?`,
                options: [
                  'Leitura passiva repetida sem pausas',
                  'Recuperação ativa (Active Recall) e testes com intervalos espaçados',
                  'Apenas sublinhar o texto',
                  'Estudar somente no dia anterior à prova',
                ],
                correctIndex: 1,
                explanation: 'A recuperação ativa força o cérebro a reconsolidar a informação nas sinapses neurais.',
              },
            ],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [isOpen, subject, topic]);

  if (!isOpen) return null;

  const currentQuestion = quiz?.questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQuestion?.correctIndex) {
      soundEffects.playQuizSuccess();
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const earnedXp = Math.round((quiz.xpReward * (score + (selectedOption === currentQuestion?.correctIndex ? 1 : 0))) / quiz.questions.length);
      soundEffects.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onQuizCompleted(score, quiz.questions.length, earnedXp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {quiz?.quizTitle || 'Quiz de Fixação Ativa'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Gerando questões com inteligência pedagógica...
              </p>
              <p className="text-xs text-slate-500">Preparando active recall focado em {subject}</p>
            </div>
          ) : isFinished ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Desafio de Fixação Concluído!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Você acertou <strong className="text-slate-900 dark:text-white font-mono">{score}</strong> de{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">{quiz?.questions.length}</strong> questões.
                </p>
              </div>

              <div className="inline-block px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                +{quiz?.xpReward} XP Adicionados ao seu Perfil
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all"
                >
                  Continuar Estudos
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>
                  Questão {currentIndex + 1} de {quiz.questions.length}
                </span>
                <span className="text-amber-600 font-semibold">+{quiz.xpReward} XP</span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  let optStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/80';

                  if (isAnswered) {
                    if (idx === currentQuestion.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold';
                    } else if (idx === selectedOption) {
                      optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200';
                    } else {
                      optStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 font-mono text-xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && idx === currentQuestion.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation card after answering */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>💡 Explicação Pedagógica:</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-all"
                    >
                      <span>{currentIndex + 1 < quiz.questions.length ? 'Próxima Questão' : 'Ver Resultado'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
