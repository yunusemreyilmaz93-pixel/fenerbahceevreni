import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  FolderOpen, 
 
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

// 7. FIREBASE IMAGE UPLOADER COMPONENT WITH LOADING, PROGRESS & PREVIEW
import { auth, getCurrentAdminUser, getFirebaseStorage, isFirebaseConfigured } from '../../lib/firebase';
import { Upload, Loader2, Trash2 as TrashIcon, Check } from 'lucide-react';

interface FirebaseImageUploaderProps {
  folderPath: 'article-covers' | 'team-logos' | 'player-images' | 'sponsor-logos';
  idOrSlug: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const FirebaseImageUploader: React.FC<FirebaseImageUploaderProps> = ({
  folderPath,
  idOrSlug,
  value,
  onChange,
  label = "GÖRSEL YÜKLEME VE SEÇİMİ"
}) => {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [storageReady, setStorageReady] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Determine file name by folder type (per user request)
  const getTargetFileName = () => {
    switch (folderPath) {
      case 'article-covers':
        return 'cover.webp';
      case 'team-logos':
        return 'logo.webp';
      case 'player-images':
        return 'profile.webp';
      case 'sponsor-logos':
        return 'logo.webp';
      default:
        return 'image.webp';
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Sadece görsel dosyaları yüklenebilir.');
      return;
    }

    if (!idOrSlug) {
      setError('Lütfen görseli yüklemeden önce başlık veya slug tanımlayın.');
      return;
    }

    const adminUser = auth?.currentUser || getCurrentAdminUser();
    // Check if authenticated admin
    if (!adminUser && isFirebaseConfigured) {
      setError('Görsel yüklemek için sisteme yönetici girişi yapmanız gerekmektedir.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const targetFileName = getTargetFileName();
    const fullPath = `${folderPath}/${idOrSlug}/${targetFileName}`;

    const storage = await getFirebaseStorage();
    setStorageReady(!!storage);

    if (storage) {
        const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      try {
        const storageRef = ref(storage, fullPath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: 'image/webp' // Standardizing content-type per user request WebP
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(p);
          },
          (err) => {
            console.error("Storage Upload Error:", err);
            setError(`Yükleme başarısız oldu: ${err.message}`);
            setUploading(false);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              onChange(downloadUrl);
              setUploading(false);
            } catch (err: any) {
              setError(`Bağlantı alınamadı: ${err.message}`);
              setUploading(false);
            }
          }
        );
      } catch (err: any) {
        console.error("Storage preparation failed:", err);
        setError(`Yetkilendirme veya hazırlık hatası: ${err.message}`);
        setUploading(false);
      }
    } else {
      // Local-first upload: without Firebase Storage, embed the user's real file as a data URL.
      // No fake external URLs — the actual selected image is stored and rendered.
      console.warn("Firebase Storage yapılandırılmamış. Görsel yerel (data URL) olarak kaydediliyor...");
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      reader.onload = () => {
        setProgress(100);
        onChange(typeof reader.result === 'string' ? reader.result : '');
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Dosya okunamadı. Lütfen tekrar deneyin.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{label}</label>
        {storageReady && (
          <span className="text-[8px] font-bold text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
            LIVE STORAGE ACTIVE
          </span>
        )}
      </div>
      
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full p-4 rounded-xl border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
          dragOver 
            ? 'border-fb-yellow bg-fb-yellow/5' 
            : uploading 
              ? 'border-slate-700 bg-fb-dark/30' 
              : 'border-white/15 bg-fb-dark/60 hover:border-white/30'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelectChange}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 text-fb-yellow animate-spin mx-auto" />
            <div className="space-y-1">
              <span className="text-xs font-black text-white block">YÜKLENİYOR... %{progress}</span>
              <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-fb-yellow transition-all duration-150" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Upload className={`w-8 h-8 mx-auto transition-colors ${dragOver ? 'text-fb-yellow' : 'text-slate-400'}`} />
            <div>
              <span className="text-xs font-black text-white block">Görsel Seçmek İçin Tıkla</span>
              <span className="text-[10px] text-fb-muted font-bold block mt-1">Sürükleyip bırakabilirsin</span>
              <span className="text-[8px] text-[#FFB020]/80 font-mono block mt-1">Hedef klasör: /{folderPath}/{idOrSlug || '{id}'}/{getTargetFileName()}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-red-400 font-bold tracking-tight block mt-1">❌ {error}</span>
      )}

      {value && value.startsWith('http') && (
        <div className="p-3 bg-fb-dark/40 border border-white/5 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              referrerPolicy="no-referrer" 
              src={value} 
              alt="Uploaded Preview" 
              className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0" 
            />
            <div className="min-w-0">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block flex items-center gap-1">
                <Check size={10} /> Aktif Bağlantı Tanımlı
              </span>
              <span className="text-[9px] text-fb-muted truncate font-mono block">
                {value}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 cursor-pointer"
            title="Bağlantıyı Temizle"
          >
            <TrashIcon size={12} />
          </button>
        </div>
      )}

      <div className="pt-1">
        <input
          type="text"
          placeholder="Alternatif / Manuel Görsel URL'si (Örn: https://...)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-fb-dark border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-fb-yellow focus:outline-none"
        />
      </div>
    </div>
  );
};

