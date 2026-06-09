import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Upload, FileJson, FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';
import { dbGetCollection, dbUpsertDocument } from '../../lib/dbService';

interface AdminImportExportProps {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminImportExport: React.FC<AdminImportExportProps> = ({ showToast }) => {
  const [activeCollection, setActiveCollection] = useState<string>('players');
  const [loading, setLoading] = useState(false);
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState<'json' | 'csv'>('json');

  const collections = [
    { value: 'players', label: '⚽ Oyuncular & Kadro' },
    { value: 'teams', label: '🛡️ Kulüpler / Rakipler' },
    { value: 'matches', label: '📅 Fikstür & Maçlar' },
    { value: 'articles', label: '✍️ Yazılar & Haberler' },
    { value: 'transferReports', label: '🔍 Scout Radar Raporları' },
    { value: 'mediaLibrary', label: '📸 Medya Kütüphanesi' },
  ];

  // Helper: Convert array to CSV string
  const arrayToCSV = (arr: any[]) => {
    if (arr.length === 0) return '';
    const keys = Object.keys(arr[0]).filter(k => typeof arr[0][k] !== 'object');
    const header = keys.join(',');
    const rows = arr.map(obj => 
      keys.map(k => {
        let val = obj[k] === undefined || obj[k] === null ? '' : String(obj[k]);
        // Handle double quotes
        val = val.replace(/"/g, '""');
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          val = `"${val}"`;
        }
        return val;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  };

  // Helper: Simple CSV parser
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      // Regex handling commas inside quoted strings
      const values: string[] = [];
      let currentVal = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.replace(/^"|"$/g, '').trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.replace(/^"|"$/g, '').trim());
      
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      return obj;
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      const data = await dbGetCollection(activeCollection);
      if (!data || data.length === 0) {
        if (showToast) showToast('Dışa aktarılacak veri bulunamadı.', 'error');
        return;
      }

      let fileContent = '';
      let filename = `fb_evreni_${activeCollection}_export_${new Date().toISOString().split('T')[0]}`;
      let mimeType = '';

      if (format === 'json') {
        fileContent = JSON.stringify(data, null, 2);
        filename += '.json';
        mimeType = 'application/json';
      } else {
        fileContent = arrayToCSV(data);
        filename += '.csv';
        mimeType = 'text/csv';
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (showToast) showToast(`Veritabanı koleksiyonu (${format.toUpperCase()}) olarak indirildi!`, 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Dışa aktarma esnasında hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      if (showToast) showToast('Lütfen içe aktarılacak içeriği girin veya yapıştırın.', 'error');
      return;
    }

    setLoading(true);
    try {
      let itemsToImport: any[] = [];
      if (importType === 'json') {
        itemsToImport = JSON.parse(importText);
        if (!Array.isArray(itemsToImport)) {
          // Wrap if single object passed
          itemsToImport = [itemsToImport];
        }
      } else {
        itemsToImport = parseCSV(importText);
      }

      if (itemsToImport.length === 0) {
        if (showToast) showToast('Giriş formatı geçersiz veya liste boş.', 'error');
        setLoading(false);
        return;
      }

      // Upsert into Firebase / Local DB
      let successCount = 0;
      for (const item of itemsToImport) {
        const id = item.id || `imp-${Math.random().toString(36).substr(2, 9)}`;
        // Clean id of spaces
        const finalItem = { ...item, id };
        await dbUpsertDocument(activeCollection, finalItem.id, finalItem);
        successCount++;
      }

      if (showToast) showToast(`${successCount} adet doküman başarıyla veritabanına aktarıldı! (Koleksiyon: ${activeCollection})`, 'success');
      setImportText('');
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(`İçe aktarma hatası: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide flex items-center gap-2">
          <Layers className="text-fb-yellow" size={20} /> Yedekleme / CSV ve JSON Veri Portu (Import/Export)
        </h2>
        <p className="text-xs text-fb-muted">
          Portal üzerindeki oyuncu listelerini, fikstürü veya scout radar verilerini CSV/JSON formatında bilgisayarınıza yedekleyin ya da excel tablonuzdan sisteme yükleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left selector */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-fb-card border border-white/[0.08] h-fit space-y-4">
          <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
            KOLEKSİYON SEÇİNİZ
          </span>
          <div className="space-y-1.5">
            {collections.map(c => (
              <button
                key={c.value}
                onClick={() => {
                  setActiveCollection(c.value);
                  setImportText('');
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeCollection === c.value
                    ? 'bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow'
                    : 'border border-transparent bg-fb-dark/40 text-slate-400 hover:border-white/5 hover:text-white'
                }`}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right workspace */}
        <div className="md:col-span-8 space-y-6">
          {/* Export Action Card */}
          <div className="p-5 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4">
            <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest block pb-1 border-b border-white/5">
              KOLEKSİYONU DIŞA AKTAR (DATA BACKUP)
            </span>
            <p className="text-[11px] text-fb-muted font-bold leading-normal">
              Seçili olan <span className="text-white">"{collections.find(c => c.value === activeCollection)?.label}"</span> veritabanı içeriğini anında masaüstünüze indirin.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleExport('json')}
                disabled={loading}
                className="py-3 bg-fb-dark border border-white/10 hover:border-fb-yellow rounded-xl flex items-center justify-center gap-2.5 text-xs font-black text-white transition-all cursor-pointer"
              >
                <FileJson className="text-fb-yellow w-4 h-4" /> Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="py-3 bg-fb-dark border border-white/10 hover:border-fb-yellow rounded-xl flex items-center justify-center gap-2.5 text-xs font-black text-white transition-all cursor-pointer"
              >
                <FileSpreadsheet className="text-[#4CAF50] w-4 h-4" /> Export CSV / Excel
              </button>
            </div>
          </div>

          {/* Import form */}
          <form onSubmit={handleImport} className="p-5 rounded-2xl bg-fb-card border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-[10px] font-black text-fb-yellow uppercase tracking-widest">
                VERİ YÜKLE / İÇE AKTAR (DATA PORT IN)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportType('json')}
                  className={`px-2 py-1 rounded text-[9px] font-black ${importType === 'json' ? 'bg-fb-yellow text-fb-navy' : 'bg-white/5 text-slate-400'}`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('csv')}
                  className={`px-2 py-1 rounded text-[9px] font-black ${importType === 'csv' ? 'bg-fb-yellow text-fb-navy' : 'bg-white/5 text-slate-400'}`}
                >
                  CSV
                </button>
              </div>
            </div>

            <p className="text-[11px] text-fb-muted font-bold leading-normal">
              Yedeklediğiniz veya hazırladığınız verileri aşağıdaki alana yapıştırarak tek seferde veritabanına import edebilirsiniz.
            </p>

            <div className="flex flex-col gap-1">
              <textarea
                rows={6}
                required
                placeholder={
                  importType === 'json'
                    ? '[\n  {\n    "id": "player-1",\n    "playerName": "Arda Güler",\n    "position": "AM",\n    "status": "published"\n  }\n]'
                    : 'id,playerName,position,status\nplayer-1,Arda Güler,AM,published'
                }
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="px-4 py-3 bg-fb-dark border border-white/10 focus:border-fb-yellow focus:outline-none rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                <span>VERİ GÜVENİLİR SEST ALTI</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AdminImportExport;
