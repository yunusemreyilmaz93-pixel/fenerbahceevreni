import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Vote, Award, MessageSquare, Map, Play, ThumbsUp } from 'lucide-react';
import { castPollVote, dbGetCollection } from '../../lib/dbService';
import { ensureAnonymousUser } from '../../lib/firebase';

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
    win: 0,
    draw: 0,
    loss: 0,
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
        setPoll(activePoll || null);
      } catch (err) {
        console.error("Community poll load error:", err);
        setPoll(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivePoll();
  }, []);

  const handlePollVote = async (optionId: string) => {
    if (votedOptionId || !poll) return;

    try {
      const user = await ensureAnonymousUser();
      await castPollVote(poll.id, optionId, user.uid);
      setVotedOptionId(optionId);
      setPoll((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          options: prev.options.map((option: any) => option.id === optionId ? { ...option, votes: (option.votes || 0) + 1 } : option),
          totalVotes: (prev.totalVotes || 0) + 1
        };
      });
    } catch (err: any) {
      if (String(err?.message || '').includes('daha önce')) setVotedOptionId(optionId);
      console.warn('Community poll vote failed:', err);
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
              SarÄ± Lacivert TribÃ¼n NabzÄ±
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Taraftar OdasÄ±
            </h2>
          </div>
          {poll?.totalVotes ? (
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase font-mono">
              {poll.totalVotes} OY KULLANILDI
            </span>
          ) : null}
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* 1. HaftanÄ±n Anketi Card (Middle Left) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            {loading ? (
              <div className="py-24 text-center text-[#FFD21F] font-mono text-xs uppercase tracking-widest">
                YÃ¼kleniyor...
              </div>
            ) : !poll ? (
              // Clean Turkish Empty State as requested
              <div className="py-20 text-center space-y-4">
                <Vote className="w-10 h-10 text-slate-500 mx-auto opacity-70" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest font-mono">
                  Anket henÃ¼z oluÅŸturulmadÄ±.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#FFD21F] pb-3 border-b border-white/[0.04]">
                  <Vote className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-widest font-mono">HaftanÄ±n Anketi</span>
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
              {votedOptionId ? 'âœ“ Tercihiniz kaydedildi. KatkÄ±nÄ±z iÃ§in teÅŸekkÃ¼rler!' : 'Oyunuz anlÄ±k veri tabanÄ±mÄ±zda toplanÄ±r.'}
            </p>
          </div>

          {/* 2. MaÃ§ Tahmini Card (Middle) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#FFD21F] pb-3 border-b border-white/[0.04]">
                <Award className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">MaÃ§ Tahmini</span>
              </div>
              
              <h3 className="text-base font-black text-white italic tracking-tight leading-snug">
                SÄ±radaki mÃ¼cadelede sarÄ± lacivertli ekibimizin skor beklentiniz nasÄ±l?
              </h3>

              {!predictVotes.voted ? (
                <div className="grid grid-cols-1 gap-2.5 pt-3">
                  <button
                    onClick={() => handlePredict('win')}
                    className="p-3.5 rounded-xl bg-[#0B0F19]/45 border border-white/10 hover:border-[#FFD21F] text-xs font-black uppercase tracking-wider text-white transition-all text-center hover:bg-[#151C30]/40 cursor-pointer"
                  >
                    FenerbahÃ§e Galibiyeti
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
                    Puan KaybÄ±
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-3 font-mono text-xs">
                  <div className="p-3.5 bg-[#0B0F19]/60 rounded-xl border border-white/[0.03] space-y-3">
                    {/* Win */}
                    <div>
                      <div className="flex justify-between font-black text-white mb-1 uppercase tracking-wide">
                        <span>FenerbahÃ§e Galibiyeti</span>
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
                        <span>Puan KaybÄ±</span>
                        <span>{Math.round((predictVotes.loss / (predictVotes.win + predictVotes.draw + predictVotes.loss)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 italic pt-4 mt-6 border-t border-white/[0.05] font-mono">
              Oylanma bittiÄŸi an veri merkezimizde gÃ¶rselleÅŸir.
            </p>
          </div>

          {/* 3. Taraftar GÃ¶rÃ¼ÅŸÃ¼ Card (Middle Right) */}
          <div className="lg:col-span-4 rounded-2xl bg-[#111625] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-lg relative min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#3DDC97] pb-3 border-b border-white/[0.04]">
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">Taraftar GÃ¶rÃ¼ÅŸÃ¼</span>
              </div>
              
              {poll?.featuredComment?.comment ? (
                <div className="p-4 rounded-xl bg-[#0B0F19]/55 border border-white/[0.04] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#FFD21F] font-mono">@{poll.featuredComment.username || 'anonim'}</span>
                    <span className="text-[9px] text-[#3DDC97] font-black uppercase tracking-widest font-mono">PREMÄ°UM ANALÄ°ST</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
                    "{poll.featuredComment.comment}"
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase font-mono">
                    <span>Taktik TartÄ±ÅŸma MasasÄ±</span>
                    {poll.featuredComment.likes ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {poll.featuredComment.likes} BeÄŸeni
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#0B0F19]/55 border border-dashed border-white/[0.08] text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest font-mono leading-relaxed">
                    Ã–ne Ã§Ä±kan taraftar gÃ¶rÃ¼ÅŸÃ¼ henÃ¼z seÃ§ilmedi.
                  </p>
                  <p className="text-[10px] text-slate-500 italic font-mono">
                    TartÄ±ÅŸma masasÄ±ndaki en iyi analiz burada yayÄ±nlanÄ±r.
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('fan-room')}
              className="w-full py-3.5 bg-[#3DDC97]/10 hover:bg-[#3DDC97] text-[#3DDC97] hover:text-[#0B0F19] transition-all text-xs font-black uppercase tracking-wider rounded-xl mt-6 cursor-pointer"
            >
              TartÄ±ÅŸmaya KatÄ±l
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
              Ã–ZEL INTERAKTIF SISTEM
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
              FenerbahÃ§e Fraksiyon AtlasÄ± & Kimlik Analizi
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-medium">
              TopluluÄŸumuzdaki farklÄ± taraftar fraksiyonlarÄ±nÄ± analiz ettiÄŸimiz derin interaktif haritaya gir. EÄŸilimleri gÃ¶rselleÅŸtirin ve Ã¶zgÃ¼n kimlik testimizle kendi taraftar kompozisyonunuzu bulun!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('universe')}
              className="px-6 py-3 bg-[#FFD21F] hover:bg-white text-[#0B0F19] font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <Map className="w-4 h-4" />
              ATLAS'A GÄ°R
            </button>
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-black rounded-xl border border-white/[0.08] text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#FFD21F] fill-[#FFD21F]" />
              KÄ°MLÄ°K TESTÄ°NÄ° AÃ‡
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CommunitySection;

