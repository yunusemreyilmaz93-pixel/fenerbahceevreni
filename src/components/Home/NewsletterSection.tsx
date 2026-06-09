import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2 } from 'lucide-react';
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
    <section id="newsletter-section" className="py-20 bg-fb-dark/40 border-t border-white/[0.04] relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-fb-card border border-white/[0.06] p-8 md:p-12 text-center flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-fb-yellow/5 rounded-full blur-[70px] pointer-events-none" />

          {/* Texts (Left) */}
          <div className="text-left space-y-3 relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-fb-yellow">
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">E-Posta Analiz Gazetesi</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight italic">
              Haftalık Fenerbahçe Evreni Bülteni
            </h3>
            <p className="text-xs text-fb-muted leading-relaxed font-semibold">
              Her hafta kilit maç notları, transfer değerlendirmeleri, Opta taktik veri setleri ve öne çıkan taraftar analizlerini doğrudan gelen kutuna gönderelim.
            </p>
          </div>

          {/* Form (Right) */}
          <div className="relative z-10 shrink-0 w-full md:w-80">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="form"
                  onSubmit={handleSubscribe}
                  className="space-y-3 w-full"
                >
                  <input 
                    type="email" 
                    required
                    placeholder="E-posta adresin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg bg-fb-dark border border-white/10 text-white placeholder:text-fb-muted focus:outline-none focus:border-fb-yellow text-xs font-semibold"
                  />
                  {errorText && (
                    <p className="text-[10px] font-black text-rose-400 text-left pl-1">{errorText}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_20px_rgba(255,210,31,0.2)]"
                  >
                    Bültene Katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-[#3DDC97]/10 border border-[#3DDC97]/30 text-[#3DDC97] text-xs font-bold space-y-2 text-center flex flex-col items-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-[#3DDC97] mb-1" />
                  <div className="text-sm font-black">Bültene Kaydoldun! 🎉</div>
                  <p className="text-fb-muted text-[11px] font-semibold">
                    Analiz listemize sırayla eklendin. Her Perşembe gelen kutunu mutlaka kontrol et!
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
