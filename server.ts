import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate Personalized Study Schedule
app.post('/api/generate-schedule', async (req: Request, res: Response) => {
  try {
    const { goal, availableHoursPerDay, subjects, targetDate, currentLevel } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // High-quality fallback if no key
      return res.json({
        planName: `Plano Estratégico: ${goal || 'Foco Total'}`,
        weeklyHours: (availableHoursPerDay || 3) * 6,
        summary: 'Cronograma otimizado com metodologia de Repetição Espaçada e Prática Deliberada para maximizar a retenção diária.',
        schedule: [
          {
            day: 'Segunda-feira',
            focus: 'Fundamentos e Teoria Base',
            blocks: [
              { time: '08:30 - 09:30', subject: subjects?.[0] || 'Matemática e Raciocínio', topic: 'Conceitos Fundamentais e Fórmulas Essenciais', method: 'Pomodoro (25/5 min)', xp: 120 },
              { time: '09:45 - 10:45', subject: subjects?.[1] || 'Português / Redação', topic: 'Interpretação de Texto e Estruturas Gramaticais', method: 'Active Recall', xp: 120 },
              { time: '11:00 - 11:30', subject: 'Revisão Rápida', topic: 'Flashcards de Consolidação', method: 'Repetição Espaçada', xp: 60 }
            ]
          },
          {
            day: 'Terça-feira',
            focus: 'Aprofundamento e Resolução de Questões',
            blocks: [
              { time: '08:30 - 09:30', subject: subjects?.[2] || 'Direito Constitucional / História', topic: 'Princípios e Análise de Casos Reais', method: 'Prática Ativa', xp: 120 },
              { time: '09:45 - 10:45', subject: subjects?.[0] || 'Matemática e Raciocínio', topic: 'Bateria de 15 Exercícios Práticos', method: 'Simulado Rápido', xp: 130 }
            ]
          },
          {
            day: 'Quarta-feira',
            focus: 'Prática Intensiva e Resolução',
            blocks: [
              { time: '14:00 - 15:15', subject: subjects?.[1] || 'Língua Portuguesa', topic: 'Redação: Argumentação e Repertório', method: 'Escrita Cronometrada', xp: 140 },
              { time: '15:30 - 16:30', subject: subjects?.[2] || 'Legislação / Ciências', topic: 'Mapas Mentais e Fixação de Pegadinhas', method: 'Feynman Technique', xp: 110 }
            ]
          },
          {
            day: 'Quinta-feira',
            focus: 'Revisão Intercalada',
            blocks: [
              { time: '09:00 - 10:15', subject: subjects?.[0] || 'Exatas / Algoritmos', topic: 'Análise de Erros dos Exercícios Anteriores', method: 'Autodiagnóstico', xp: 130 },
              { time: '10:30 - 11:30', subject: subjects?.[1] || 'Atualidades / Teoria', topic: 'Revisão de Conteúdos Difíceis', method: 'Active Recall', xp: 110 }
            ]
          },
          {
            day: 'Sexta-feira',
            focus: 'Consolidação e Simulado Semanal',
            blocks: [
              { time: '14:00 - 15:30', subject: 'Simulado Diagnóstico', topic: '25 Questões Cronometradas estilo Prova', method: 'Modo Prova', xp: 200 },
              { time: '15:45 - 16:30', subject: 'Gabarito Comentado', topic: 'Identificação de Pontos Cegos', method: 'Revisão Espaçada', xp: 100 }
            ]
          },
          {
            day: 'Sábado',
            focus: 'Revisão Leve e Gamificação',
            blocks: [
              { time: '10:00 - 11:15', subject: 'Flashcard Challenge', topic: 'Maratona de 50 Flashcards de todas as matérias', method: 'Quiz Gamificado', xp: 180 }
            ]
          }
        ],
        smartReminders: [
          { time: '08:15', title: 'Energia Mental no Pico', body: 'Seu primeiro bloco de foco começa em 15 minutos! Prepare sua água.' },
          { time: '11:45', title: 'Revisão Espaçada Pronta', body: 'Gaste 5 minutos agora e retenha até 80% mais do que estudou hoje.' },
          { time: '20:30', title: 'Quests Diárias do Cognita', body: 'Faltam só 40 XP para garantir sua ofensiva diária de estudos!' }
        ]
      });
    }

    const prompt = `Crie um cronograma de estudo semanal altamente personalizado, eficiente e gamificado para um estudante com o objetivo: "${goal || 'Aprovação e Domínio de Estudos'}".
Horas disponíveis por dia: ${availableHoursPerDay || 3} horas.
Matérias principais: ${Array.isArray(subjects) ? subjects.join(', ') : 'Geral'}.
Nível atual do aluno: ${currentLevel || 'Intermediário'}.
Data alvo/exame: ${targetDate || 'Em 3 meses'}.

Instruções pedagógicas:
- Use distribuição inteligente (Repetição Espaçada, Pomodoro 25/5 e 50/10, Técnica de Feynman, Baterias de Questões).
- Defina blocos realistas com horários sugeridos, matéria, tópico específico a focar, método e XP estimado (entre 60 e 200 XP).
- Adicione 3 a 5 lembretes inteligentes por push adaptados aos melhores horários de retenção cognitiva.
Responda em JSON válido seguindo estritamente a estrutura solicitada em português brasileiro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planName: { type: Type.STRING },
            weeklyHours: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  blocks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        method: { type: Type.STRING },
                        xp: { type: Type.NUMBER },
                      },
                      required: ['time', 'subject', 'topic', 'method', 'xp'],
                    },
                  },
                },
                required: ['day', 'focus', 'blocks'],
              },
            },
            smartReminders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  body: { type: Type.STRING },
                },
                required: ['time', 'title', 'body'],
              },
            },
          },
          required: ['planName', 'weeklyHours', 'summary', 'schedule', 'smartReminders'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating schedule with Gemini:', error);
    // Return gracefully structured fallback
    return res.status(200).json({
      planName: 'Plano Personalizado Cognita',
      weeklyHours: 18,
      summary: 'Plano focado em alta retenção por repetição espaçada e prática ativa.',
      schedule: [
        {
          day: 'Segunda-feira',
          focus: 'Teoria e Fundamentos',
          blocks: [
            { time: '08:30 - 09:30', subject: 'Módulos Essenciais', topic: 'Revisão Conceitual Ativa', method: 'Pomodoro', xp: 120 },
            { time: '09:45 - 10:45', subject: 'Prática de Questões', topic: 'Bateria de Fixação Rápida', method: 'Active Recall', xp: 120 }
          ]
        },
        {
          day: 'Terça-feira',
          focus: 'Aprofundamento',
          blocks: [
            { time: '14:00 - 15:15', subject: 'Tópicos Críticos', topic: 'Mapas Mentais e Síntese', method: 'Feynman', xp: 130 }
          ]
        }
      ],
      smartReminders: [
        { time: '08:30', title: 'Hora de Foco Cognita', body: 'Inicie sua sessão matinal e garanta o primeiro bônus de XP do dia!' }
      ]
    });
  }
});

// Endpoint: Generate Active Recall Quiz for any subject
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        quizTitle: `Desafio de Fixação: ${subject || 'Geral'}`,
        xpReward: 150,
        questions: [
          {
            question: `Qual a melhor abordagem ao estudar "${topic || subject || 'um novo conteúdo'}" para reter conhecimento a longo prazo?`,
            options: [
              'Releitura passiva do texto várias vezes seguidas',
              'Auto-explicação (Técnica de Feynman) e testes ativos com repetição espaçada',
              'Sublinhar com marca-texto colorido sem resolver exercícios',
              'Estudar 8 horas seguidas na véspera sem pausas'
            ],
            correctIndex: 1,
            explanation: 'A ciência da aprendizagem comprova que a recuperação ativa (active recall) e repetição espaçada fortalecem as vias sinápticas com até 70% mais eficácia que a leitura passiva.'
          },
          {
            question: `Na metodologia Pomodoro tradicional, qual é a duração padrão do ciclo de foco e do intervalo curto?`,
            options: [
              '15 minutos de foco e 10 de pausa',
              '25 minutos de foco e 5 de descanso mental',
              '60 minutos de foco e 30 de descanso',
              '45 minutos de foco sem pausas'
            ],
            correctIndex: 1,
            explanation: 'O ciclo clássico é de 25 minutos de foco ininterrupto seguido de 5 minutos de pausa deliberada para descansar o córtex pré-frontal.'
          },
          {
            question: `O que é a "Curva do Esquecimento" de Ebbinghaus e como superá-la?`,
            options: [
              'É uma falha genética; supera-se tomando suplementos',
              'Mostra a rápida perda de memória sem revisão; supera-se com revisões programadas no 1º, 7º e 30º dia',
              'Significa que só lembramos de imagens; supera-se não lendo textos',
              'Indica que estudar à noite é sempre inútil'
            ],
            correctIndex: 1,
            explanation: 'Revisões espaçadas quebram a curva descendente e tornam a memória volátil em memória de longo prazo.'
          }
        ]
      });
    }

    const prompt = `Crie 3 perguntas inteligentes de múltipla escolha com active recall sobre a matéria "${subject || 'Geral'}" no tópico "${topic || 'Conceitos Chave'}".
Gere perguntas instigantes de nível médio/avançado que ajudem na fixação real, com 4 alternativas, índice da alternativa correta (0 a 3) e uma explicação didática detalhada de por que aquela é a resposta correta. Responda em JSON em português brasileiro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['quizTitle', 'xpReward', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    return res.status(200).json({
      quizTitle: 'Quiz Rápido de Fixação',
      xpReward: 100,
      questions: [
        {
          question: 'Qual prática potencializa a retenção de conceitos complexos segundo a neurociência?',
          options: [
            'Dormir menos de 5 horas para ganhar tempo',
            'Testar a si mesmo antes mesmo de conferir as anotações',
            'Copiar páginas inteiras de livros à mão mecanicamente',
            'Assistir a videoaulas com o dobro de velocidade sem anotações'
          ],
          correctIndex: 1,
          explanation: 'O esforço cognitivo de puxar a memória da mente consolida a retenção.'
        }
      ]
    });
  }
});

