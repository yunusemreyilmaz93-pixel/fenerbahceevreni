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
    <section id="bulten" className="py-16 md:py-20 border-t border-white/[0.05] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 w-full">
        <div className="max-w-5xl mx-auto rounded-2xl ui-surface p-8 md:p-12 text-center md:text-left flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px ui-hairline opacity-70" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-fb-yellow/[0.04] rounded-full blur-[80px] pointer-events-none" />

          <div className="space-y-5 max-w-xl text-left relative z-10">
            <div className="flex items-center gap-2 text-fb-yellow">
              <Mail className="w-4 h-4 shrink-0" aria-hidden />
              <span className="text-[12px] font-semibold tracking-wide">Haftalık bülten</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              Fenerbahçe Evreni bülteni
            </h3>

            <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
              Her Perşembe: taktik özetleri, oyuncu notları ve transfer radarından seçilmiş
              başlıklar — gelen kutuna.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { txt: 'Haftalık raporlar', ico: FileText },
                { txt: 'Transfer özetleri', ico: Compass },
                { txt: 'Maç analizleri', ico: Kanban },
              ].map((ind) => (
                <div
                  key={ind.txt}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <ind.ico className="w-4 h-4 text-fb-yellow shrink-0" aria-hidden />
                  <span className="text-[12px] font-semibold text-slate-200">{ind.txt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full lg:w-80">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubscribe}
                  className="space-y-3 w-full text-left"
                >
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="E-posta adresin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0e18] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-fb-yellow text-[13px] font-medium focus:ring-1 focus:ring-fb-yellow"
                    />
                    {errorText && (
                      <p className="text-[12px] font-medium text-rose-400 mt-1.5 pl-1">{errorText}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-fb-yellow hover:bg-white text-fb-dark font-bold text-[13px] rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Bültene katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center flex flex-col items-center gap-2"
                >
                  <CheckCircle2 className="w-8 h-8 mb-1" aria-hidden />
                  <div className="text-sm font-bold">Kaydoldun</div>
                  <p className="text-slate-300 text-[12px] font-medium leading-relaxed">
                    Analiz listemize eklendin. Her Perşembe gelen kutunu kontrol et.
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
