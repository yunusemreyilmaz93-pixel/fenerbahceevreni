import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
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
    <section id="bulten" className="py-14 md:py-16 border-t border-[var(--fe-line-subtle)]">
      <div className="fe-container">
        <div className="max-w-4xl mx-auto fe-surface p-7 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-md text-left">
            <div className="fe-signal-heading !mb-1">
              <span className="fe-signal-dot" />
              <span className="fe-signal-line" />
              <span className="fe-signal-label">Bülten</span>
            </div>
            <h3
              className="text-xl md:text-2xl font-semibold text-[var(--fe-text-strong)] tracking-tight"
              style={{ fontFamily: 'var(--fe-font-editorial)' }}
            >
              Haftalık Fenerbahçe Evreni
            </h3>
            <p className="text-[13px] text-[var(--fe-text-muted)] leading-relaxed">
              Her Perşembe: taktik özeti, oyuncu notları ve transfer radarından seçilmiş
              başlıklar. Spam yok.
            </p>
            <p className="text-[11px] text-[var(--fe-text-faint)]">
              Kayıt olarak gizlilik metnini kabul etmiş olursun.
            </p>
          </div>

          <div className="shrink-0 w-full lg:w-72">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubscribe}
                  className="space-y-2.5 w-full text-left"
                >
                  <label className="block text-[12px] font-medium text-[var(--fe-text-muted)] mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-[var(--fe-radius-sm)] bg-[var(--fe-ink-950)] border border-[var(--fe-line)] text-[var(--fe-text-strong)] placeholder:text-[var(--fe-text-faint)] text-[14px] focus:outline-none focus:border-[var(--fe-yellow-400)] focus:shadow-[var(--fe-shadow-focus)] min-h-[44px]"
                  />
                  {errorText && (
                    <p className="text-[12px] text-[var(--fe-danger)]">{errorText}</p>
                  )}
                  <button type="submit" className="fe-btn-primary w-full">
                    Bültene katıl
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 fe-surface-inset text-center space-y-2"
                >
                  <CheckCircle2 className="w-7 h-7 text-[var(--fe-success)] mx-auto" aria-hidden />
                  <div className="text-sm font-semibold text-[var(--fe-text-strong)]">Kaydoldun</div>
                  <p className="text-[12px] text-[var(--fe-text-muted)] leading-relaxed">
                    Her Perşembe gelen kutunu kontrol et.
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