// Endpoint: AI Study Coach Advice
app.post('/api/study-advice', async (req: Request, res: Response) => {
  try {
    const { streak, totalMinutes, level, weakestSubject } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        coachTip: `Você já acumulou ${totalMinutes || 120} minutos e uma ofensiva de ${streak || 3} dias! Seu próximo salto de rendimento será focar 20 minutos de questões comentadas em ${weakestSubject || 'seus pontos mais desafiadores'}.`,
        suggestedChallenge: 'Resolva 10 questões práticas antes do meio-dia para ganhar +80 XP bônus.'
      });
    }

    const prompt = `Você é o Cognita AI Coach, um mentor de alta performance em estudos, neurociência da aprendizagem e produtividade.
O aluno tem:
- Ofensiva atual: ${streak || 1} dias seguidos.
- Tempo total estudado: ${totalMinutes || 60} minutos.
- Nível de jogador: Nível ${level || 1}.
- Matéria que mais necessita de atenção: ${weakestSubject || 'Geral'}.

Dê um conselho curto, motivador, estratégico e fundamentado em neurociência (máximo 3 frases) e proponha um micro-desafio de alto impacto para hoje. Responda em JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachTip: { type: Type.STRING },
            suggestedChallenge: { type: Type.STRING },
          },
          required: ['coachTip', 'suggestedChallenge'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Error in study advice:', error);
    return res.json({
      coachTip: 'Mantenha a consistência: 30 minutos diários com foco deliberado superam 5 horas desatentas no final de semana.',
      suggestedChallenge: 'Complete 1 ciclo Pomodoro ininterrupto sem olhar o celular.'
    });
  }
});

// Dev / Production Vite handling
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cognita Study App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
