
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, CheckCircle2 } from 'lucide-react';
import { WEEKLY_POLL } from '../../constants/homeData';

const FanPulse: React.FC = () => {
  const [voted, setVoted] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);

  const moods = [
    { emoji: '🔥', label: 'Hırslı' },
    { emoji: '😎', label: 'Özgüvenli' },
    { emoji: '🧘', label: 'Sakin' },
    { emoji: '😤', label: 'Gergin' },
    { emoji: '💛', label: 'Aşık' },
  ];

  return (
    <section className="py-24 bg-fb-navy/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Weekly Poll */}
          <div className="flex-1">
            <div className="intelligence-label text-fb-yellow mb-2">HAFTALIK ANKET</div>
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter mb-8">TARAFTARIN SESİ</h2>
            
            <div className="glass-panel rounded-3xl p-8">
              <p className="text-xl font-bold mb-8 leading-tight">{WEEKLY_POLL.question}</p>
              
              <div className="space-y-4">
                {WEEKLY_POLL.options.map((option) => {
                  const percentage = Math.round((option.votes / WEEKLY_POLL.totalVotes) * 100);
                  const isSelected = voted === option.id;

                  return (
                    <button
                      key={option.id}
                      disabled={voted !== null}
                      onClick={() => setVoted(option.id)}
                      className={`relative w-full p-5 rounded-2xl border transition-all text-left overflow-hidden group ${
                        isSelected 
                          ? 'border-fb-yellow bg-fb-yellow/10' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {voted && (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="absolute inset-y-0 left-0 bg-fb-yellow/10 z-0"
                        />
                      )}
                      
                      <div className="relative z-10 flex justify-between items-center">
                        <span className="font-bold flex items-center gap-3">
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-fb-yellow" />}
                          {option.text}
                        </span>
                        {voted && (
                          <span className="text-fb-yellow font-black">%{percentage}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{WEEKLY_POLL.totalVotes.toLocaleString()} OY KULLANILDI</span>
                <button className="flex items-center gap-2 hover:text-fb-yellow transition-colors">
                  <Share2 className="w-4 h-4" /> PAYLAŞ
                </button>
              </div>
            </div>
          </div>

          {/* Fan Mood */}
          <div className="w-full md:w-[400px]">
            <div className="intelligence-label text-fb-yellow mb-2">RUH HALİ</div>
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter mb-8">BUGÜN NASILSIN?</h2>
            
            <div className="glass-panel rounded-3xl p-8">
              <p className="text-slate-400 text-sm mb-8">Camianın bugünkü genel ruh halini belirle.</p>
              
              <div className="grid grid-cols-5 gap-4 mb-8">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMood(m.label)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                      mood === m.label ? 'bg-fb-yellow/20 scale-110' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">GENEL DURUM</span>
                  <span className="text-xs font-bold text-fb-yellow">🔥 %68 HIRSLI</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '68%' }}
                    className="h-full bg-fb-yellow"
                  />
                </div>
              </div>
            </div>

            {/* Community Spotlight */}
            <div className="mt-8 p-6 bg-gradient-to-br from-fb-navy/40 to-fb-dark rounded-3xl border border-fb-navy/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-fb-yellow/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-fb-yellow" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">HAFTANIN YORUMU</span>
              </div>
              <p className="text-sm italic text-slate-300 mb-4">
                "Bu sene o sene değil, bu sene HER SENE! Evrenin neresinde olursak olalım, kalbimiz Kadıköy'de atıyor."
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fb-yellow">@SARI_KANARYA_1907</span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Heart className="w-3 h-3 fill-current" /> 1.2K
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FanPulse;
