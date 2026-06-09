import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  FolderOpen, 
  Sparkles, 
  Image as ImageIcon, 
  FileCheck, 
  Eye, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../../lib/adminHelpers';

// 1. DELETE CONFIRMATION MODAL
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Bu içeriği silmek istediğine emin misin?",
  message = "Bu işlem geri alınamaz."
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-md p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-left z-10 space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
                <p className="text-xs text-fb-muted font-bold">{message}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wide rounded-xl transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wide rounded-xl transition-all shadow-md cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 2. EMPTY STATE
interface EmptyStateProps {
  title: string;
  text: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  text,
  buttonLabel,
  onButtonClick,
  icon
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 text-center rounded-2xl bg-fb-card border border-white/[0.05] space-y-4 max-w-xl mx-auto my-6 text-left"
    >
      <div className="w-12 h-12 rounded-xl bg-fb-yellow/10 border border-fb-yellow/20 flex items-center justify-center text-fb-yellow mx-auto">
        {icon || <FolderOpen size={20} />}
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-black text-white uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-fb-muted font-semibold leading-relaxed">{text}</p>
      </div>
      {buttonLabel && onButtonClick && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onButtonClick}
            className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// 3. IMAGE PREVIEW
interface ImagePreviewProps {
  url: string;
  label?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ url, label = "GÖRSEL ÖNİZLEME" }) => {
  const isUrlValid = url && url.startsWith('http');
  return (
    <div className="space-y-1.5 text-left">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">{label}</span>
      <div className="w-full h-36 rounded-xl bg-fb-dark/80 border border-white/10 overflow-hidden flex items-center justify-center relative group">
        {isUrlValid ? (
          <>
            <img 
              referrerPolicy="no-referrer" 
              src={url} 
              alt="Preview" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase">GÖRSEL BAĞLANTISI AKTİF</span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-1 p-4">
            <ImageIcon className="w-6 h-6 text-slate-500 mx-auto" />
            <span className="text-[9px] font-bold text-slate-500 block">GEÇERLİ BİR GÖRSEL URL'Sİ BEKLENİYOR</span>
            <span className="text-[8px] text-slate-600 font-mono block">"http..." ile başlamalıdır</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. PDF PREVIEW / UPLOAD INFO
interface PDFPreviewProps {
  url: string;
  label?: string;
  onUploadPlaceholder?: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  url,
  label = "PDF PAYLAŞIM DOSYASI",
  onUploadPlaceholder
}) => {
  return (
    <div className="space-y-1.5 text-left">
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">{label}</span>
      <div className="p-4 rounded-xl bg-fb-dark/80 border border-[#FFB020]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs italic shrink-0">
            PDF
          </div>
          <div className="min-w-0">
            {url ? (
              <>
                <span className="text-xs font-black text-white truncate block max-w-[200px]">
                  {url.substring(url.lastIndexOf('/') + 1) || "analiz_dokumani.pdf"}
                </span>
                <span className="text-[9px] text-slate-400 block font-mono">Dosya konumu aktif</span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-400 block">Ekli PDF Raporu Yok</span>
                <span className="text-[9px] text-slate-500 block">Opsiyonel PDF doküman yükleyin</span>
              </>
            )}
          </div>
        </div>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-fb-yellow hover:bg-white text-fb-navy rounded text-[10px] font-black uppercase tracking-wider transition-colors inline-block text-center cursor-pointer"
          >
            PDF'i Görüntüle
          </a>
        ) : (
          onUploadPlaceholder && (
            <button
              type="button"
              onClick={onUploadPlaceholder}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold uppercase transition-all cursor-pointer"
            >
              Dosya Seç / Bağla
            </button>
          )
        )}
      </div>
    </div>
  );
};

// 5. STATUS BADGE
interface StatusBadgeProps {
  status: string;
  scheduledAt?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, scheduledAt }) => {
  switch (status) {
    case 'published':
    case 'active':
    case 'active-poll':
      return (
        <span className="px-2 py-1 select-none rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">
          ● Yayında
        </span>
      );
    case 'scheduled':
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="px-2 py-1 select-none rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">
            🕒 Zamanlandı
          </span>
          {scheduledAt && (
            <span className="text-[8px] text-blue-500/70 font-mono font-bold">
              {formatDate(scheduledAt)}
            </span>
          )}
        </div>
      );
    case 'completed':
    case 'closed':
      return (
        <span className="px-2 py-1 select-none rounded bg-slate-500/10 border border-slate-500/20 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
          ○ Sonlandı
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="px-2 py-1 select-none rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none">
          ○ Taslak
        </span>
      );
  }
};

// 6. CONTENT PREVIEW MODAL
interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerptOrSummary?: string;
  coverImage?: string;
  content: string;
  contentTypeLabel?: string;
  metadataList?: { label: string; value: string }[];
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  excerptOrSummary,
  coverImage,
  content,
  contentTypeLabel = "İÇERİK ÖNİZLEME",
  metadataList = []
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="relative w-full max-w-3xl h-[85vh] rounded-2xl bg-[#090e1a] border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col text-left z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 bg-[#0a1020] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-1 bg-fb-yellow/10 border border-fb-yellow/20 text-fb-yellow rounded uppercase tracking-widest">
                  {contentTypeLabel}
                </span>
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">• Önizleme Ekranı</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Cover Image */}
              {coverImage && coverImage.startsWith('http') && (
                <div className="w-full h-64 rounded-xl overflow-hidden border border-white/5 relative">
                  <img referrerPolicy="no-referrer" src={coverImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>
              )}

              {/* Title & Excerpt */}
              <div className="space-y-2">
                <h2 className="text-lg md:text-2xl font-display font-black text-white uppercase italic tracking-tight">{title || "Başlıksız İçerik"}</h2>
                {excerptOrSummary && (
                  <p className="text-xs md:text-sm text-fb-muted italic font-semibold leading-relaxed border-l-2 border-fb-yellow pl-3">
                    {excerptOrSummary}
                  </p>
                )}
              </div>

              {/* Metadata row if available */}
              {metadataList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-fb-card/40 border border-white/5">
                  {metadataList.map((meta, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[9px] font-black text-fb-muted uppercase tracking-wider">{meta.label}</span>
                      <span className="text-xs font-black text-white block">{meta.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Rich text body */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase text-[#FFB020] tracking-widest">RAPOR / MAKALE DETAYI</h4>
                <div className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap space-y-3">
                  {content || "İçerik detayı henüz girilmemiş."}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-white/5 bg-[#0a1020] shrink-0 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
              >
                Önizlemeyi Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
