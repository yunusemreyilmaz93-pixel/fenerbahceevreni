import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Edit2,
  Check,
  X,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Activity,
  ChevronDown,
  ExternalLink,
  Sliders,
  Play,
  FileCheck
} from 'lucide-react';
import { 
  dbGetCollection, 
  dbGetAdvancedPlayerStats, 
  dbGetAdvancedMatchStats, 
  dbGetExternalPlayerMapping, 
  dbUpsertExternalPlayerMapping, 
  dbGetDataSyncRuns,
  COLL_EXT_PLAYER_MAPPINGS,
  COLL_ADV_PLAYER_STATS,
  COLL_ADV_MATCH_STATS,
  COLL_DATA_SYNC_RUNS
} from '../../lib/dbService';
import { DataProvider, AdvancedPlayerStats, AdvancedMatchStats, ExternalPlayerMapping, DataSyncRun, parseFlexibleDate } from '../../types/soccerdata';

interface AdminDataIntegrationProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  adminUser: any;
}

export const AdminDataIntegration: React.FC<AdminDataIntegrationProps> = ({ showToast, adminUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'mappings' | 'preview' | 'sync_runs'>('overview');
  
  // Data States
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [mappings, setMappings] = useState<ExternalPlayerMapping[]>([]);
  const [syncRuns, setSyncRuns] = useState<DataSyncRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters for Mappings Tab
  const [mappingSearch, setMappingSearch] = useState('');
  const [mappingFilterProvider, setMappingFilterProvider] = useState<string>('all');
  const [mappingFilterStatus, setMappingFilterStatus] = useState<string>('all');

  // Preview Tab Selection States
  const [previewType, setPreviewType] = useState<'player' | 'match'>('player');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [advancedPlayerStatsList, setAdvancedPlayerStatsList] = useState<AdvancedPlayerStats[]>([]);
  const [advancedMatchStatsList, setAdvancedMatchStatsList] = useState<AdvancedMatchStats[]>([]);
  const [loadingPreviewData, setLoadingPreviewData] = useState<boolean>(false);

  // Modal State for Upsert Mapping
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [mappingForm, setMappingForm] = useState<{
    playerDocumentId: string;
    apiSportsPlayerId: number;
    canonicalName: string;
    aliases: string;
    provider: DataProvider;
    providerPlayerId: string;
    providerPlayerName: string;
    mappingStatus: 'confirmed' | 'review' | 'unmatched';
    confidence: number;
  }>({
    playerDocumentId: '',
    apiSportsPlayerId: 0,
    canonicalName: '',
    aliases: '',
    provider: 'sofascore',
    providerPlayerId: '',
    providerPlayerName: '',
    mappingStatus: 'review',
    confidence: 0.5,
  });

  // Load basic collections
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const playersList = await dbGetCollection('players');
      const matchesList = await dbGetCollection('matches');
      const mappingsList = await dbGetCollection(COLL_EXT_PLAYER_MAPPINGS);
      const syncRunsList = await dbGetDataSyncRuns(undefined, 50);

      setPlayers(playersList || []);
      setMatches(matchesList || []);
      setMappings(mappingsList || []);
      setSyncRuns(syncRunsList || []);

      if (playersList && playersList.length > 0) {
        setSelectedPlayerId(playersList[0].id || '');
      }
      if (matchesList && matchesList.length > 0) {
        setSelectedMatchId(matchesList[0].id || '');
      }
    } catch (err: any) {
      console.error("Data integration load error:", err);
      showToast("Veri yüklenirken hata oluştu: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch preview data dynamically when selections change
  useEffect(() => {
    const fetchPlayerPreview = async () => {
      if (!selectedPlayerId || previewType !== 'player') return;
      setLoadingPreviewData(true);
      try {
        const stats = await dbGetAdvancedPlayerStats(selectedPlayerId);
        setAdvancedPlayerStatsList(stats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPreviewData(false);
      }
    };
    fetchPlayerPreview();
  }, [selectedPlayerId, previewType]);

  useEffect(() => {
    const fetchMatchPreview = async () => {
      if (!selectedMatchId || previewType !== 'match') return;
      setLoadingPreviewData(true);
      try {
        const stats = await dbGetAdvancedMatchStats(selectedMatchId);
        setAdvancedMatchStatsList(stats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPreviewData(false);
      }
    };
    fetchMatchPreview();
  }, [selectedMatchId, previewType]);

  // Calculations for Overview Screen
  const statsOverview = React.useMemo(() => {
    const totalPlayers = players.length;
    
    // mapping records linked with players
    const definedMappings = mappings.filter(m => players.some(p => p.id === m.playerDocumentId));
    
    const confirmedCount = definedMappings.filter(m => m.mappingStatus === 'confirmed').length;
    const reviewCount = definedMappings.filter(m => m.mappingStatus === 'review').length;
    const unmatchedCount = definedMappings.filter(m => m.mappingStatus === 'unmatched').length;
    
    // Unmapped count is players with no registry in definingMappings
    const unmappedCount = players.filter(p => !mappings.some(m => m.playerDocumentId === p.id)).length;

    // Last success run
    const lastSuccessRun = syncRuns.find(r => r.status === 'success');
    // Last failure run
    const lastFailedRun = syncRuns.find(r => r.status === 'failed' || r.errorSummary);

    return {
      totalPlayers,
      totalMappings: definedMappings.length,
      confirmedCount,
      reviewCount,
      unmatchedCount,
      unmappedCount,
      lastSuccessDate: lastSuccessRun ? parseFlexibleDate(lastSuccessRun.finishedAt || lastSuccessRun.startedAt) : null,
      lastSuccessProvider: lastSuccessRun?.provider || null,
      lastFailedDate: lastFailedRun ? parseFlexibleDate(lastFailedRun.startedAt) : null,
      lastFailedError: lastFailedRun?.errorSummary || null,
      lastFailedProvider: lastFailedRun?.provider || null
    };
  }, [players, mappings, syncRuns]);

  // Filter player mappings row
  const filteredPlayersRows = React.useMemo(() => {
    return players.map(player => {
      const mapping = mappings.find(m => m.playerDocumentId === player.id);
      return {
        player,
        mapping
      };
    }).filter(({ player, mapping }) => {
      // 1. Search text filter (name, or provider name)
      const nameMatch = player.name?.toLowerCase().includes(mappingSearch.toLowerCase()) ||
                        mapping?.canonicalName?.toLowerCase().includes(mappingSearch.toLowerCase());
      
      if (!nameMatch) return false;

      // 2. Status filter
      if (mappingFilterStatus !== 'all') {
        if (mappingFilterStatus === 'unmapped') {
          if (mapping) return false;
        } else {
          if (!mapping || mapping.mappingStatus !== mappingFilterStatus) return false;
        }
      }

      // 3. Provider filter
      if (mappingFilterProvider !== 'all') {
        if (!mapping) return false;
        const providers = mapping.providers || {};
        if (!providers[mappingFilterProvider as DataProvider]) return false;
      }

      return true;
    });
  }, [players, mappings, mappingSearch, mappingFilterProvider, mappingFilterStatus]);

  // Quick Action Handler: Update mapping status
  const handleQuickStatusUpdate = async (player: any, currentMapping: ExternalPlayerMapping | undefined, status: 'confirmed' | 'review' | 'unmatched') => {
    // If no mapping exists yet, construct a basic one first
    const apiSportsId = player.apiSportsId || player.apiSportsPlayerId || parseInt(player.id?.replace('plyr-api-', '') || '0') || 0;
    
    let baseMapping: ExternalPlayerMapping;
    
    if (currentMapping) {
      if (status === 'confirmed') {
        // Validation: Provider check
        const hasProvider = Object.keys(currentMapping.providers || {}).length > 0;
        if (!hasProvider) {
          showToast("Eşleştirmeyi onaylamadan önce en az bir harici kaynak (provider) ID'si girilmelidir.", "error");
          return;
        }
      }

      baseMapping = {
        ...currentMapping,
        mappingStatus: status,
        verifiedBy: status === 'confirmed' ? (adminUser?.email || 'admin@fenerbahce.com') : currentMapping.verifiedBy,
        verifiedAt: status === 'confirmed' ? new Date().toISOString() : currentMapping.verifiedAt,
        updatedAt: new Date().toISOString()
      };
    } else {
      if (status === 'confirmed') {
        showToast("Onaylanmadan önce harici kaynak (provider) ID'si girilmelidir.", "error");
        return;
      }
      
      baseMapping = {
        schemaVersion: 1,
        playerDocumentId: player.id,
        apiSportsPlayerId: apiSportsId,
        canonicalName: player.name,
        aliases: [],
        providers: {},
        mappingStatus: status,
        confidence: 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      await dbUpsertExternalPlayerMapping(baseMapping);
      showToast(`${player.name} eşleştirme durumu "${status}" yapıldı.`, "success");
      // Reload mappings
      const refreshedList = await dbGetCollection(COLL_EXT_PLAYER_MAPPINGS);
      setMappings(refreshedList || []);
    } catch (err: any) {
      showToast("Güncelleme başarısız: " + err.message, "error");
    }
  };

  // Open upsert modal
  const openEditMappingModal = (player: any, mapping?: ExternalPlayerMapping) => {
    const apiSportsId = player.apiSportsId || player.apiSportsPlayerId || parseInt(player.id?.replace('plyr-api-', '') || '0') || 0;
    
    // Default provider config
    let firstProvider: DataProvider = 'sofascore';
    let provId = '';
    let provName = '';
    
    if (mapping && mapping.providers) {
      const activeProviders = Object.keys(mapping.providers) as DataProvider[];
      if (activeProviders.length > 0) {
        firstProvider = activeProviders[0];
        provId = mapping.providers[firstProvider]?.id || '';
        provName = mapping.providers[firstProvider]?.name || '';
      }
    }

    setMappingForm({
      playerDocumentId: player.id,
      apiSportsPlayerId: apiSportsId,
      canonicalName: player.name,
      aliases: mapping?.aliases?.join(', ') || '',
      provider: firstProvider,
      providerPlayerId: provId,
      providerPlayerName: provName || player.name,
      mappingStatus: mapping?.mappingStatus || 'review',
      confidence: mapping?.confidence ?? 0.5,
    });
    setIsMappingModalOpen(true);
  };

  // Submit mapping form
  const handleSaveMappingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mappingForm.providerPlayerId || !mappingForm.providerPlayerId.trim()) {
      if (mappingForm.mappingStatus === 'confirmed') {
        showToast("Onaylanmış (confirmed) durumundaki kayıtlar için sağlayıcı oyuncu ID'si zorunludur.", "error");
        return;
      }
    }

    const confNum = Number(mappingForm.confidence);
    if (isNaN(confNum) || confNum < 0 || confNum > 1) {
      showToast("Güven skoru 0 ile 1 arasında bir ondalıklı değer olmalıdır.", "error");
      return;
    }

    // Load existing mapping if any
    const existing = mappings.find(m => m.playerDocumentId === mappingForm.playerDocumentId);
    
    const providersObj: any = existing?.providers ? { ...existing.providers } : {};
    
    if (mappingForm.providerPlayerId && mappingForm.providerPlayerId.trim()) {
      providersObj[mappingForm.provider] = {
        id: mappingForm.providerPlayerId.trim(),
        name: mappingForm.providerPlayerName.trim() || mappingForm.canonicalName
      };
    } else {
      // Remove provider if empty
      delete providersObj[mappingForm.provider];
    }

    // Build finalized document
    const finalMapping: ExternalPlayerMapping = {
      schemaVersion: 1,
      playerDocumentId: mappingForm.playerDocumentId,
      apiSportsPlayerId: mappingForm.apiSportsPlayerId,
      canonicalName: mappingForm.canonicalName,
      aliases: mappingForm.aliases ? mappingForm.aliases.split(',').map(a => a.trim()).filter(Boolean) : [],
      providers: providersObj,
      mappingStatus: mappingForm.mappingStatus,
      confidence: confNum,
      verifiedBy: mappingForm.mappingStatus === 'confirmed' ? (adminUser?.email || 'admin@fenerbahce.com') : existing?.verifiedBy,
      verifiedAt: mappingForm.mappingStatus === 'confirmed' ? new Date().toISOString() : existing?.verifiedAt,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await dbUpsertExternalPlayerMapping(finalMapping);
      showToast(`${mappingForm.canonicalName} eşleştirme bilgisi kaydedildi.`, "success");
      setIsMappingModalOpen(false);
      // Reload mappings
      const refreshedList = await dbGetCollection(COLL_EXT_PLAYER_MAPPINGS);
      setMappings(refreshedList || []);
    } catch (err: any) {
      showToast("Kaydetme işlemi başarısız: " + err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-fb-navy/80 via-[#0b1528]/90 to-fb-navy/80 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow shrink-0 shadow-[0_0_20px_rgba(255,176,32,0.15)]">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight uppercase font-display tracking-tight">SOCCERDATA ENTEGRASYONU</h1>
            <p className="text-xs text-slate-400">Harici gelişmiş veri entegrasyonu, veri eşleştirmeleri ve senkronizasyon logları yönetim merkezi.</p>
          </div>
        </div>
        <button 
          onClick={loadInitialData}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 text-xs font-bold rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-fb-yellow" : ""} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-white/[0.05] overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: Sliders },
          { id: 'mappings', label: 'Oyuncu Eşleştirmeleri', icon: User },
          { id: 'preview', label: 'Veri Önizleme', icon: Eye },
          { id: 'sync_runs', label: 'İş Geçmişi', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-fb-yellow text-fb-yellow bg-fb-yellow/5' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-[#080d19] border border-white/[0.03] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <RefreshCw size={36} className="animate-spin text-fb-yellow mb-4" />
          <p className="text-slate-400 text-sm font-medium">Bütünsel veriler Firestore'dan okunuyor, lütfen bekleyin...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. OVERVIEW VIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#080d19] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Toplam Oyuncu</span>
                    <h3 className="text-3xl font-black text-white leading-none">{statsOverview.totalPlayers}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <User size={20} />
                  </div>
                </div>

                <div className="p-5 bg-[#080d19] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Onaylanmış Eşleştirme</span>
                    <h3 className="text-3xl font-black text-emerald-400 leading-none">{statsOverview.confirmedCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="p-5 bg-[#080d19] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">İnceleme Bekleyen</span>
                    <h3 className="text-3xl font-black text-amber-500 leading-none">{statsOverview.reviewCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                </div>

                <div className="p-5 bg-[#080d19] border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Eşleşmemiş Oyuncu</span>
                    <h3 className="text-3xl font-black text-slate-200 leading-none">{statsOverview.unmappedCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                    <HelpCircle size={20} />
                  </div>
                </div>
              </div>

              {/* Sync Logs Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Last Success Run card */}
                <div className="p-6 bg-[#080d19] border border-[#103422] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={16} />
                      </div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">Son Başarılı Senkronizasyon</h4>
                    </div>
                  </div>
                  {statsOverview.lastSuccessDate ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300">
                        Harici analiz sağlayıcısı üzerinden başarılı biçimde veri çekildi ve Firestore modellerine yazıldı.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-black/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">SAĞLAYICI / PROVIDER</span>
                          <span className="text-xs font-bold text-fb-yellow uppercase block">{statsOverview.lastSuccessProvider}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">İŞLEM TARİHİ</span>
                          <span className="text-xs font-mono font-bold text-white block">
                            {new Date(statsOverview.lastSuccessDate).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/20 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Kayıtlı başarılı senkronizasyon kaydı bulunmamaktadır.</p>
                    </div>
                  )}
                </div>

                {/* Last Failed Run card */}
                <div className="p-6 bg-[#080d19] border border-red-500/15 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                        <AlertCircle size={16} />
                      </div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">Son Başarısız Senkronizasyon</h4>
                    </div>
                  </div>
                  {statsOverview.lastFailedDate ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300">
                        Senkronizasyon işlemi sırasında sistem bir hata kaydetti. Çekilen veriler işlenemedi.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-black/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">HATA DETAYI</span>
                          <span className="text-xs font-bold text-red-400 block truncate">{statsOverview.lastFailedError || 'Bilinmeyen Hata'}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-black/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">TARİH & PROVIDER</span>
                          <span className="text-xs font-mono font-bold text-white block">
                            {new Date(statsOverview.lastFailedDate).toLocaleString('tr-TR')} ({statsOverview.lastFailedProvider?.toUpperCase()})
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/20 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Loglanmış herhangi bir veri senkronizasyon hatası bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warnings / Explanations section */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                <div className="flex items-center gap-2 text-fb-yellow">
                  <Play size={16} />
                  <h4 className="text-xs font-black uppercase tracking-wider">Entegrasyon Sorumluluk Sınırı & Python Worker</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bu yönetim ekranı, SofaScore, WhoScored, FBRef ve Sofifa veri sağlayıcılarının veritabanı eşleştirmelerini (Mapping) el ile düzenlemek ve denetlemek amacıyla tasarlanmıştır. Gerçek zamanlı veri kazıma (scraping) ve API entegrasyonu operasyonları, arka plandaki Python worker veya planlı Cloud Run Job servisleri aracılığıyla doğrudan Firestore'a yazılır. 
                </p>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-black/30 p-2 rounded max-w-max border border-white/5">
                  Python Entegrasyon Altyapısı Hazır • Veritabanı Modelleri Aktif
                </div>
              </div>
            </div>
          )}

          {/* 2. MAPPINGS VIEW */}
          {activeSubTab === 'mappings' && (
            <div className="space-y-6">
              {/* Filters Block */}
              <div className="p-5 bg-[#080d19] rounded-2xl border border-white/[0.05] flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Oyuncu adına göre filtrele..."
                    value={mappingSearch}
                    onChange={(e) => setMappingSearch(e.target.value)}
                    className="w-full bg-[#04060c] border border-white/[0.08] hover:border-white/15 focus:border-fb-yellow rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="space-y-1 min-w-[130px]">
                    <select
                      value={mappingFilterProvider}
                      onChange={(e) => setMappingFilterProvider(e.target.value)}
                      className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none transition-all"
                    >
                      <option value="all">Fark Etmez (Sağlayıcı)</option>
                      <option value="sofascore">SofaScore</option>
                      <option value="whoscored">WhoScored</option>
                      <option value="fbref">FBRef</option>
                      <option value="sofifa">SoFIFA</option>
                    </select>
                  </div>

                  <div className="space-y-1 min-w-[130px]">
                    <select
                      value={mappingFilterStatus}
                      onChange={(e) => setMappingFilterStatus(e.target.value)}
                      className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none transition-all"
                    >
                      <option value="all">Fark Etmez (Durum)</option>
                      <option value="confirmed">Confirmed (Onaylı)</option>
                      <option value="review">Review (İncelemede)</option>
                      <option value="unmatched">Unmatched (Eşleşmedi)</option>
                      <option value="unmapped">Tanımsız Oyuncular</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mappings Table */}
              <div className="overflow-x-auto bg-[#080d19] border border-white/[0.05] rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-black/20">
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Oyuncu</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">API-Sports ID</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Sağlayıcı Metadataları</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Güven Katsayısı</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Statü / Durum</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Son Güncelleme</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredPlayersRows.length > 0 ? (
                      filteredPlayersRows.map(({ player, mapping }) => {
                        const apiSportsId = player.apiSportsId || player.apiSportsPlayerId || parseInt(player.id?.replace('plyr-api-', '') || '0') || 0;
                        const providers = mapping?.providers || {};
                        const hasProviders = Object.keys(providers).length > 0;
                        
                        return (
                          <tr key={player.id} className="hover:bg-white/[0.01] transition-all">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                                  {player.photoUrl || player.photo ? (
                                    <img src={player.photoUrl || player.photo} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                      {player.name?.substring(0, 2)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-black text-white">{player.name}</div>
                                  <div className="text-[10px] font-bold text-fb-yellow uppercase leading-none mt-0.5">{player.position}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs text-slate-400">
                              {apiSportsId}
                            </td>
                            <td className="p-4">
                              {hasProviders ? (
                                <div className="space-y-1">
                                  {Object.entries(providers).map(([providerKey, data]: any) => (
                                    <div key={providerKey} className="flex items-center gap-1.5 text-[10px]">
                                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-bold text-slate-300 uppercase shrink-0">
                                        {providerKey}
                                      </span>
                                      <span className="text-slate-400">ID: {data?.id}</span>
                                      <span className="text-slate-500 italic">({data?.name})</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 uppercase italic">Harici Sağlayıcı ID Tanımlanmamış</span>
                              )}
                            </td>
                            <td className="p-4">
                              {mapping ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden shrink-0">
                                    <div 
                                      className="bg-fb-yellow h-full" 
                                      style={{ width: `${(mapping.confidence || 0) * 100}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-xs font-bold text-slate-300">
                                    {mapping.confidence?.toFixed(2) || '0.00'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {mapping ? (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                  mapping.mappingStatus === 'confirmed'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : mapping.mappingStatus === 'unmatched'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                }`}>
                                  {mapping.mappingStatus}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border bg-slate-500/5 border-white/5 text-slate-500">
                                  TANIMSIZ (UNMAPPED)
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-mono text-xs text-slate-500">
                              {mapping?.updatedAt ? new Date(parseFlexibleDate(mapping.updatedAt)).toLocaleDateString('tr-TR') : '-'}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditMappingModal(player, mapping)}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition-all border border-white/5"
                                  title="Eşleştirmeyi Düzenle"
                                >
                                  <Edit2 size={12} />
                                </button>
                                
                                {(!mapping || mapping.mappingStatus !== 'confirmed') && (
                                  <button
                                    onClick={() => handleQuickStatusUpdate(player, mapping, 'confirmed')}
                                    className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 cursor-pointer transition-all border border-emerald-500/10"
                                    title="Onayla"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}

                                {(!mapping || mapping.mappingStatus !== 'review') && (
                                  <button
                                    onClick={() => handleQuickStatusUpdate(player, mapping, 'review')}
                                    className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 cursor-pointer transition-all border border-amber-500/10"
                                    title="İncelemeye Gönder"
                                  >
                                    <AlertTriangle size={12} />
                                  </button>
                                )}

                                {(!mapping || mapping.mappingStatus !== 'unmatched') && (
                                  <button
                                    onClick={() => handleQuickStatusUpdate(player, mapping, 'unmatched')}
                                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-all border border-red-500/10"
                                    title="Eşleşmedi Olarak İşaretle"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-slate-400 italic">
                          Filtrelere uygun eşleştirme veya oyuncu kaydı bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DATA PREVIEW VIEW */}
          {activeSubTab === 'preview' && (
            <div className="space-y-6">
              {/* Type Switch Selector */}
              <div className="flex bg-[#04060c] p-1 rounded-xl max-w-max border border-white/[0.05]">
                <button
                  onClick={() => setPreviewType('player')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    previewType === 'player'
                      ? 'bg-fb-yellow text-fb-navy font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Oyuncu İstatistikleri
                </button>
                <button
                  onClick={() => setPreviewType('match')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                    previewType === 'match'
                      ? 'bg-fb-yellow text-fb-navy font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Maç İstatistikleri
                </button>
              </div>

              {previewType === 'player' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                  {/* Player selection sidebar */}
                  <div className="lg:col-span-1 border border-white/[0.05] rounded-2xl bg-[#080d19] overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-4 border-b border-white/[0.05] bg-black/20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Oyuncu Seçimi</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {players.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                            selectedPlayerId === p.id 
                              ? 'bg-fb-yellow/10 border border-fb-yellow/20 text-white' 
                              : 'hover:bg-white/5 text-slate-400 text-xs font-bold'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/5 shrink-0 overflow-hidden">
                            {p.photoUrl || p.photo ? (
                              <img src={p.photoUrl || p.photo} alt="" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <span className="truncate text-xs font-black">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player Stats preview body */}
                  <div className="lg:col-span-3 border border-white/[0.05] bg-[#080d19] rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Gelişmiş Oyuncu İstatistikleri Önizlemesi</h3>
                    <p className="text-xs text-slate-400">
                      Seçili oyuncu için kazınan ve veritabanına kaydedilen `advancedPlayerStats` belgeleri listelenir.
                    </p>

                    {loadingPreviewData ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <RefreshCw size={24} className="animate-spin text-fb-yellow mb-2" />
                        <span className="text-xs text-slate-400">Oyuncu istatistikleri sorgulanıyor...</span>
                      </div>
                    ) : advancedPlayerStatsList.length > 0 ? (
                      <div className="space-y-4">
                        {advancedPlayerStatsList.map((stat, i) => (
                          <div key={stat.id || i} className="p-4 rounded-xl bg-black/20 border border-white/[0.05] space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-fb-yellow">
                                  {stat.provider?.toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-white">{stat.competition} ({stat.seasonKey})</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                Kazınma Tarihi: {new Date(parseFlexibleDate(stat.fetchedAt)).toLocaleString('tr-TR')}
                              </span>
                            </div>

                            {/* Metrics rendering */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {Object.entries(stat.metrics || {}).map(([key, val]) => (
                                <div key={key} className="p-2.5 rounded bg-white/[0.02] border border-white/[0.03]">
                                  <span className="text-[9px] text-slate-400 block break-words tracking-wide uppercase font-bold">{key}</span>
                                  <span className="text-xs font-black text-white block mt-1">{val ?? '-'}</span>
                                </div>
                              ))}
                            </div>
                            {stat.sourceUrl && (
                              <div className="pt-1 flex">
                                <a 
                                  href={stat.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-fb-yellow hover:underline flex items-center gap-1 font-bold"
                                >
                                  <span>Kaynak Linkini Gör</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                        <p className="font-bold text-slate-300 uppercase mb-2">Gelişmiş Veri Yok</p>
                        Seçilen oyuncu için Firestore `advancedPlayerStats` koleksiyonunda kazınmış analiz kaydı bulunmamaktadır. Python scraping worker veya harvester çalıştırıldığında bu alan otomatik güncellenecektir.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
                  {/* Match selection Sidebar */}
                  <div className="lg:col-span-1 border border-white/[0.05] rounded-2xl bg-[#080d19] overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-4 border-b border-white/[0.05] bg-black/20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maç Seçimi</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {matches.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMatchId(m.id)}
                          className={`w-full flex flex-col p-2.5 rounded-xl text-left transition-all ${
                            selectedMatchId === m.id 
                              ? 'bg-fb-yellow/10 border border-fb-yellow/20 text-white' 
                              : 'hover:bg-white/5 text-slate-400 text-xs font-bold'
                          }`}
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-black">{m.competition || 'Trendyol Süper Lig'}</span>
                          <span className="truncate text-xs font-black mt-1">{m.homeTeam} - {m.awayTeam}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Match stats preview body */}
                  <div className="lg:col-span-3 border border-white/[0.05] bg-[#080d19] rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Gelişmiş Maç İstatistikleri Önizlemesi</h3>
                    <p className="text-xs text-slate-400">
                      Seçili maç için kazınan veya analiz edilen `advancedMatchStats` belgeleri listelenir.
                    </p>

                    {loadingPreviewData ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <RefreshCw size={24} className="animate-spin text-fb-yellow mb-2" />
                        <span className="text-xs text-slate-400">Maç istatistikleri sorgulanıyor...</span>
                      </div>
                    ) : advancedMatchStatsList.length > 0 ? (
                      <div className="space-y-4">
                        {advancedMatchStatsList.map((stat, i) => (
                          <div key={stat.id || i} className="p-4 rounded-xl bg-black/20 border border-white/[0.05] space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-fb-yellow/10 border border-fb-yellow/20 text-[10px] uppercase font-bold text-fb-yellow">
                                  {stat.provider?.toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-white">{stat.competition} ({stat.seasonKey})</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                Kazınma Tarihi: {new Date(parseFlexibleDate(stat.fetchedAt)).toLocaleString('tr-TR')}
                              </span>
                            </div>

                            {/* Team Metrics Comparison */}
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-black uppercase text-slate-300">Takım Gelişmiş Metrikleri</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-1">
                                  <span className="text-[9px] font-bold text-fb-yellow uppercase">EV SAHİBİ: {stat.homeTeam}</span>
                                  {Object.entries(stat.teamMetrics?.home || {}).map(([mK, mV]) => (
                                    <div key={mK} className="flex items-center justify-between text-xs py-0.5 border-b border-white/[0.02]">
                                      <span className="text-slate-400 font-medium">{mK}</span>
                                      <span className="font-bold text-white">{mV ?? '-'}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg space-y-1">
                                  <span className="text-[9px] font-bold text-fb-yellow uppercase">DEPLASMAN: {stat.awayTeam}</span>
                                  {Object.entries(stat.teamMetrics?.away || {}).map(([mK, mV]) => (
                                    <div key={mK} className="flex items-center justify-between text-xs py-0.5 border-b border-white/[0.02]">
                                      <span className="text-slate-400 font-medium">{mK}</span>
                                      <span className="font-bold text-white">{mV ?? '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                        <p className="font-bold text-slate-300 uppercase mb-2">Gelişmiş Veri Yok</p>
                        Seçilen maç için Firestore `advancedMatchStats` koleksiyonunda kazınmış analiz kaydı bulunmamaktadır. Python scraper servisi derleme yaptığında bu alan otomatik dolacaktır.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SYNC RUNS VIEW */}
          {activeSubTab === 'sync_runs' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Harici Harvesting Logları</h3>
                <p className="text-xs text-slate-400 mb-4">
                  SofaScore, WhoScored, FBRef ve Sofifa üzerinden çekilen ve işlenen en son 50 `dataSyncRuns` işlemi listelenmiştir.
                </p>
              </div>

              <div className="overflow-x-auto bg-[#080d19] border border-white/[0.05] rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-black/20">
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Sağlayıcı (Provider)</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">İş Türü</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Durum</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Başlangıç</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Bitiş</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">İşlenen</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Başarılı</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Başarısız</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Tetikleyen</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Hata Özeti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {syncRuns.length > 0 ? (
                      syncRuns.map((run) => (
                        <tr key={run.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase font-bold text-fb-yellow">
                              {run.provider}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-white">{run.jobType}</span>
                            {run.seasonKey && <span className="text-[10px] text-slate-500 block">Sezon: {run.seasonKey}</span>}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              run.status === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : run.status === 'failed'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : run.status === 'running'
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                              {run.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                            {new Date(parseFlexibleDate(run.startedAt)).toLocaleString('tr-TR')}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                            {run.finishedAt ? new Date(parseFlexibleDate(run.finishedAt)).toLocaleString('tr-TR') : '-'}
                          </td>
                          <td className="p-4 text-center text-xs font-bold text-white">{run.processedCount ?? 0}</td>
                          <td className="p-4 text-center text-xs font-bold text-emerald-400">{run.successCount ?? 0}</td>
                          <td className="p-4 text-center text-xs font-bold text-red-400">{run.failedCount ?? 0}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-black uppercase text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              {run.triggeredBy}
                            </span>
                            {run.requestedBy && <span className="text-[9px] text-slate-500 block truncate max-w-[120px] mt-0.5">{run.requestedBy}</span>}
                          </td>
                          <td className="p-4 text-xs text-slate-400 max-w-[200px] truncate" title={run.errorSummary}>
                            {run.errorSummary || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-xs text-slate-400 italic">
                          Koleksiyonda henüz kazınmış iş geçmişi log kaydı bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. UPSERT MAPPING DIALOG MODAL */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-left">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a0f1d] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-black/10">
              <div className="flex items-center gap-2.5">
                <Database size={18} className="text-fb-yellow" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Oyuncu Eşleştirme Detayı</h3>
              </div>
              <button 
                onClick={() => setIsMappingModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveMappingForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Canonic Oyuncu Adı</label>
                  <input
                    type="text"
                    value={mappingForm.canonicalName}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-400 font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">API-Sports ID</label>
                  <input
                    type="text"
                    value={mappingForm.apiSportsPlayerId}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                <span className="text-[9px] font-black text-fb-yellow uppercase tracking-widest block">Harici Sağlayıcı (Provider) Ayarı</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Veri Sağlayıcı</label>
                    <select
                      value={mappingForm.provider}
                      onChange={(e) => {
                        const nextProv = e.target.value as DataProvider;
                        // Prepopulate name matches or keep
                        setMappingForm(prev => ({
                          ...prev,
                          provider: nextProv
                        }));
                      }}
                      className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="sofascore">SofaScore</option>
                      <option value="whoscored">WhoScored</option>
                      <option value="fbref">FBRef</option>
                      <option value="sofifa">SoFIFA</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Sağlayıcı Oyuncu ID'si</label>
                    <input
                      type="text"
                      value={mappingForm.providerPlayerId}
                      onChange={(e) => setMappingForm(prev => ({ ...prev, providerPlayerId: e.target.value }))}
                      placeholder="e.g., 981254"
                      className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-medium text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Sağlayıcı Üzerindeki Oyuncu Adı</label>
                  <input
                    type="text"
                    value={mappingForm.providerPlayerName}
                    onChange={(e) => setMappingForm(prev => ({ ...prev, providerPlayerName: e.target.value }))}
                    placeholder="Eğer boştaysa canonic adı kullanılır."
                    className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-medium text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Extra search aliases */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alternatif İsimler / Aliases</label>
                <input
                  type="text"
                  value={mappingForm.aliases}
                  onChange={(e) => setMappingForm(prev => ({ ...prev, aliases: e.target.value }))}
                  placeholder="Virgülle ayırarak giriniz: S. Szymanski, Sebastian Szymanski"
                  className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-medium text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Güven Skoru (Confidence)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={mappingForm.confidence}
                    onChange={(e) => setMappingForm(prev => ({ ...prev, confidence: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-mono font-bold text-white focus:outline-none animate-none"
                  />
                  <span className="text-[9px] text-slate-500 font-medium">0 - 1 arası skor değeri yazın.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Eşleştirme Statüsü</label>
                  <select
                    value={mappingForm.mappingStatus}
                    onChange={(e) => setMappingForm(prev => ({ ...prev, mappingStatus: e.target.value as any }))}
                    className="w-full bg-[#04060c] border border-white/[0.08] focus:border-fb-yellow rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="review">Review (İnceleme Bekliyor)</option>
                    <option value="confirmed">Confirmed (Onaylandı)</option>
                    <option value="unmatched">Unmatched (Eşleşmedi)</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="pt-4 border-t border-white/[0.05] flex justify-end gap-2 bg-black/5 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setIsMappingModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-fb-yellow hover:bg-white text-fb-navy text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Haritayı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
