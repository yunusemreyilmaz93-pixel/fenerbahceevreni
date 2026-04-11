import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuizQuestion } from '../../constants/quizData';

interface QuestionScreenProps {
  question: QuizQuestion;
  onAnswer: (main: string, secondary: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const QuestionScreen: React.FC<QuestionScreenProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number, main: string, secondary: string) => {
    if (selected !== null) return; // prevent double-click
    setSelected(idx);
    // Small delay so user sees the selection before transitioning
    setTimeout(() => onAnswer(main, secondary), 320);
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl md:text-4xl font-display font-bold text-white leading-tight tracking-tight"
      >
        {question.question}
      </motion.h3>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isDimmed = selected !== null && selected !== idx;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: isDimmed ? 0.35 : 1,
                y: 0,
                scale: isSelected ? 1.01 : 1,
              }}
              transition={{
                delay: selected !== null ? 0 : idx * 0.06,
                duration: 0.2,
              }}
              onClick={() => handleSelect(idx, option.scores.main, option.scores.secondary)}
              disabled={selected !== null}
              className={`
                group relative p-5 md:p-6 rounded-2xl text-left overflow-hidden
                border transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'bg-fb-yellow/10 border-fb-yellow/60 shadow-[0_0_20px_rgba(254,221,0,0.12)]'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-fb-yellow/25'
                }
                disabled:cursor-default
              `}
            >
              {/* Left accent bar */}
              <div className={`
                absolute top-0 left-0 w-[3px] h-full transition-all duration-200
                ${isSelected ? 'bg-fb-yellow' : 'bg-fb-yellow/0 group-hover:bg-fb-yellow/40'}
              `} />

              <div className="flex items-center gap-4 pl-1">
                {/* Letter badge */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  text-[11px] font-black transition-all duration-200 shrink-0
                  border
                  ${isSelected
                    ? 'bg-fb-yellow text-fb-navy border-fb-yellow'
                    : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-fb-yellow group-hover:border-fb-yellow/30'
                  }
                `}>
                  {LETTERS[idx]}
                </div>

                {/* Option text */}
                <p className={`
                  text-sm md:text-base leading-relaxed transition-colors duration-200
                  ${isSelected ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}
                `}>
                  {option.text}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionScreen;