import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  Play, 
  CheckCircle,
  Clock,
  Briefcase,
  Sliders,

  Star,
  Tv,
  Users2,
  Tv2,
  Activity,
  Award
} from 'lucide-react';
import { dbGetCollection, dbUpsertDocument, dbAddDocument, dbDeleteDocument } from '../../lib/dbService';
import { DeleteConfirmModal, EmptyState, StatusBadge } from './AdminCommon';
import { formatDate } from '../../lib/adminHelpers';

interface AdminMatchesProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initiateCreate?: boolean;
}

export const AdminMatches: React.FC<AdminMatchesProps> = ({ showToast, initiateCreate }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Modal actions
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [simInterval, setSimInterval] = useState<any>(null);

  const [form, setForm] = useState({
    homeTeam: 'Fenerbahçe',
    awayTeam: '',
    competition: 'Trendyol Süper Lig • 36. Hafta',
    matchDate: '2026-05-30T20:00:00',
    venue: 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy',
    status: 'upcoming', // upcoming, live, completed
    scoreHome: 0,
    scoreAway: 0,
    matchPreview: '',
    featured: false,
    
    // Spec fields
    referee: 'Halil Umut Meler',
    broadcasterTarget: 'beIN Sports 1',
    scorerDetailsHome: 'Edin Džeko 12\', Dušan Tadić 55\'(P)',
    scorerDetailsAway: 'Mauro Icardi 33\'',
    cardsDetails: 'Djiku 44\'(Y), Fred 89\'(Y) • Muslera 80\'(Y)',
    substitutionDetails: 'Edin Džeko ➔ Youssef En-Nesyri (75\'), İrfan Can Kahveci ➔ Cengiz Ünder (82\')',
    
    // Analytics inputs
    possessionHome: 55,
    possessionAway: 45,
    shotsHome: 14,
    shotsAway: 8,
    shotsOnTargetHome: 6,
    shotsOnTargetAway: 3,
    passAccuracyHome: 84,
    passAccuracyAway: 78,
    cornersHome: 5,
    cornersAway: 2,
    foulsHome: 12,
    foulsAway: 15,

    // Lineups
    formation: '4-2-3-1',
    GK: 'Dominik Livaković',
    RB: 'Bright Osayi-Samuel',
    CB1: 'Alexander Djiku',
    CB2: 'Çağlar Söyüncü',
    LB: 'Jayden Oosterwolde',
    DM1: 'İsmail Yüksek',
    DM2: 'Fred',
    RW: 'İrfan Can Kahveci',
    AM: 'Sebastian Szymański',
    LW: 'Dušan Tadić',
    CF: 'Edin Džeko'
  });

  const loadData = async () => {
    setLoading(true);
    const list = await dbGetCollection('matches');
    const teamsList = await dbGetCollection('teams');
    setMatches(list);
    setTeams(teamsList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, []);

  useEffect(() => {
    if (initiateCreate && !formOpen) {
      openNew();
    }
  }, [initiateCreate]);

  const handleCloseFormAttempt = () => {
    if (isDirty) {
      const leave = window.confirm("Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?");
      if (!leave) return;
    }
    setFormOpen(false);
    setEditingId(null);
    setIsDirty(false);
  };

  const handleFormChange = (field: string, val: any) => {
    setIsDirty(true);
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const startSimulation = (matchId: string) => {
    if (simulationActive) {
      clearInterval(simInterval);
      setSimulationActive(false);
      if (showToast) showToast("Canlı maç simülasyonu durduruldu.", "info");
      return;
    }

    setSimulationActive(true);
    if (showToast) showToast("Canlı simülasyon modu devrede: Skorlar ve istatistikler rastgele güncellenecek!", "success");

    const timer = setInterval(async () => {
      // Fetch latest matches state
      const freshList = await dbGetCollection('matches');
      const targetMatch = freshList.find((m: any) => m.id === matchId);
      if (!targetMatch || targetMatch.status !== 'live') {
        clearInterval(timer);
        setSimulationActive(false);
        return;
      }

      // Roll chance for goal
      const roll = Math.random();
      let newScoreHome = targetMatch.scoreHome || 0;
      let newScoreAway = targetMatch.scoreAway || 0;
      let freshScorers = targetMatch.scorerDetailsHome || '';
      let randomMin = Math.floor(Math.random() * 45) + 45;

      if (roll > 0.8) {
        newScoreHome += 1;
        freshScorers = freshScorers ? `${freshScorers}, Oyuncu ${randomMin}'` : `Oyuncu ${randomMin}'`;
        if (showToast) showToast(`GOL SİMÜLASYONU! Fenerbahçe golü buldu: ${newScoreHome} - ${newScoreAway}`, "success");
      } else if (roll > 0.95) {
        newScoreAway += 1;
        if (showToast) showToast(`GOL SİMÜLASYONU! Rakip gol attı: ${newScoreHome} - ${newScoreAway}`, "info");
      }

      // Slightly mutate stats
      const dynamicHomeShots = (targetMatch.shotsHome || 10) + Math.floor(Math.random() * 2);
      const dynamicAwayShots = (targetMatch.shotsAway || 6) + Math.floor(Math.random() * 2);
      const dynamicHomePoss = Math.min(70, Math.max(30, (targetMatch.possessionHome || 50) + (Math.random() > 0.5 ? 2 : -2)));
      const dynamicAwayPoss = 100 - dynamicHomePoss;

      const dynamicUpdate = {
        ...targetMatch,
        scoreHome: newScoreHome,
        scoreAway: newScoreAway,
        shotsHome: dynamicHomeShots,
        shotsAway: dynamicAwayShots,
        possessionHome: dynamicHomePoss,
        possessionAway: dynamicAwayPoss,
        scorerDetailsHome: freshScorers,
        updatedAt: new Date().toISOString()
      };

      await dbUpsertDocument('matches', matchId, dynamicUpdate);
      loadData();
    }, 5000);

    setSimInterval(timer);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.awayTeam) {
      alert("Lütfen rakip takım adını giriniz.");
      return;
    }

    const compiledData = {
      ...form,
      scoreHome: Number(form.scoreHome),
      scoreAway: Number(form.scoreAway),
      possessionHome: Number(form.possessionHome),
      possessionAway: Number(form.possessionAway),
      shotsHome: Number(form.shotsHome),
      shotsAway: Number(form.shotsAway),
      shotsOnTargetHome: Number(form.shotsOnTargetHome),
      shotsOnTargetAway: Number(form.shotsOnTargetAway),
      passAccuracyHome: Number(form.passAccuracyHome),
      passAccuracyAway: Number(form.passAccuracyAway),
      cornersHome: Number(form.cornersHome),
      cornersAway: Number(form.cornersAway),
      foulsHome: Number(form.foulsHome),
      foulsAway: Number(form.foulsAway),
      featured: !!form.featured,
      probableXI: {
        formation: form.formation,
        GK: form.GK,
        RB: form.RB,
        CB1: form.CB1,
        CB2: form.CB2,
        LB: form.LB,
        DM1: form.DM1,
        DM2: form.DM2,
        RW: form.RW,
        AM: form.AM,
        LW: form.LW,
        CF: form.CF
      },
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await dbUpsertDocument('matches', editingId, compiledData);
        if (showToast) showToast("Maç detayları, kartlar, istatistikler ve taktik kadro kaydedildi.", "success");
      } else {
        await dbAddDocument('matches', {
          ...compiledData,
          id: `match-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        });
        if (showToast) showToast("Yeni maç fikstürü başarıyla eklendi.", "success");
      }

      setFormOpen(false);
      setEditingId(null);
      setIsDirty(false);
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Maç kaydedilirken hata oluştur.", "error");
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    const xi = m.probableXI || {};
    setForm({
      homeTeam: m.homeTeam || 'Fenerbahçe',
      awayTeam: m.awayTeam || '',
      competition: m.competition || 'Trendyol Süper Lig • 36. Hafta',
      matchDate: m.matchDate || '2026-05-30T20:00:00',
      venue: m.venue || 'Ülker Stadyumu Kadıköy',
      status: m.status || 'upcoming',
      scoreHome: m.scoreHome || 0,
      scoreAway: m.scoreAway || 0,
      matchPreview: m.matchPreview || '',
      featured: !!m.featured,
      
      referee: m.referee || 'Halil Umut Meler',
      broadcasterTarget: m.broadcasterTarget || 'beIN Sports 1',
      scorerDetailsHome: m.scorerDetailsHome || '',
      scorerDetailsAway: m.scorerDetailsAway || '',
      cardsDetails: m.cardsDetails || '',
      substitutionDetails: m.substitutionDetails || '',
      
      possessionHome: m.possessionHome || 50,
      possessionAway: m.possessionAway || 50,
      shotsHome: m.shotsHome || 10,
      shotsAway: m.shotsAway || 6,
      shotsOnTargetHome: m.shotsOnTargetHome || 4,
      shotsOnTargetAway: m.shotsOnTargetAway || 2,
      passAccuracyHome: m.passAccuracyHome || 80,
      passAccuracyAway: m.passAccuracyAway || 75,
      cornersHome: m.cornersHome || 4,
      cornersAway: m.cornersAway || 2,
      foulsHome: m.foulsHome || 10,
      foulsAway: m.foulsAway || 11,

      formation: xi.formation || '4-2-3-1',
      GK: xi.GK || 'Dominik Livaković',
      RB: xi.RB || 'Bright Osayi-Samuel',
      CB1: xi.CB1 || 'Alexander Djiku',
      CB2: xi.CB2 || 'Çağlar Söyüncü',
      LB: xi.LB || 'Jayden Oosterwolde',
      DM1: xi.DM1 || 'İsmail Yüksek',
      DM2: xi.DM2 || 'Fred',
      RW: xi.RW || 'İrfan Can Kahveci',
      AM: xi.AM || 'Sebastian Szymański',
      LW: xi.LW || 'Dušan Tadić',
      CF: xi.CF || 'Edin Džeko'
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      homeTeam: 'Fenerbahçe',
      awayTeam: '',
      competition: 'Trendyol Süper Lig • Hafta Seçin',
      matchDate: '2026-05-30T20:00:00',
      venue: 'Ülker Stadyumu Şükrü Saracoğlu Spor Kompleksi / Kadıköy',
      status: 'upcoming',
      scoreHome: 0,
      scoreAway: 0,
      matchPreview: '',
      featured: false,
      referee: 'Halil Umut Meler',
      broadcasterTarget: 'beIN Sports 1',
      scorerDetailsHome: '',
      scorerDetailsAway: '',
      cardsDetails: '',
      substitutionDetails: '',
      possessionHome: 50,
      possessionAway: 50,
      shotsHome: 10,
      shotsAway: 6,
      shotsOnTargetHome: 4,
      shotsOnTargetAway: 2,
      passAccuracyHome: 80,
      passAccuracyAway: 75,
      cornersHome: 4,
      cornersAway: 2,
      foulsHome: 10,
      foulsAway: 11,
      formation: '4-2-3-1',
      GK: 'Dominik Livaković',
      RB: 'Bright Osayi-Samuel',
      CB1: 'Alexander Djiku',
      CB2: 'Çağlar Söyüncü',
      LB: 'Jayden Oosterwolde',
      DM1: 'İsmail Yüksek',
      DM2: 'Fred',
      RW: 'İrfan Can Kahveci',
      AM: 'Sebastian Szymański',
      LW: 'Dušan Tadić',
      CF: 'Edin Džeko'
    });
    setFormOpen(true);
    setIsDirty(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await dbDeleteDocument('matches', deleteId);
      if (showToast) showToast("Müsabaka fikstürü sistemden silindi.", "success");
      loadData();
    } catch (err) {
      console.error(err);
      if (showToast) showToast("Silme işlemi gerçekleşemedi.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleFeatured = async (matchItem: any) => {
    const nextFeatured = !matchItem.featured;
    try {
      await dbUpsertDocument('matches', matchItem.id, { featured: nextFeatured });
      if (showToast) showToast(nextFeatured ? "Karşılaşma öne çıkarıldı." : "Müsabaka öne çıkarılması kaldırıldı.", "success");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = matches.filter(m => {
    const matchesSearch = m.awayTeam?.toLowerCase().includes(search.toLowerCase()) || 
                          m.homeTeam?.toLowerCase().includes(search.toLowerCase()) ||
                          m.competition?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
            <Calendar className="text-fb-yellow" size={20} /> Maç Merkezi & Fikstür CMS
          </h2>
          <p className="text-xs text-[#8e9bb8]">Fikstürleri, hakemleri, yayın kanallarını, kart panolarını, canlı simülasyonları ve maç içi d3 analitiğini yönetin.</p>
        </div>
        {!formOpen && (
          <button
            onClick={openNew}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Yeni Karşılaşma Ekle
          </button>
        )}
      </div>

      {formOpen ? (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-fb-card border border-white/[0.08] space-y-6 text-left"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-fb-yellow">
              {editingId ? 'MÜSABAKA VE SEVK DETAYI GÜNCELLE' : 'YENİ KARŞILAŞMA VE ANALİZ EKLE'}
            </h3>
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LHS: Match details */}
            <div className="space-y-5">
              <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block pb-1 border-b border-white/5">1. KARŞILAŞMA VE KANAL / HAKEM BİLGİLERİ</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Ev Sahibi Takım *</label>
                  <select
                    value={form.homeTeam}
                    onChange={(e) => handleFormChange('homeTeam', e.target.value)}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="Fenerbahçe">Fenerbahçe</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Deplasman Takım *</label>
                  <select
                    value={form.awayTeam}
                    onChange={(e) => handleFormChange('awayTeam', e.target.value)}
                    className="px-3 py-2.5 bg-fb-dark border border-white/10 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="">-- Rakip Seçin --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Turnuva / Lig Seviyesi</label>
                  <input
                    type="text"
                    value={form.competition}
                    onChange={(e) => handleFormChange('competition', e.target.value)}
                    placeholder="Örn: Trendyol Süper Lig • 36. Hafta"
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Tarihi ve Saati</label>
                  <input
                    type="datetime-local"
                    value={form.matchDate}
                    onChange={(e) => handleFormChange('matchDate', e.target.value)}
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Tv size={11} className="text-fb-yellow" /> Yayınlayacak Kanal
                  </label>
                  <input
                    type="text"
                    value={form.broadcasterTarget}
                    onChange={(e) => handleFormChange('broadcasterTarget', e.target.value)}
                    placeholder="beIN Sports 1, Exxen, TRT Spor"
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Hakem</label>
                  <input
                    type="text"
                    value={form.referee}
                    onChange={(e) => handleFormChange('referee', e.target.value)}
                    placeholder="Örn: Halil Umut Meler"
                    className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Stadyum / Yerleşke</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => handleFormChange('venue', e.target.value)}
                  className="px-4 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-fb-dark/30 border border-white/5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Durumu</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="px-2 py-2.5 bg-fb-dark border border-white/15 rounded-lg text-xs text-white [&>option]:bg-fb-card cursor-pointer"
                    >
                      <option value="upcoming">Gelecek Maç (Yet to play)</option>
                      <option value="live">Canlı Oynanıyor (Live)</option>
                      <option value="completed">Eski Maç / Bitti (Ended)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Ev Sahibi Skor</label>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreHome}
                      onChange={(e) => handleFormChange('scoreHome', Number(e.target.value))}
                      className="px-2 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white font-bold font-mono text-center"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Deplasman Skor</label>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreAway}
                      onChange={(e) => handleFormChange('scoreAway', Number(e.target.value))}
                      className="px-2 py-2 bg-fb-dark border border-white/15 rounded-lg text-xs text-white font-bold font-mono text-center"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                    className="w-4 h-4 accent-fb-yellow cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-white block">HAFTANIN EN ÖNEMLİ MAÇI</span>
                    <span className="text-[10px] text-[#8e9bb8] font-semibold">Maç merkezi sayfasında en üst kısma dev banner olarak kilitler.</span>
                  </div>
                </label>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-fb-dark/50 border border-white/5">
                <span className="text-[9px] font-black text-fb-yellow uppercase tracking-widest block">GOL / OYUN AYRINTILARI PLAKALARI</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Golü Atanlar (Ev Sahibi)</label>
                    <input
                      type="text"
                      value={form.scorerDetailsHome}
                      onChange={(e) => handleFormChange('scorerDetailsHome', e.target.value)}
                      placeholder="Örn: Edin Džeko 12', Fred 80'"
                      className="px-4 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Golü Atanlar (Deplasman)</label>
                    <input
                      type="text"
                      value={form.scorerDetailsAway}
                      onChange={(e) => handleFormChange('scorerDetailsAway', e.target.value)}
                      placeholder="Örn: İcardi 45'"
                      className="px-4 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Kart Görenler (Y/K)</label>
                  <input
                    type="text"
                    value={form.cardsDetails}
                    onChange={(e) => handleFormChange('cardsDetails', e.target.value)}
                    placeholder="Djiku 45'(Y), Muslera 92'(K) gibi..."
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Oyuncu Değişiklikleri Panosu (Substitution Board)</label>
                  <input
                    type="text"
                    value={form.substitutionDetails}
                    onChange={(e) => handleFormChange('substitutionDetails', e.target.value)}
                    placeholder="Dzeko ➔ En-Nesyri 75' gibi..."
                    className="px-4 py-2 bg-fb-dark border border-white/10 rounded-lg text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Maç Önü Analiz ve Taktik Köşesi</label>
                <textarea
                  value={form.matchPreview}
                  onChange={(e) => handleFormChange('matchPreview', e.target.value)}
                  rows={4}
                  placeholder="Kritik taktiksel planlar, rakibin zayıf yönleri ve eksik oyuncu listeleri..."
                  className="px-4 py-3 bg-fb-dark border border-white/15 rounded-xl text-xs text-slate-300 leading-relaxed focus:outline-none"
                />
              </div>
            </div>

            {/* RHS: Kadrolar (Lineups) & Analitik Grafikleri */}
            <div className="space-y-5">
              <span className="text-[10px] font-black text-fb-yellow tracking-widest uppercase block pb-1 border-b border-white/5">2. TAKTİK DİZİLİŞ & İSTATİSTİK ANALİTİKLERİ</span>

              {/* Analitik Grafikler Giriş Alanı */}
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-fb-yellow/10 space-y-3">
                <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase block">D3 VE RECHARTS MAÇ ANALİTİĞİ APARATI</span>
                
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Topa Sahip Olma (Ev Sahibi %)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={form.possessionHome} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleFormChange('possessionHome', val);
                        handleFormChange('possessionAway', 100 - val);
                      }} 
                      className="bg-fb-card text-xs text-white p-2 rounded border border-white/10 font-bold text-center" 
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Topa Sahip Olma (Deplasman %)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100"
                      value={form.possessionAway} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleFormChange('possessionAway', val);
                        handleFormChange('possessionHome', 100 - val);
                      }} 
                      className="bg-fb-card text-xs text-slate-400 p-2 rounded border border-white/5 text-center" 
                    />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Şut (Ev / Deplasman)</label>
                    <div className="flex gap-1">
                      <input type="number" placeholder="Ev" value={form.shotsHome} onChange={(e) => handleFormChange('shotsHome', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                      <input type="number" placeholder="Dep" value={form.shotsAway} onChange={(e) => handleFormChange('shotsAway', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Kaleyi Bulan Şut (Ev / Dep)</label>
                    <div className="flex gap-1">
                      <input type="number" placeholder="Ev" value={form.shotsOnTargetHome} onChange={(e) => handleFormChange('shotsOnTargetHome', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                      <input type="number" placeholder="Dep" value={form.shotsOnTargetAway} onChange={(e) => handleFormChange('shotsOnTargetAway', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Pas Başarı Oranı (Ev / Dep %)</label>
                    <div className="flex gap-1">
                      <input type="number" placeholder="Ev%" value={form.passAccuracyHome} onChange={(e) => handleFormChange('passAccuracyHome', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                      <input type="number" placeholder="Dep%" value={form.passAccuracyAway} onChange={(e) => handleFormChange('passAccuracyAway', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] text-fb-muted">Köşe Vuruşu / Korner (Ev / Dep)</label>
                    <div className="flex gap-1">
                      <input type="number" placeholder="Ev" value={form.cornersHome} onChange={(e) => handleFormChange('cornersHome', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                      <input type="number" placeholder="Dep" value={form.cornersAway} onChange={(e) => handleFormChange('cornersAway', Number(e.target.value))} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 text-center w-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Saha Formasyonu (Taktik Şablonu)</label>
                <select
                  value={form.formation}
                  onChange={(e) => handleFormChange('formation', e.target.value)}
                  className="px-3 py-2.5 bg-fb-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="4-2-3-1">4-2-3-1 (Klasik)</option>
                  <option value="4-3-3">4-3-3 (Ofansif Pres)</option>
                  <option value="3-5-2">3-5-2 (Çift Forvetli Kanat Baskısı)</option>
                  <option value="4-4-2">4-4-2 (Klasik Dengeli Yapı)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-fb-dark/40 border border-white/5 grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-0.5 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">KALECİ & DEFANS KADROSU</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">GK (Kaleci)</label>
                  <input type="text" value={form.GK} onChange={(e) => handleFormChange('GK', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">RB (Sağ Bek)</label>
                  <input type="text" value={form.RB} onChange={(e) => handleFormChange('RB', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">CB1 (Sol Stoper)</label>
                  <input type="text" value={form.CB1} onChange={(e) => handleFormChange('CB1', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">CB2 (Sağ Stoper)</label>
                  <input type="text" value={form.CB2} onChange={(e) => handleFormChange('CB2', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">LB (Sol Bek)</label>
                  <input type="text" value={form.LB} onChange={(e) => handleFormChange('LB', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>

                <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ORTA SAHA & KOORDİNASYON</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">DM1 (Defansif Merkez 1)</label>
                  <input type="text" value={form.DM1} onChange={(e) => handleFormChange('DM1', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">DM2 (Defansif Merkez 2)</label>
                  <input type="text" value={form.DM2} onChange={(e) => handleFormChange('DM2', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">AM (Ofansif Merkez On Numara)</label>
                  <input type="text" value={form.AM} onChange={(e) => handleFormChange('AM', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>

                <div className="flex flex-col gap-0.5 col-span-2 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">HÜCUM HATTI</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">RW (Sağ Açık)</label>
                  <input type="text" value={form.RW} onChange={(e) => handleFormChange('RW', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] text-[#8e9bb8]">LW (Sol Açık)</label>
                  <input type="text" value={form.LW} onChange={(e) => handleFormChange('LW', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10" />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2">
                  <label className="text-[9px] text-[#8e9bb8]">CF (Merkez Santrafor/Forvet)</label>
                  <input type="text" value={form.CF} onChange={(e) => handleFormChange('CF', e.target.value)} className="bg-fb-card text-xs text-white p-1.5 rounded border border-white/10 w-full" />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3.5">
            <button
              type="button"
              onClick={handleCloseFormAttempt}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              İptal Geri Dön
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Save size={14} /> FİKSTÜRÜ VE İSTATİSTİKLERİ KAYDET
            </button>
          </div>
        </motion.form>
      ) : (
        <div className="space-y-4 text-left">
          
          {/* FILTER AND SEARCH CONTROLS */}
          <div className="p-4 rounded-xl bg-fb-card border border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-fb-muted" />
              <input
                type="text"
                placeholder="Takım adı veya turnuva grubunda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-fb-dark border border-white/10 text-xs text-white placeholder-fb-muted focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-fb-dark border border-white/10 text-xs px-2.5 py-2 rounded-xl text-slate-300 w-full lg:col-span-1 focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All">Tüm Durumlar (Tümü)</option>
              <option value="upcoming">Gelecek Fikstürler (Upcoming)</option>
              <option value="live">Canlı Mücadeleler (Live)</option>
              <option value="completed">Oynanıp Bitenler (Completed)</option>
            </select>
          </div>

          {/* DYNAMIC LIST */}
          {loading ? (
            <div className="text-center py-20 text-fb-yellow text-xs font-black uppercase">OYUN FİKSTÜRLERİ YÜKLENİYOR...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Karşılaşma bulunamadı."
              text="Maç Merkezi sayfasında listelenecek bir müsabaka kaydı mevcut değil. Yeni bir tane ekleyin!"
              buttonLabel="Yeni Karşılaşma Ekle"
              onButtonClick={openNew}
              icon={<Calendar size={20} />}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-fb-card">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c1223]/60 text-[10px] font-black uppercase text-fb-muted tracking-widest_2">
                      <th className="p-4 pl-6">Müsabaka Eşleşmesi & Hakem</th>
                      <th className="p-4">Turnuva & Yayın</th>
                      <th className="p-4">Tarih</th>
                      <th className="p-4">Maç Skoru / Durumu</th>
                      <th className="p-4 text-center">Öne Çıkar</th>
                      <th className="p-4 text-center">Rapor / Simülasyon</th>
                      <th className="p-4 pr-6 text-right">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.01] transition-colors text-slate-200">
                        <td className="p-4 pl-6">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-white">{m.homeTeam} vs {m.awayTeam}</h4>
                            <p className="text-[10px] text-slate-400">🏁 Hakem: <b>{m.referee || 'Atanmadı'}</b></p>
                            <p className="text-[9px] text-fb-muted">📍 {m.venue || 'Şükrü Saracoğlu Spor Kompleksi'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-slate-300 block">{m.competition}</span>
                            <span className="text-[9px] text-fb-yellow font-bold flex items-center gap-1">
                              <Tv2 size={10} /> {m.broadcasterTarget || 'Yayın bilinmiyor'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-slate-300 font-mono font-semibold">{formatDate(m.matchDate)}</span>
                        </td>
                        <td className="p-4">
                          {m.status === 'live' ? (
                            <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-widest animate-pulse whitespace-nowrap">
                              ● CANLI: {m.scoreHome} - {m.scoreAway}
                            </span>
                          ) : m.status === 'completed' ? (
                            <span className="px-2 py-1 rounded bg-[#10b981]/15 border border-[#10b981]/25 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                              SKOR: {m.scoreHome} - {m.scoreAway} (Bitti)
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap">
                              YET TO PLAY
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(m)}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                              m.featured
                                ? 'bg-fb-yellow/10 border-fb-yellow/20 text-fb-yellow'
                                : 'bg-transparent border-white/5 text-slate-500 hover:text-white'
                            }`}
                            title="Haftanın Maçı Olarak Belirle ve Banner Yap"
                          >
                            <Star size={14} className={m.featured ? 'fill-fb-yellow' : ''} />
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          {m.status === 'live' ? (
                            <button
                              type="button"
                              onClick={() => startSimulation(m.id)}
                              className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border cursor-pointer flex items-center gap-1 mx-auto transition-all ${
                                simulationActive
                                  ? 'bg-red-500 hover:bg-white text-white hover:text-fb-navy border-transparent animate-pulse'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                              title="Canlı Skor / İstatistik Simülasyonunu Aç/Kapat"
                            >
                              <Activity size={10} />
                              {simulationActive ? 'DURDUR' : 'SIMULATE'}
                            </button>
                          ) : (
                            <span className="text-[9px] text-fb-muted italic">Sadece Canlıda</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(m)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-fb-yellow text-slate-300 border border-white/10 cursor-pointer"
                              title="Detaylı Kadro ve Bilgileri Düzenle"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(m.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 cursor-pointer"
                              title="Maçı Fikstürden Kaldır"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REUSABLE DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Bu maçı fikstürden kalıcı olarak silmek istediğine emin misin?"
        message="Bu işlem geri alınamaz ve tüm ilişkili maç özellikleri kaldırılır."
      />
    </div>
  );
};
