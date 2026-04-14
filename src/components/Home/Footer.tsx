
import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Twitter, Youtube, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-fb-dark pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <h2 className="galaxy-title text-3xl mb-6 fb-gradient-text">FENERBAHÇE EVRENİ</h2>
            <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
              Fenerbahçe taraftar kültürünü dijital dünyada yeniden tanımlıyoruz. 
              Fraksiyonlar, analizler ve etkileşimli deneyimlerle sarı lacivert sevdayı her an yaşıyoruz.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-fb-yellow hover:text-fb-navy transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">PLATFORM</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Evren Haritası</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Fraksiyon Testi</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Maç Merkezi</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Haberler</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">KURUMSAL</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">İletişim</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Gizlilik Politikası</a></li>
              <li><a href="#" className="hover:text-fb-yellow transition-colors">Kullanım Şartları</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            © 2026 FENERBAHÇE EVRENİ. TÜM HAKLARI SAKLIDIR.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            TASARIM VE GELİŞTİRME: <span className="text-fb-yellow">YUNUS EMRE YILMAZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
