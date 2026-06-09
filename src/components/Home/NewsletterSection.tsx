import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, FileText, Compass, Kanban } from 'lucide-react';
import { subscribeToNewsletter } from '../../lib/newsletterService';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setErrorText('');
    try {
      const res = await subscribeToNewsletter(email, '', 'homepage');
      if (res.success) {
        setSubscribed(true);
      } else {
        setErrorText(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorText('Teknik bir sorun oluştu.');
    }
  };

  return (
    <section id="bulten" className="py-24 bg-[#090D16] border-t border-white/[0.03] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        
        {/* Main Box Wrapper */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#111625] border border-white/[0.08] p-8 md:p-14 text-center md:text-left flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD21F]/[0.02] rounded-full blur-[80px] pointer-events-none" />

          {/* Texts & Trust Indicators (Left) */}
          <div className="space-y-6 max-w-xl text-left relative z-10">
            <div className="flex items-center gap-2 text-[#FFD21F]">
              <Mail className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">E-POSTA RAPOR DEPARTMANI</span>
            </div>
            
            <h3 className="text-2xl md:text-4xl font-display font-black text-white uppercase tracking-tight italic">
              Haftalık Fenerbahçe Evreni Bülteni
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Her Perşembe sabahı kilit taktik raporları, oyuncu performans setlerini ve transfer radar özetlerini doğrudan gelen kutunuzda arşivleyin.
            </p>

            {/* Horizontal Trust Indicators list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { txt: 'Haftalık Raporlar', ico: FileText },
                { txt: 'Transfer Özetleri', ico: Compass },
                { txt: 'Maç Analizleri', ico: Kanban }
              ].map((ind, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#0B0F19]/65 border border-white/[0.03]">
                  <ind.ico className="w-4 h-4 text-[#FFD21F] shrink-0" />
                  <span className="text-[10px] font-black text-white uppercase font-mono">{ind.txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form & Actions (Right) */}
          <div className="relative z-10 shrink-0 w-full lg:w-80">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="form"
                  onSubmit={handleSubscribe}
                  className="space-y-3.5 w-full text-left"
                >
                  <div>
                    <input 
                      type="email" 
                      required
                      placeholder="E-posta adresin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-[#0B0F19] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FFD21F] text-xs font-semibold focus:ring-1 focus:ring-[#FFD21F]"
                    />
                    {errorText && (
                      <p className="text-[10px] font-black text-rose-400 mt-1.5 pl-1 font-mono uppercase">{errorText}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FFD21F] hover:bg-white text-[#0B0F19] font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
                  >
                    Bültene Katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-[#3DDC97]/10 border border-[#3DDC97]/20 text-[#3DDC97] text-xs font-bold space-y-3 text-center flex flex-col items-center"
                >
                  <CheckCircle2 className="w-9 h-9 text-[#3DDC97] mb-1" />
                  <div className="text-sm font-black uppercase tracking-wider font-mono">Kaydoldun! 🎉</div>
                  <p className="text-slate-300 text-[11px] font-semibold leading-relaxed">
                    Analiz listemize başarıyla eklendin. Her Perşembe gelen kutunu mutlaka kontrol et!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
