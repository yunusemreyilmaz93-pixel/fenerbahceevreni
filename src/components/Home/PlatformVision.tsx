import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Users2 } from 'lucide-react';

const iconByIndex = [Sparkles, ShieldCheck, Users2];

const PLATFORM_METRICS = [
  {
    id: 'm1',
    value: '24/7',
    label: 'CANLI MAÇ DOSYASI',
    detail: 'Gündem, sakatlık ve muhtemel 11 içeriği tek merkezde.',
  },
  {
    id: 'm2',
    value: '300+',
    label: 'FRAKSİYON HARİTASI',
    detail: 'Taraftar kimliği ve topluluk haritası deneyimi.',
  },
  {
    id: 'm3',
    value: '5',
    label: 'ANA DENEYİM ALANI',
    detail: 'Maç merkezi, haber, video, anket, evren deneyimi.',
  },
] as const;

const PLATFORM_PILLARS = [
  {
    id: 'p1',
    title: 'CANLI VE GÜVENİLİR VERİ',
    description: 'Son güncelleme zamanı, kaynak şeffaflığı ve editör notlarıyla doğrulanabilir maç bilgisi.',
  },
  {
    id: 'p2',
    title: 'TOPLULUK MERKEZLİ DENEYİM',
    description: 'Anket, ruh hali ve etkileşim katmanlarıyla taraftarı sadece izleyen değil üreten hale getirir.',
  },
  {
    id: 'p3',
    title: 'TEK EKRANDA FUTBOL ZEKÂSI',
    description: 'Muhtemel 11, fikstür, ceza-sakatlık ve maç öncesi kritik içgörüleri tek akışta sunar.',
  },
] as const;

const PlatformVision: React.FC = () => {
  return (
    <section id="platform-vizyonu" className="py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10 text-center">
          <p className="intelligence-label mb-3 text-fb-yellow">WORLD CLASS ROADMAP</p>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
            DÜNYANIN EN İYİ TARAFTAR PLATFORMU
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Amaç sadece şık bir vitrin değil; güvenilir veri, aktif topluluk ve güçlü ürün akışının
            aynı ana sayfada birleşmesi.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLATFORM_METRICS.map((metric) => (
            <div key={metric.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-black text-fb-yellow">{metric.value}</p>
              <p className="mt-1 text-xs font-black tracking-[0.18em] text-white">{metric.label}</p>
              <p className="mt-2 text-sm text-slate-400">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {PLATFORM_PILLARS.map((pillar, index) => {
            const Icon = iconByIndex[index] ?? Sparkles;
            return (
              <motion.article
                key={pillar.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-white/10 bg-fb-navy/20 p-6"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-fb-yellow/15 text-fb-yellow">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-black text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{pillar.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformVision;
