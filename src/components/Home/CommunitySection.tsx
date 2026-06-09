import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Vote, Award, MessageSquare, Map, Play } from 'lucide-react';
import { communityPoll } from '../../constants/mockData';

interface CommunitySectionProps {
  onNavigate: (view: string) => void;
  onStartQuiz: () => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ onNavigate, onStartQuiz }) => {
  const [votedId, setVotedId] = useState<string | null>(null);
  const [mvpVotes, setMvpVotes] = useState({
    ferdi: 154,
    becao: 98,
    szymanski: 42,
    voted: false
  });

  const handleMvpVote = (player: 'ferdi' | 'becao' | 'szymanski') => {
    if (mvpVotes.voted) return;
    setMvpVotes(prev => ({
      ...prev,
      [player]: prev[player] + 1,
      voted: true
    }));
  };

  const handlePollVote = (id: string) => {
    if (votedId) return;
    setVotedId(id);
  };

  return (
    <section id="fan-room" className="py-20 bg-fb-dark/40 border-t border-b border-white/[0.04]">
      <div className="container mx-auto px-6">
        
        {/* Section title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fb-yellow block mb-2">Etkileşimli Taraftar Tribünü</span>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Taraftar Odası</h2>
          </div>
          <span className="text-xs text-fb-muted font-bold tracking-widest uppercase">
            {communityPoll.totalVotes + 4200} Aktif Katılım
          </span>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Weekly Poll Panel */}
          <div className="lg:col-span-4 rounded-2xl bg-fb-card border border-white/[0.06] p-6 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-fb-yellow">
                <Vote className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Haftalık Oylama</span>
              </div>
              <h3 className="text-lg font-black text-white leading-snug italic">
                {communityPoll.question}
              </h3>

              <div className="space-y-2 pt-2">
                {communityPoll.options.map((opt) => {
                  const isSelected = votedId === opt.id;
                  const hasVoted = votedId !== null;
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePollVote(opt.id)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all relative overflow-hidden ${
                        isSelected ? 'border-fb-yellow bg-fb-yellow/5' : 
                        hasVoted ? 'border-white/5 bg-white/[0.01]' : 'border-white/15 bg-white/5 hover:border-fb-yellow/50'
                      }`}
                    >
                      <span className="relative z-10">{opt.text}</span>
                      {hasVoted && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-fb-yellow/10 transition-all duration-1000"
                          style={{ width: isSelected ? '100%' : '20%' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-fb-muted italic pt-4 mt-6 border-t border-white/[0.05]">
              {votedId ? 'Oyunuz kaydedildi. Katılımınız için teşekkürler!' : 'Tüm oylar anonim olarak saklanır.'}
            </p>
          </div>

          {/* MVP of the Match Oylaması */}
          <div className="lg:col-span-4 rounded-2xl bg-fb-card border border-white/[0.06] p-6 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-fb-yellow">
                <Award className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Maçın Oyuncusu (MVP)</span>
              </div>
              <h3 className="text-lg font-black text-white leading-snug italic">
                Kasımpaşa galibiyetinde sizce sahanın en iyisi kimdi?
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'ferdi' as const, name: 'Ferdi Kadıoğlu', count: mvpVotes.ferdi },
                  { key: 'becao' as const, name: 'Rodrigo Becão', count: mvpVotes.becao },
                  { key: 'szymanski' as const, name: 'Sebastian Szymański', count: mvpVotes.szymanski }
                ].map((item) => {
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleMvpVote(item.key)}
                      className={`w-full p-3 rounded-lg border text-left text-xs font-bold flex justify-between items-center transition-all ${
                        mvpVotes.voted ? 'border-white/5 bg-white/[0.01]' : 'border-white/10 bg-white/5 hover:border-fb-yellow/40'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-fb-yellow">{item.count} oy</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-fb-muted italic pt-4 mt-6 border-t border-white/[0.05]">
              Bir sonraki resmi lig maçının bitimiyle yeni oylama açılacaktır.
            </p>
          </div>

          {/* Featured Fan Comment Card */}
          <div className="lg:col-span-4 rounded-2xl bg-fb-card border border-white/[0.06] p-6 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#3DDC97]">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Öne Çıkan Taraftar Yorumu</span>
              </div>
              
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-fb-yellow">@{communityPoll.featuredComment?.username}</span>
                  <span className="text-[10px] text-fb-muted font-bold">⭐ Premium Üye</span>
                </div>
                <p className="text-xs text-white leading-relaxed font-medium">
                  "{communityPoll.featuredComment?.comment}"
                </p>
                <div className="flex justify-between items-center text-[10px] text-fb-muted font-bold uppercase">
                  <span>Taktik Tartışma Odası</span>
                  <span className="text-emerald-400">👍 {communityPoll.featuredComment?.likes} Beğeni</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('fan-room')}
              className="w-full py-3 bg-[#3DDC97]/10 hover:bg-[#3DDC97] text-[#3DDC97] hover:text-fb-navy transition-all text-xs font-black uppercase tracking-wider rounded-xl mt-6"
            >
              Tartışmaya Katıl
            </button>
          </div>

        </div>

        {/* Unified Premium Fan Experience promotional section (Links to Faction Atlas & Personality Quiz) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl bg-gradient-to-br from-fb-navy/50 via-fb-card to-fb-dark border border-white/[0.08] text-center sm:text-left relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-8"
        >
          {/* Subtle decoration sphere */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-fb-yellow/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-fb-yellow/10 border border-fb-yellow/20 rounded-full text-[9px] font-black uppercase text-fb-yellow tracking-widest">
              ÖZEL ETKİLEŞİMLİ DENEYİM
            </div>
            <h3 className="text-2xl font-black text-white italic">
              Fenerbahçe Fraksiyon Atlası & Kimlik Analizi
            </h3>
            <p className="text-xs text-fb-muted leading-relaxed max-w-xl">
              Fenerbahçe taraftar dinamiklerini analiz ettiğimiz interaktif evren haritasını keşfet. 
              Göz alıcı ağ yapısı üzerinde gezinti yap ve taraftar kimliği quizimizle kendi fraksiyonunu hemen bul!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('universe')}
              className="px-6 py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(255,210,31,0.2)]"
            >
              <Map className="w-4 h-4" />
              İNTERAKTİF ATLASEA GİR
            </button>
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-white/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-fb-yellow fill-fb-yellow" />
              KİMLİK TESTİNİ AÇ
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CommunitySection;
