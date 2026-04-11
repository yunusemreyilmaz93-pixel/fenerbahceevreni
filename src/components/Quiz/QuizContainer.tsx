import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUIZ_QUESTIONS } from '../../constants/quizData';
import QuestionScreen from './QuestionScreen';
import ResultScreen from './ResultScreen';
import { X, ChevronLeft } from 'lucide-react';

interface QuizContainerProps {
  onClose: () => void;
  onExplore: (factionName: string) => void;
}

type QuizStatus = 'start' | 'in-progress' | 'finished';

const TOTAL = QUIZ_QUESTIONS.length;

const QuizContainer: React.FC<QuizContainerProps> = ({ onClose, onExplore }) => {
  const [status, setStatus] = useState<QuizStatus>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  // Track answer history so we can undo on back
  const [history, setHistory] = useState<Array<{ main: string; secondary: string }>>([]);

  const handleAnswer = useCallback((main: string, secondary: string) => {
    setScores(prev => ({
      ...prev,
      [main]: (prev[main] || 0) + 3,
      [secondary]: (prev[secondary] || 0) + 1,
    }));
    setHistory(prev => [...prev, { main, secondary }]);

    if (currentIndex < TOTAL - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStatus('finished');
    }
  }, [currentIndex]);

  const handleBack = useCallback(() => {
    if (status === 'finished') {
      // Go back to last question from result screen
      setStatus('in-progress');
      return;
    }

    if (currentIndex === 0) {
      setStatus('start');
      return;
    }

    // Undo last answer
    const prev = history[history.length - 1];
    if (prev) {
      setScores(s => ({
        ...s,
        [prev.main]: Math.max(0, (s[prev.main] || 0) - 3),
        [prev.secondary]: Math.max(0, (s[prev.secondary] || 0) - 1),
      }));
      setHistory(h => h.slice(0, -1));
    }
    setCurrentIndex(prev => prev - 1);
  }, [status, currentIndex, history]);

  const handleReset = useCallback(() => {
    setScores({});
    setCurrentIndex(0);
    setHistory([]);
    setStatus('start');
  }, []);

  const progress = ((currentIndex + (status === 'finished' ? 1 : 0)) / TOTAL) * 100;
  const showBack = status === 'in-progress' || status === 'finished';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-fb-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
    >
      {/* Header controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="w-24">
          {showBack && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="intelligence-label text-[10px]">GERİ</span>
            </motion.button>
          )}
        </div>

        {/* Progress indicator — center */}
        {status === 'in-progress' && (
          <div className="flex flex-col items-center gap-1.5 flex-1 px-4">
            <div className="h-[2px] w-full max-w-xs bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-fb-yellow shadow-[0_0_8px_rgba(254,221,0,0.5)]"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>
            <span className="intelligence-label text-slate-500 text-[9px] tracking-widest">
              {currentIndex + 1} / {TOTAL}
            </span>
          </div>
        )}

        <div className="w-24 flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all group"
          >
            <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Screens */}
      <AnimatePresence mode="wait">
        {status === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl text-center space-y-10"
          >
            <div className="space-y-5">
              <div className="inline-block px-3 py-1 rounded-full border border-fb-yellow/20 bg-fb-yellow/5">
                <span className="intelligence-label text-fb-yellow text-[9px] tracking-widest">
                  {TOTAL} SORU · 5 ŞIK · 12 FRAKSİYON
                </span>
              </div>
              <h2 className="galaxy-title text-4xl md:text-6xl fb-gradient-text uppercase leading-none">
                HANGİ<br />FRAKSİYONDASIN?
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto">
                Fenerbahçe tribünlerinin derinliklerindeki yerini bulma vakti geldi.
                15 soru, tek bir gerçek.
              </p>
            </div>

            <button
              onClick={() => setStatus('in-progress')}
              className="px-14 py-4 rounded-full bg-fb-yellow text-fb-navy font-black intelligence-label text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(254,221,0,0.25)]"
            >
              TESTE BAŞLA
            </button>
          </motion.div>
        )}

        {status === 'in-progress' && (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-3xl mt-16"
          >
            <QuestionScreen
              question={QUIZ_QUESTIONS[currentIndex]}
              onAnswer={handleAnswer}
            />
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-h-full overflow-y-auto custom-scrollbar mt-16"
          >
            <ResultScreen
              scores={scores}
              onReset={handleReset}
              onExplore={onExplore}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizContainer;