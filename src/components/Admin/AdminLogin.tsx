import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, KeyRound } from 'lucide-react';
import { loginWithGoogleAdmin } from '../../lib/firebase';

interface AdminLoginProps {
  onLoginSuccess?: (user: any) => void;
  onBackToSite?: () => void;
  onNavigate?: (view: any) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBack = () => {
    if (onBackToSite) onBackToSite();
    else if (onNavigate) onNavigate('home');
    else window.location.hash = '#/home';
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await loginWithGoogleAdmin();
      onLoginSuccess?.(user);
      if (!onLoginSuccess) onNavigate?.('admin');
    } catch (err) {
      console.error(err);
      setErrorMsg('Google ile giriş başlatılamadı. Firebase yapılandırmasını ve yetkili hesabı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fb-dark flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-100">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-fb-yellow/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] rounded-full bg-fb-navy/30 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-3xl bg-fb-card border border-white/[0.08] relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="space-y-6 text-left">
          <div className="w-16 h-16 rounded-2xl bg-fb-yellow flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,210,31,0.25)]">
            <span className="text-fb-navy font-black text-3xl italic font-display">FE</span>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-display font-black text-white italic tracking-tight uppercase">Fenerbahçe Evreni Admin</h1>
            <p className="text-xs text-fb-muted max-w-sm mx-auto font-medium leading-relaxed">
              İçerik yönetim paneline yalnızca yetkili Google hesabıyla giriş yapabilirsiniz.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              role="alert"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left flex gap-3 items-start"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="block font-black mb-0.5">Giriş başarısız</strong>
                <span className="font-semibold">{errorMsg}</span>
              </div>
            </motion.div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_25px_rgba(255,210,31,0.15)] cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.53 5.53 0 0 1 8.5 13a5.53 5.53 0 0 1 5.49-5.514c2.25 0 4.135 1.132 5.163 3.018l3.764-2.181C21.037 4.708 17.75 3 13.99 3A9.99 9.99 0 0 0 4 13a9.99 9.99 0 0 0 9.99 10c6.043 0 9.914-4.108 9.914-10.05 0-.663-.075-1.285-.19-1.883H12.24Z"/>
            </svg>
            {loading ? 'GİRİŞ YAPILIYOR…' : 'GOOGLE İLE GİRİŞ YAP'}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold transition-all text-center underline underline-offset-4 decoration-white/20 hover:decoration-white/60 block cursor-pointer"
          >
            Fenerbahçe Evreni’ne Geri Dön
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-2 text-[10px] text-fb-muted font-bold justify-center">
          <KeyRound className="w-3.5 h-3.5 text-fb-yellow" aria-hidden="true" />
          <span>FIREBASE GÜVENLİ YETKİLENDİRME AKTİF</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
