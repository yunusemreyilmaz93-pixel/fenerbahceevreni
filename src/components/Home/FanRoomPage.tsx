import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, 
  Flame, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  Send, 
  Heart, 
  Calendar, 
  Gamepad2, 
  ThumbsUp, 
  Award,
  BookOpen,
  PlusCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { dbGetCollection, dbAddDocument, dbUpsertDocument } from '../../lib/dbService';
import SEO from './SEO';

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: { [option: string]: number };
  relatedMatchId?: string;
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface MatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  question: string;
  options: string[];
  votes: { [option: string]: number };
  expectedScore: string;
  confidenceScore: number;
}

interface DiscussionTopic {
  id: string;
  title: string;
  tag: string;
  commentCount: number;
  excerpt: string;
  comments: { username: string; text: string; date: string; likes: number }[];
}

interface PlayersPageProps {
  onNavigate: (view: string) => void;
}

export const FanRoomPage: React.FC<PlayersPageProps> = ({ onNavigate }) => {
  // States
  const [polls, setPolls] = useState<Poll[]>([]);
  const [matchPrediction, setMatchPrediction] = useState<MatchPrediction | null>(null);
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive UI states
  const [votedPolls, setVotedPolls] = useState<{ [pollId: string]: string }>({});
  const [votedMatchPredict, setVotedMatchPredict] = useState<string | null>(null);
  const [votedPlayerOfWeek, setVotedPlayerOfWeek] = useState<string | null>(null);
  const [featuredCommentVote, setFeaturedCommentVote] = useState<'agree' | 'disagree' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Active playing topic for commenting
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [customCommentUser, setCustomCommentUser] = useState('');
  const [topicToast, setTopicToast] = useState<string | null>(null);

  // Stats Counters
  const communityStats = {
    activePolls: 4,
    weeklyVotes: 1284,
    weeklyQuestion: 1,
    fanComments: 326
  };

  // Seed / Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch polls
        let allPolls: Poll[] = await dbGetCollection('polls');
        const activePolls = allPolls.filter(p => p.status === 'active');
        
        // Ensure there's at least one poll, fallback to mock if empty
        if (activePolls.length === 0) {
          const fallbackPoll: Poll = {
            id: 'poll-default',
            question: "Fenerbahçe’nin şu an en acil çözmesi gereken problem ne?",
            options: [
              "Orta saha dengesi",
              "Savunma geçişleri",
              "Bitiricilik",
              "Kenar rotasyonu"
            ],
            votes: {
              "Orta saha dengesi": 542,
              "Savunma geçişleri": 361,
              "Bitiricilik": 258,
              "Kenar rotasyonu": 129
            },
            status: 'active'
          };
          setPolls([fallbackPoll]);
        } else {
          setPolls(activePolls);
        }

        // 2. Fetch matches or use mock match prediction setup
        const fallbackPrediction: MatchPrediction = {
          matchId: 'match-1',
          homeTeam: "Fenerbahçe",
          awayTeam: "Beşiktaş",
          competition: "Trendyol Süper Lig • 36. Hafta",
          question: "Bu maç nasıl biter?",
          options: ["Fenerbahçe kazanır", "Beraberlik", "Rakip kazanır"],
          votes: { "Fenerbahçe kazanır": 720, "Beraberlik": 180, "Rakip kazanır": 100 },
          expectedScore: "2-1",
          confidenceScore: 7.8
        };
        setMatchPrediction(fallbackPrediction);

        // 3. Discussion topics initialization
        const initialTopics: DiscussionTopic[] = [
          {
            id: "disc-1",
            title: "Bu takımın ideal orta saha üçlüsü kim olmalı?",
            tag: "Taktik",
            commentCount: 128,
            excerpt: "Merkezde denge mi, yaratıcılık mı, pres gücü mü? Fenerbahçe’nin doğru üçlüsü üzerine taraftar görüşleri.",
            comments: [
              { username: "mou_taktik", text: "Kesinlikle Fred - İsmail - Amrabat üçlüsü başlamalı. Hem direnç kazanır hem de Fred rahat ileri sarkar.", date: "1 saat önce", likes: 14 },
              { username: "kadikoy_kartali", text: "Szymanski yerine İrfan Can merkezde 8.5 gibi oynamalı, yaratıcılığımız çok düşük seviyede.", date: "2 saat önce", likes: 8 }
            ]
          },
          {
            id: "disc-2",
            title: "Transferde öncelik hangi bölge olmalı?",
            tag: "Transfer",
            commentCount: 96,
            excerpt: "6 numara mı, stoper mi, kanat mı? Kadro ihtiyacına dair ortak akıl.",
            comments: [
              { username: "scout_bora", text: "Sol kanat beki Heeren alınırsa Ferdi orta sahaya geçer veya alternatif yaratırız.", date: "4 saat önce", likes: 22 },
              { username: "fener_turan", text: "Yaratıcı bir orta saha ve yedek bir stoper sezon sonu şampiyonluğunu doğrudan çözer.", date: "5 saat önce", likes: 19 }
            ]
          },
          {
            id: "disc-3",
            title: "Hoca tercihleri skoru mu oyunu mu etkiliyor?",
            tag: "Maç Sonu",
            commentCount: 74,
            excerpt: "Değişiklik zamanlamaları, oyun planı ve maç içi reaksiyonlar üzerine tartışma.",
            comments: [
              { username: "analist_sinan", text: "Erken oyuncu değişiklikleri rakiplerin savunma kurgusunu bozmak için şart.", date: "1 gün önce", likes: 35 }
            ]
          },
          {
            id: "disc-4",
            title: "Genç oyunculara daha fazla süre verilmeli mi?",
            tag: "Altyapı",
            commentCount: 52,
            excerpt: "Potansiyel, baskı seviyesi ve maç ritmi açısından genç oyuncuların kullanımı.",
            comments: [
              { username: "akademi_sever", text: "Kesinlikle! Son yarım saat skor garantilendiğince gençlere şans verilmeli ki tecrübe kazansınlar.", date: "1 gün önce", likes: 41 }
            ]
          }
        ];
        
        // Try getting comments/topics from LocalStorage if available
        const storedTopics = localStorage.getItem('cms_discussion_topics');
        if (storedTopics) {
          setTopics(JSON.parse(storedTopics));
        } else {
          setTopics(initialTopics);
          localStorage.setItem('cms_discussion_topics', JSON.stringify(initialTopics));
        }

        // 4. Retrive voting status from localStorage to maintain persistence
        const votesFromStorage: { [id: string]: string } = {};
        allPolls.forEach(p => {
          const v = localStorage.getItem(`voted_poll_${p.id}`);
          if (v) votesFromStorage[p.id] = v;
        });
        const defaultV = localStorage.getItem(`voted_poll_poll-default`);
        if (defaultV) votesFromStorage['poll-default'] = defaultV;
        
        setVotedPolls(votesFromStorage);

        const vMatch = localStorage.getItem('voted_match_prediction');
        if (vMatch) setVotedMatchPredict(vMatch);

        const vPlayer = localStorage.getItem('voted_player_of_the_week');
        if (vPlayer) setVotedPlayerOfWeek(vPlayer);

        const vComment = localStorage.getItem('voted_featured_comment');
        if (vComment) setFeaturedCommentVote(vComment as any);

      } catch (err) {
        console.error("Taraftar Odası load error: ", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Poll Vote Handler
  const handlePollVote = async (pollId: string, option: string) => {
    if (votedPolls[pollId]) return; // Already voted

    // 1. Update local state
    const updatedPolls = polls.map(p => {
      if (p.id === pollId) {
        const uVotes = { ...p.votes, [option]: (p.votes[option] || 0) + 1 };
        return { ...p, votes: uVotes };
      }
      return p;
    });
    setPolls(updatedPolls);

    const targetPoll = updatedPolls.find(p => p.id === pollId);

    // 2. Save vote in storage
    localStorage.setItem(`voted_poll_${pollId}`, option);
    setVotedPolls(prev => ({ ...prev, [pollId]: option }));

    // 3. Upsert to DB if configured
    if (targetPoll) {
      try {
        await dbUpsertDocument('polls', pollId, {
          question: targetPoll.question,
          options: targetPoll.options,
          votes: targetPoll.votes,
          status: targetPoll.status
        });
      } catch (err) {
        console.warn("Could not save poll vote to cloud:", err);
      }
    }
  };

  // Match Prediction Vote Handler
  const handleMatchVote = (option: string) => {
    if (votedMatchPredict || !matchPrediction) return;

    const updatedVotes = {
      ...matchPrediction.votes,
      [option]: (matchPrediction.votes[option] || 0) + 1
    };

    setMatchPrediction({
      ...matchPrediction,
      votes: updatedVotes
    });

    localStorage.setItem('voted_match_prediction', option);
    setVotedMatchPredict(option);
  };

  // Player of the week Vote Handler
  const [playerVotes, setPlayerVotes] = useState<{ [opt: string]: number }>({
    "Dominik Livaković": 154,
    "Sebastian Szymański": 128,
    "Fred": 97,
    "Alexander Djiku": 62
  });

  const handlePlayerVote = (option: string) => {
    if (votedPlayerOfWeek) return;

    setPlayerVotes(prev => ({
      ...prev,
      [option]: (prev[option] || 0) + 1
    }));

    localStorage.setItem('voted_player_of_the_week', option);
    setVotedPlayerOfWeek(option);
  };

  // Featured Comment pulse
  const [featuredCommentStats, setFeaturedCommentStats] = useState({ likes: 243, agreeRate: 89, disagreeCount: 30 });
  const handleFeaturedVote = (type: 'agree' | 'disagree') => {
    if (featuredCommentVote) return;

    if (type === 'agree') {
      setFeaturedCommentStats(prev => ({
        ...prev,
        likes: prev.likes + 1,
        agreeRate: Math.round(((prev.likes + 1) / (prev.likes + prev.disagreeCount + 1)) * 100)
      }));
    } else {
      setFeaturedCommentStats(prev => ({
        ...prev,
        disagreeCount: prev.disagreeCount + 1,
        agreeRate: Math.round((prev.likes / (prev.likes + prev.disagreeCount + 1)) * 100)
      }));
    }
    localStorage.setItem('voted_featured_comment', type);
    setFeaturedCommentVote(type);
  };

  // Newsletter subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setNewsletterLoading(true);
    try {
      // Push to DB
      await dbAddDocument('newsletterSubscribers', {
        email: newsletterEmail.trim(),
        source: 'taraftar-odasi',
        subscribedAt: new Date().toISOString()
      });
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      // Fallback
      setNewsletterSubscribed(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Add Comment to Discussion Topic
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTopicId) return;

    const username = customCommentUser.trim() ? customCommentUser.trim() : "sarilacivert_katilimci";
    const newComment = {
      username: username.replace(/[^a-zA-Z0-9_]/g, ""),
      text: newCommentText.trim(),
      date: "Şimdi",
      likes: 0
    };

    const updatedTopics = topics.map(t => {
      if (t.id === activeTopicId) {
        return {
          ...t,
          commentCount: t.commentCount + 1,
          comments: [newComment, ...t.comments]
        };
      }
      return t;
    });

    setTopics(updatedTopics);
    localStorage.setItem('cms_discussion_topics', JSON.stringify(updatedTopics));
    setNewCommentText('');
    setCustomCommentUser('');
    setTopicToast("Görüşünüz başarıyla eklendi ve paylaşıldı!");
    setTimeout(() => setTopicToast(null), 3000);
  };

  // Helper calculation for percentages
  const getPercentage = (votes: { [opt: string]: number }, option: string): string => {
    const total = Object.values(votes).reduce((sum, curr) => (sum as number) + (curr as number), 0);
    if (total === 0) return '0%';
    const pct = Math.round(((votes[option] || 0) / total) * 100);
    return `${pct}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fb-dark">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-fb-yellow tracking-[0.2em] animate-pulse">TARAFTAR ODASI NABZI HESAPLANIYOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fb-dark text-slate-100 pb-20 overflow-hidden">
      <SEO 
        title="Taraftar Odası | Fenerbahçe Evreni"
        description="Fenerbahçe taraftar anketleri, maç tahminleri, haftanın soruları ve topluluk tartışmaları."
        canonical="https://fenerbahceevreni.com/taraftar-odasi"
      />
      
      {/* Background Ambience GLOWS */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-fb-yellow/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-10 w-[400px] h-[400px] rounded-full bg-fb-navy/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[600px] h-[600px] rounded-full bg-fb-navy/15 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:py-20 border-b border-white/[0.04]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow text-[10px] font-black tracking-widest uppercase">
              <Users size={12} />
              TARAFTAR ETKİLEŞİM PLATFORMU
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black text-white italic uppercase tracking-tight leading-none">
              TARAFTAR ODASI
            </h1>

            <p className="text-sm md:text-base text-fb-muted max-w-2xl mx-auto leading-relaxed">
              Maç tahminleri, haftanın soruları, taraftar anketleri ve Fenerbahçe gündemine dair ortak akıl burada.
            </p>

            {/* Subtitle Info Pills Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto pt-2">
              {[
                "Maç Tahmini",
                "Taraftar Anketleri",
                "Haftanın Sorusu",
                "Maçın Oyuncusu",
                "Tartışma Başlıkları",
                "Topluluk"
              ].map((pill, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-wider transition-colors hover:border-fb-yellow/30 select-none"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Stats Strip */}
      <section className="py-6 bg-fb-card/40 border-b border-white/[0.04]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Aktif Anket", value: communityStats.activePolls },
              { label: "Bu Hafta Oy", value: communityStats.weeklyVotes.toLocaleString() },
              { label: "Haftanın Sorusu", value: communityStats.weeklyQuestion },
              { label: "Taraftar Yorumu", value: communityStats.fanComments }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-fb-card/90 border border-white/5 flex flex-col justify-center items-center">
                <span className="text-[10px] font-black uppercase text-fb-muted tracking-widest">{stat.label}</span>
                <span className="text-2xl font-display font-black text-fb-yellow italic block mt-1">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container Grid */}
      <div className="container mx-auto px-6 max-w-6xl mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT & CENTER PARTS: Interactive Cards & Topics */}
          <div className="lg:col-span-2 space-y-10 text-left">
            
            {/* 3. Main Poll Section */}
            <div className="p-6 md:p-8 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-fb-yellow bg-fb-yellow/10 uppercase rounded-bl-xl tracking-widest border-l border-b border-fb-yellow/10">
                HAFTANIN ANKETİ
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020] block mb-1">
                    Ortak Akıl Anketi
                  </span>
                  <p className="text-xs text-fb-muted font-bold block mb-4">
                    Görüşünüzü yansıtın, genel eğilimi anında görün.
                  </p>
                </div>

                {polls.map((poll) => {
                  const hasVoted = !!votedPolls[poll.id];
                  return (
                    <div key={poll.id} className="space-y-5">
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        {poll.question}
                      </h4>

                      <div className="space-y-3">
                        {poll.options.map((option, idx) => {
                          const percentage = getPercentage(poll.votes, option);
                          const isSelected = votedPolls[poll.id] === option;
                          const voteCount = poll.votes[option] || 0;

                          return (
                            <div key={idx} className="relative">
                              {hasVoted ? (
                                // VOTED STATE / RESULT GRAPHIC
                                <div className={`relative p-3.5 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all overflow-hidden ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.02]/30'}`}>
                                  {/* Dynamic progress fill */}
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: percentage }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`absolute left-0 top-0 bottom-0 z-0 opacity-15 ${isSelected ? 'bg-fb-yellow' : 'bg-fb-muted'}`}
                                  />
                                  <span className="relative z-10 text-slate-100 flex items-center gap-2">
                                    {option}
                                    {isSelected && <CheckCircle size={12} className="text-fb-yellow" />}
                                  </span>
                                  <span className="relative z-10 font-mono font-black text-fb-yellow">
                                    {percentage} <span className="text-[10px] text-slate-400 font-bold ml-1">({voteCount} Oy)</span>
                                  </span>
                                </div>
                              ) : (
                                // ACTIVE STATE / CLICKABLE OPTION
                                <button
                                  onClick={() => handlePollVote(poll.id, option)}
                                  className="w-full text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02]/50 hover:border-fb-yellow/30 hover:bg-white/[0.04] text-xs font-bold transition-all text-slate-300 hover:text-white flex items-center justify-between group"
                                >
                                  <span>{option}</span>
                                  <span className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-fb-yellow flex items-center justify-center text-[10px] text-fb-yellow shrink-0 font-display">
                                    →
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-[10px] text-fb-muted font-bold">
                        <span>Toplam Oy: {Object.values(poll.votes).reduce((a, b) => (a as number) + (b as number), 0).toLocaleString()}</span>
                        {hasVoted && (
                          <span className="text-fb-yellow">Tercihiniz Kaydedildi ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Match Prediction Card */}
            {matchPrediction && (
              <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-[9px] font-black text-white bg-fb-navy uppercase rounded-bl-xl tracking-widest border-l border-b border-white/10">
                  SKOR TAHMİN AKLI
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020]">
                      YAKLAŞAN MAÇ TAHMİNİ
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-fb-dark/80 border border-white/5">
                    <span className="text-xs font-black text-white tracking-tight">Fenerbahçe</span>
                    <span className="text-xs font-black text-fb-yellow italic font-mono uppercase tracking-widest">VS</span>
                    <span className="text-xs font-black text-slate-300 tracking-tight">{matchPrediction.awayTeam}</span>
                  </div>

                  <p className="text-sm font-bold text-slate-100 mt-2">
                    {matchPrediction.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {matchPrediction.options.map((option, idx) => {
                      const percentage = getPercentage(matchPrediction.votes, option);
                      const isSelected = votedMatchPredict === option;

                      return (
                        <div key={idx} className="relative">
                          {votedMatchPredict ? (
                            <div className={`p-3 rounded-xl border text-xs text-center font-semibold transition-all flex flex-col justify-center items-center h-20 ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.01]'}`}>
                              <span className="text-fb-muted text-[10px] block mb-1">{option}</span>
                              <span className="text-base font-black text-fb-yellow font-mono">{percentage}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMatchVote(option)}
                              className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02]/30 hover:border-fb-yellow/30 hover:bg-white/[0.04] text-xs font-black text-slate-300 hover:text-white transition-all text-center h-20 flex flex-col justify-center items-center gap-1 group"
                            >
                              <span>{option}</span>
                              <span className="text-[9px] text-fb-muted font-bold group-hover:text-fb-yellow uppercase">TAHMİN ET</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub metrics inside card */}
                  <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-fb-dark/50">
                      <span className="text-[10px] font-black uppercase text-fb-muted block">En Çok Beklenen Skor</span>
                      <span className="text-base font-black text-white font-mono">{matchPrediction.expectedScore}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-fb-dark/50">
                      <span className="text-[10px] font-black uppercase text-fb-muted block">Taraftar Güven Puanı</span>
                      <span className="text-base font-black text-fb-accent font-mono">{matchPrediction.confidenceScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Match Man of the Week */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] overflow-hidden">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020] block mb-1">
                Tribün Seçimi
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mb-4">
                Haftanın Oyuncusu Kimdi?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(playerVotes).map((option, idx) => {
                  const percentage = getPercentage(playerVotes, option);
                  const isSelected = votedPlayerOfWeek === option;
                  const count = playerVotes[option];

                  return (
                    <div key={idx} className="relative">
                      {votedPlayerOfWeek ? (
                        <div className={`p-4 rounded-xl border text-xs font-semibold flex flex-col justify-center gap-1.5 transition-all overflow-hidden ${isSelected ? 'border-fb-yellow/40 bg-fb-yellow/5' : 'border-white/5 bg-white/[0.01]'}`}>
                          <div className="flex justify-between items-center relative z-10">
                            <span className="text-slate-100 font-bold">{option}</span>
                            <span className="font-mono text-fb-yellow text-sm font-black">{percentage}</span>
                          </div>
                          {/* Inner bar */}
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: percentage }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full ${isSelected ? 'bg-fb-yellow' : 'bg-slate-500'}`}
                            />
                          </div>
                          <span className="text-[10px] text-fb-muted font-bold block self-end">{count} Oy</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePlayerVote(option)}
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-fb-yellow/30 hover:bg-white/[0.03] text-xs font-bold transition-all text-slate-300 hover:text-white flex justify-between items-center group"
                        >
                          <span>{option}</span>
                          <span className="px-2.5 py-1 rounded bg-white/5 text-[9px] font-black uppercase text-fb-muted group-hover:bg-fb-yellow group-hover:text-fb-navy transition-colors">
                            TERCİH ET
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Discussion Topics Section */}
            <div id="discuss-list" className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-white/[0.05] pb-3">
                <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight">
                  TARTIŞMA BAŞLIKLARI
                </h3>
                <span className="text-xs text-fb-muted font-bold">Popüler Tartışmalar</span>
              </div>

              {/* Discussion detail view toggler */}
              <AnimatePresence mode="wait">
                {activeTopicId ? (
                  /* TOPIC CHAT ROOM PANEL */
                  (() => {
                    const activeTopic = topics.find(t => t.id === activeTopicId);
                    if (!activeTopic) return null;

                    return (
                      <motion.div 
                        key="active-topic"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="p-6 rounded-2xl bg-fb-card border border-fb-yellow/20 space-y-6 relative"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] font-black uppercase text-fb-yellow tracking-wider">
                            {activeTopic.tag}
                          </span>
                          <button
                            onClick={() => setActiveTopicId(null)}
                            className="text-xs text-fb-muted hover:text-white font-bold underline"
                          >
                            Tüm Konulara Dön
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xl font-black text-white leading-tight">
                            {activeTopic.title}
                          </h4>
                          <p className="text-xs text-fb-muted mt-2 leading-relaxed font-semibold">
                            {activeTopic.excerpt}
                          </p>
                        </div>

                        {/* Interactive commenting feed */}
                        <div className="space-y-3.5 border-t border-b border-white/5 py-6">
                          <span className="text-[10px] tracking-widest uppercase font-black text-fb-muted block mb-2">Canlı Katılımlar ({activeTopic.commentCount})</span>
                          
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 space-y-3">
                            {activeTopic.comments.map((comm, cIdx) => (
                              <div key={cIdx} className="p-4 rounded-xl bg-fb-dark/80 border border-white/5 text-left space-y-2">
                                <div className="flex justify-between items-baseline">
                                  <span className="font-black text-xs text-fb-yellow">@{comm.username}</span>
                                  <span className="text-[9px] text-[#A2B1CC] font-bold">{comm.date}</span>
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-semibold">"{comm.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comment insertion Form */}
                        <form onSubmit={handleAddComment} className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              required
                              value={customCommentUser}
                              onChange={(e) => setCustomCommentUser(e.target.value)}
                              placeholder="Kullanıcı adınız (opsiyonel)"
                              className="w-full sm:w-1/3 px-4 py-3 rounded-lg bg-fb-dark/95 border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow font-bold"
                            />
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                required
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Görüşünü buraya ekle..."
                                className="w-full px-4 py-3 rounded-lg bg-fb-dark/95 border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none focus:border-fb-yellow"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-5 py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Send size={12} />
                              GÖNDER
                            </button>
                          </div>
                        </form>

                        {/* TODO comment requested by requirements for discussion system */}
                        {/* TODO: Connect comment posting directly to Firestore comments collection in production */}

                        {topicToast && (
                          <div className="text-xs text-fb-accent font-black text-center mt-2 animate-bounce">
                            {topicToast}
                          </div>
                        )}
                      </motion.div>
                    );
                  })()
                ) : (
                  /* TOPIC TILES LIST */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((top) => (
                      <motion.div
                        key={top.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-5 rounded-xl bg-fb-card border border-white/[0.06] hover:border-fb-yellow/20 flex flex-col justify-between transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-fb-yellow">
                            <span className="px-2 py-0.5 rounded bg-white/5 tracking-wider border border-white/5">{top.tag}</span>
                            <span className="text-fb-muted font-mono">{top.commentCount} yorum</span>
                          </div>
                          <h4 className="text-sm font-bold text-white tracking-tight line-clamp-2">
                            {top.title}
                          </h4>
                          <p className="text-xs text-fb-muted leading-relaxed line-clamp-3">
                            {top.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/[0.05]">
                          <button
                            onClick={() => setActiveTopicId(top.id)}
                            className="w-full py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-fb-yellow hover:text-fb-navy transition-all font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageSquare size={12} />
                            Tartışmaya Katıl
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Featured comments, fan pulse, guidelines, and newsletter CTA */}
          <div className="space-y-8 text-left">
            
            {/* 7. Featured Fan Comment */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] bg-gradient-to-b from-fb-card to-fb-navy/30 relative">
              <span className="absolute top-2 right-2 text-3xl font-display font-black text-fb-yellow/15 leading-none select-none">“</span>
              
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020] block mb-1">
                HAFTANIN TARAFTAR YORUMU
              </span>
              
              <div className="space-y-4 pt-1">
                <p className="text-xs text-slate-100 italic leading-relaxed font-bold">
                  “Bence sorun sadece oyuncu kalitesi değil, oyun temposunun belli bölümlerde kopması. İlk 20 dakikadaki baskı sürdürülebilirse bu takım çok daha dominant görünebilir.”
                </p>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-fb-yellow flex items-center justify-center font-black text-[10px] text-fb-navy">
                    FE
                  </div>
                  <span className="text-[10px] text-fb-muted font-black uppercase">
                    Bir Fenerbahçe Evreni takipçisi
                  </span>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex justify-between items-center text-[10px] text-fb-muted font-bold">
                  <span>👍 {featuredCommentStats.likes} Hak Verildi</span>
                  <span className="text-fb-accent">Katılıyorum: {featuredCommentStats.agreeRate}%</span>
                </div>

                {/* Agree Button Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={!!featuredCommentVote}
                    onClick={() => handleFeaturedVote('agree')}
                    className={`py-2 rounded px-2 text-[10px] font-black uppercase tracking-wider text-center transition-all ${featuredCommentVote === 'agree' ? 'bg-fb-accent/20 text-fb-accent border border-fb-accent/20' : featuredCommentVote ? 'opacity-30 border border-white/5' : 'bg-white/5 text-slate-300 hover:bg-fb-accent hover:text-fb-navy'}`}
                  >
                    KATILIYORUM
                  </button>
                  <button
                    disabled={!!featuredCommentVote}
                    onClick={() => handleFeaturedVote('disagree')}
                    className={`py-2 rounded px-2 text-[10px] font-black uppercase tracking-wider text-center transition-all ${featuredCommentVote === 'disagree' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : featuredCommentVote ? 'opacity-30 border border-white/5' : 'bg-white/5 text-slate-300 hover:bg-red-500 hover:text-white'}`}
                  >
                    KATILMIYORUM
                  </button>
                </div>
              </div>
            </div>

            {/* 8. Fan Pulse Section */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB020] block mb-1">
                TARAFTARIN NABZI
              </span>
              
              <div className="space-y-3 pt-1">
                {[
                  { title: "Takıma Güven", value: "7.4 / 10", trend: "yükseliyor" },
                  { title: "Hoca Tercihleri", value: "6.2 / 10", trend: "tartışmalı" },
                  { title: "Transfer Beklentisi", value: "8.1 / 10", trend: "yüksek" },
                  { title: "Şampiyonluk İnancı", value: "7.8 / 10", trend: "güçlü" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-fb-dark/80 border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{item.title}</span>
                      <span className="text-xs font-black text-fb-yellow font-mono">{item.value}</span>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider ${item.trend === 'yükseliyor' || item.trend === 'güçlü' || item.trend === 'yüksek' ? 'bg-fb-accent/10 border border-fb-accent/20 text-fb-accent' : 'bg-fb-warning/10 border border-fb-warning/20 text-fb-warning'}`}>
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Community Guidelines */}
            <div className="p-6 rounded-2xl bg-fb-card border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FFB020]" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white block">
                  TARAFTAR ODASI KURALLARI
                </span>
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                  Burada fikirler sert olabilir ama saygı çizgisi korunur. Hakaret, nefret söylemi, hedef gösterme ve spam içerikler kabul edilmez.
                </p>
                
                <ul className="space-y-2 pt-2 border-t border-white/[0.05]">
                  {[
                    "Fikir özgür, hakaret yok.",
                    "Eleştiri serbest, kişisel saldırı yok.",
                    "Kaynaklı bilgi değerlidir.",
                    "Tartışma seviyeli kalmalı."
                  ].map((rule, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs text-slate-300 font-bold">
                      <span className="text-fb-yellow shrink-0 font-black">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 10. Join Community CTA & 11. Newsletter Signup */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-fb-card to-fb-navy/40 border border-[#FFB020]/25 space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fb-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF001F] text-fb-yellow">BÜLTEN KATILIMI</span>
              </div>
              
              <h4 className="text-base font-black text-white italic uppercase tracking-tight leading-snug">
                Fenerbahçe Evreni topluluğuna katıl
              </h4>
              
              <p className="text-xs text-fb-muted leading-relaxed font-semibold">
                Anketlere katıl, maç tahminlerini paylaş, haftalık bültene abone ol ve özel analizlerden haberdar ol.
              </p>

              {newsletterSubscribed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-fb-accent/10 border border-fb-accent/20 text-fb-accent text-xs font-black text-center"
                >
                  Girişiniz alındı! Topluluk bültenine hoş geldiniz. ✓
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="E-posta adresin..."
                      className="w-full px-4 py-3 rounded-xl bg-fb-dark border border-white/10 text-xs focus:outline-none focus:border-fb-yellow text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>KATIL</span>
                    <ArrowRight size={12} />
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* 
        12. FUTURE COMMUNITY SYSTEM PLACEHOLDER (DEVELOPER COMMENT BLOCK ONLY) 
        Future Collections Schema:
        - comments => { id: string, discussionId: string, authorName: string, text: string, likes: number, createdAt: string }
        - discussionTopics => { id: string, title: string, category: string, replies: number, description: string, votes: number }
        - fanPredictions => { matchId: string, uid: string, predictedWinner: string, predictedScore: string, createdAt: string }
        - userProfiles => { uid: string, username: string, levelBadge: string, points: number }
        - communityVotes => { pollId: string, userId: string, selectedOption: string, votedAt: string }

        Future Features & Engineering Path:
        - Native Authenticated User flows utilizing Firebase Auth.
        - Direct real-time listener binding payload query for active matches and predictions leaderboard scoring.
        - Automated fan predictions badge achievements system.
      */}

    </div>
  );
};
