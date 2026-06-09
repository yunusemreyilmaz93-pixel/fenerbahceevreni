import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Vote, Award, MessageSquare, Map, Play, ThumbsUp } from 'lucide-react';
import { communityPoll } from '../../constants/mockData';
import { dbGetCollection } from '../../lib/dbService';

interface CommunitySectionProps {
  onNavigate: (view: string) => void;
  onStartQuiz: () => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ onNavigate, onStartQuiz }) => {
  const [poll, setPoll] = useState<any>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // MVP/Match Prediction State
  const [prediction, setPrediction] = useState<string | null>(null);
  const [predictVotes, setPredictVotes] = useState({
    win: 1740,
    draw: 480,
    loss: 210,
    voted: false
  });

  const handlePredict = (option: 'win' | 'draw' | 'loss') => {
    if (predictVotes.voted) return;
    setPredictVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1,
      voted: true
    }));
    setPrediction(option);
  };

  useEffect(() => {
    const fetchActivePoll = async () => {
      try {
        const pollsList = await dbGetCollection('polls');
        // Find first active or latest poll
        const activePoll = pollsList.find((p: any) => p.status === 'active') || pollsList[0];
        if (activePoll) {
          setPoll(activePoll);
        } else {
          // Fallback to seeded mock poll
          setPoll(communityPoll);
        }
      } catch (err) {
        console.error("Community poll load error:", err);
        setPoll(communityPoll);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivePoll();
  }, []);

  const handlePollVote = (optionId: string) => {
    if (votedOptionId) return;
    setVotedOptionId(optionId);
    
    // Increment local vote count
    if (poll && Array.isArray(poll.options)) {
      setPoll((prev: any) => {
        const nextOptions = prev.options.map((opt: any) => {
          if (opt.id === optionId) {
            return { ...opt, votes: (opt.votes || 0) + 1 };
          }
          return opt;
        });
        return {
          ...prev,
          options: nextOptions,
          totalVotes: (prev.totalVotes || 0) + 1
        };
      });
    }
  };

  const getVotePercentage = (votes: number) => {
    const total = poll?.totalVotes || 1;
    return Math.round((votes / total) * 100);
  };

  return (
    <section id="fan-room" className="py-24 bg-[#090D16] border-t border-b border-white/[0.03] relative overflow-hidden">
      
      {/* Background glow lines */}
      <div className="absolute top-[40%] right-[5%] w-[300px] h-[300px] bg-[#002F6C]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full text-left">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F] block mb-2 font-mono">
              Sarı Lacivert Tribün Nabzı
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Taraftar Odası
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-bold tracking-widest uppercase font-mono">
            {poll?.totalVotes ? poll.totalVotes + 4200 : '5740'} AKTİF TARAFTAR
          </span>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* 1. Haftanın Anketi Card (Middle Left) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            {loading ? (
              <div className="py-24 text-center text-[#FFD21F] font-mono text-xs uppercase tracking-widest">
                Yükleniyor...
              </div>
            ) : !poll ? (
              // Clean Turkish Empty State as requested
              <div className="py-20 text-center space-y-4">
                <Vote className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest font-mono">
                  Anket henüz oluşturulmadı.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#FFD21F] pb-3 border-b border-white/[0.04]">
                  <Vote className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest font-mono">Haftanın Anketi</span>
                </div>
                
                <h3 className="text-base font-black text-white italic tracking-tight leading-snug">
                  {poll.question}
                </h3>

                <div className="space-y-3 pt-3">
                  {poll.options && poll.options.map((opt: any) => {
                    const isSelected = votedOptionId === opt.id;
                    const hasVoted = votedOptionId !== null;
                    const percentage = getVotePercentage(opt.votes || 0);
                    
                    return (
                      <button
                        key={opt.id}
                        disabled={hasVoted}
                        onClick={() => handlePollVote(opt.id)}
                        className={`w-full p-4 rounded-xl border text-left text-xs font-bold transition-all relative overflow-hidden flex justify-between items-center ${
                          isSelected 
                            ? 'border-[#FFD21F] bg-[#FFD21F]/5 text-white' 
                            : hasVoted 
                              ? 'border-white/5 bg-white/[0.01] text-slate-400' 
                              : 'border-white/10 bg-[#0B0F19]/40 hover:border-[#FFD21F]/50 text-slate-200 cursor-pointer'
                        }`}
                      >
                        <span className="relative z-10 font-bold uppercase truncate max-w-[210px]">{opt.text}</span>
                        {hasVoted && (
                          <>
                            <span className="relative z-10 font-mono font-black text-[#FFD21F]">{percentage}%</span>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                              className="absolute left-0 top-0 bottom-0 bg-[#FFD21F]/10 z-0 pointer-events-none"
                            />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-500 italic pt-4 mt-6 border-t border-white/[0.05] font-mono leading-relaxed">
              {votedOptionId ? '✓ Tercihiniz kaydedildi. Katkınız için teşekkürler!' : 'Oyunuz anlık veri tabanımızda toplanır.'}
            </p>
          </div>

          {/* 2. Maç Tahmini Card (Middle) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#FFD21F] pb-3 border-b border-white/[0.04]">
                <Award className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">Maç Tahmini</span>
              </div>
              
              <h3 className="text-base font-black text-white italic tracking-tight leading-snug">
                Sıradaki mücadelede sarı lacivertli ekibimizin skor beklentiniz nasıl?
              </h3>

              {!predictVotes.voted ? (
                <div className="grid grid-cols-1 gap-2.5 pt-3">
                  <button
                    onClick={() => handlePredict('win')}
                    className="p-3.5 rounded-xl bg-[#0B0F19]/45 border border-white/10 hover:border-[#FFD21F] text-xs font-black uppercase tracking-wider text-white transition-all text-center hover:bg-[#151C30]/40 cursor-pointer"
                  >
                    Fenerbahçe Galibiyeti
                  </button>
                  <button
                    onClick={() => handlePredict('draw')}
                    className="p-3.5 rounded-xl bg-[#0B0F19]/45 border border-white/10 hover:border-[#FFD21F] text-xs font-black uppercase tracking-wider text-white transition-all text-center hover:bg-[#151C30]/40 cursor-pointer"
                  >
                    Beraberlik
                  </button>
                  <button
                    onClick={() => handlePredict('loss')}
                    className="p-3.5 rounded-xl bg-[#0B0F19]/45 border border-white/10 hover:border-[#FFD21F] text-xs font-black uppercase tracking-wider text-white transition-all text-center hover:bg-[#151C30]/40 cursor-pointer"
                  >
                    Puan Kaybı
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-3 font-mono text-xs">
                  <div className="p-3.5 bg-[#0B0F19]/60 rounded-xl border border-white/[0.03] space-y-3">
                    {/* Win */}
                    <div>
                      <div className="flex justify-between font-black text-white mb-1 uppercase tracking-wide">
                        <span>Fenerbahçe Galibiyeti</span>
                        <span>{Math.round((predictVotes.win / (predictVotes.win + predictVotes.draw + predictVotes.loss)) * 100)}%</span>
                      </div>
                    </div>
                    {/* Draw */}
                    <div>
                      <div className="flex justify-between font-black text-white mb-1 uppercase tracking-wide">
                        <span>Beraberlik</span>
                        <span>{Math.round((predictVotes.draw / (predictVotes.win + predictVotes.draw + predictVotes.loss)) * 100)}%</span>
                      </div>
                    </div>
                    {/* Loss */}
                    <div>
                      <div className="flex justify-between font-black text-white mb-1 uppercase tracking-wide">
                        <span>Puan Kaybı</span>
                        <span>{Math.round((predictVotes.loss / (predictVotes.win + predictVotes.draw + predictVotes.loss)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic pt-4 mt-6 border-t border-white/[0.05] font-mono">
              Oylanma bittiği an veri merkezimizde görselleşir.
            </p>
          </div>

          {/* 3. Taraftar Görüşü Card (Middle Right) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#3DDC97] pb-3 border-b border-white/[0.04]">
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">Taraftar Görüşü</span>
              </div>
              
              <div className="p-4 rounded-xl bg-[#0B0F19]/55 border border-white/[0.04] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#FFD21F] font-mono">@{poll?.featuredComment?.username || 'TaktikSevdalisi'}</span>
                  <span className="text-[9px] text-[#3DDC97] font-black uppercase tracking-widest font-mono">PREMİUM ANALİST</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
                  "{poll?.featuredComment?.comment || 'Orta alan merkez pas direncini kırmak için Fred ve Szymanski ikilisinin pres geometrisi bu maçta kilidi açmak için en kilit faktör olacaktır.'}"
                </p>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase font-mono">
                  <span>Taktik Tartışma Masası</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {poll?.featuredComment?.likes || '84'} Beğeni
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('fan-room')}
              className="w-full py-3.5 bg-[#3DDC97]/10 hover:bg-[#3DDC97] text-[#3DDC97] hover:text-[#0B0F19] transition-all text-xs font-black uppercase tracking-wider rounded-xl mt-6 cursor-pointer"
            >
              Tartışmaya Katıl
            </button>
          </div>

        </div>

        {/* Unified Premium Fan Experience promotional section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl bg-[#111625] border border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-8 shadow-xl"
        >
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD21F]/10 border border-[#FFD21F]/20 rounded-full text-[9px] font-black uppercase text-[#FFD21F] tracking-widest font-mono">
              ÖZEL INTERAKTIF SISTEM
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
              Fenerbahçe Fraksiyon Atlası & Kimlik Analizi
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-medium">
              Topluluğumuzdaki farklı taraftar fraksiyonlarını analiz ettiğimiz derin interaktif haritaya gir. Eğilimleri görselleştirin ve özgün kimlik testimizle kendi taraftar kompozisyonunuzu bulun!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('universe')}
              className="px-6 py-3 bg-[#FFD21F] hover:bg-white text-[#0B0F19] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <Map className="w-4 h-4" />
              ATLASEA GİR
            </button>
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-black rounded-xl border border-white/[0.08] text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#FFD21F] fill-[#FFD21F]" />
              KİMLİK TESTİNİ AÇ
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CommunitySection;
