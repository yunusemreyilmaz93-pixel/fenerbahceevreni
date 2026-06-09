import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Check, Send } from 'lucide-react';

const PremiumSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [joinedList, setJoinedList] = useState(false);

  const handleJoinList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setJoinedList(true);
  };

  return (
    <section id="premium" className="py-24 bg-fb-dark relative overflow-hidden">
      {/* Radiant glow overlays for premium feeling */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-fb-yellow/[0.03] rounded-full blur-[140px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-fb-card to-fb-dark border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-8 md:p-12 relative">
          
          {/* Top premium badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-fb-yellow to-amber-500 border border-fb-yellow flex items-center gap-1.5 shadow-[0_4px_20px_rgba(255,210,31,0.3)]">
            <Sparkles className="w-4 h-4 text-fb-navy fill-current" />
            <span className="text-[10px] font-black uppercase text-fb-navy tracking-widest">
              FENERBAHÇE EVRENİ PREMİUM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center pt-4">
            
            {/* Benefits block (Left) */}
            <div className="md:col-span-7 text-left space-y-6">
              <h3 className="text-3xl md:text-4xl font-display font-black text-white leading-tight">
                Fenerbahçe’yi Derinden Keşfet.
              </h3>
              <p className="text-fb-muted text-sm leading-relaxed">
                Daha derin maç raporları, transfer analizleri, rakip değerlendirmeleri ve haftalık özel bültenlerle Fenerbahçe’yi daha yakından takip et.
              </p>

              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Detaylı Maç Raporları",
                  "Transfer Radar Dosyaları",
                  "Rakip Analizleri",
                  "Haftalık Özel Bülten",
                  "Premium Topluluk Erişimi",
                  "PDF Analiz Arşivi"
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-fb-yellow/10 border border-fb-yellow/30 flex items-center justify-center text-fb-yellow shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing list / Signup (Right) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-6">
              <div>
                <span className="text-[10px] text-fb-muted font-black tracking-widest uppercase">AYLIK ÜYELİK</span>
                <div className="text-4xl font-black italic text-fb-yellow mt-2">YAKINDA</div>
                <p className="text-xs text-fb-muted font-medium mt-2">
                  Lansman öncesi bekleme listesine katılarak özel indirim kodları kazan.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!joinedList ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleJoinList}
                    className="space-y-3"
                  >
                    <input 
                      type="email" 
                      required
                      placeholder="E-posta adresin"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-fb-dark border border-white/10 text-white placeholder:text-fb-muted focus:outline-none focus:border-fb-yellow text-sm font-semibold text-center"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,210,31,0.2)]"
                    >
                      <span>Bekleme Listesine Katıl</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold space-y-2"
                  >
                    <div className="text-sm font-black">Sıraya Alındınız! ✨</div>
                    <p className="text-fb-muted leading-relaxed font-semibold">
                      Harika seçim! Premium listesi açıldığında ve analiz kitapçığımız yayına girdiğinde ilk haberdar olan sen olacaksın.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
