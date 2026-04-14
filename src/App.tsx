import React, { useState, useMemo, useEffect } from 'react';
import { parseMarkdownToTree } from './lib/markdownParser';
import { enrichFactionData } from './lib/factionService';
import UniverseView from './components/UniverseView';
import HomePage from './components/Home/HomePage';
import Navbar from './components/Home/Navbar';
import { FactionNode } from './types';
import { AnimatePresence, motion } from 'motion/react';

// Using the full markdown provided by the user
const GALAXY_DATA = `
# Fenerbahçe
- Düz Fenerbahçeliler
- Balkan Lobisi
  - Yeni Nesil Balkancılar
    - Tadicciler
    - Dzekocular
    - Sandro Zuficciler
  - Dinozorbahçeli Balkancılar
    - Veselinovicciler
    - Stankovicciler
    - İvicciler
    - Kaloperovicciler
    - Baricciler
    - Gegicciler
- Hollanda Lobisi
  - Cocucular
  - Koemancılar
  - Hiddinkçiler
  - Advocaatcılar
  - RVPciler
- Macar Lobisi
  - Capellocular
  - Solskjaerciler
  - Terraneocular
  - Favreciler
- Rumen Lobisi
  - Trpisovskyciler
  - Neestrupçular
  - Teascacılar
  - Ionescucular
  - Datcucular
- Hacı İsmail Kartalcılar
  - Oldschool İsocular
  - Güçlendirilmiş İsmail Kartalcılar
  - Saran Lobisi
  - Sonradan İsocu Olanlar
  - Conceiçaocular
  - Portekiz Düşmanları
- Emre Bellocular
- Aykutçular
  - Dinozorbahçeli Aykutçular
  - Sad Edit Tayfa
- Basket Tayfa
  - Djordevicciler
  - Saraşçılar
  - Garnierciler
  - Spahijacılar
  - Obradovicciler
  - Tanjevicciler
- Portekiz Lobisi
  - Kahve Editçileri
  - Vitorcular
    - Scout Bahçeliler
    - RVP Düşmanları
  - Mourinhohcular
    - Foticiler
    - Wolves Sevdalıları
    - Wonderkid Fetişistleri
    - Küskünler
    - Global Moucular
    - Nuno Espirito Santocular
    - Jardımciler
  - Abel Ferreira’cılar
  - Fonsecacılar
  - Villas-Boasçılar
  - Jose Moraisciler
  - Amorimciler
  - Meirelesciler
- Jesusçular
  - Ziraat Edebiyatı Yapanlar
  - Avrupa Jesusçuları
- Ahrazbahçeliler
  - Apo Avcıcılar
  - Sergenciler
  - Terimciler
  - Şenolcular
  - Okancılar
  - Karam Tayfacılar
    - Murat Yakıncılar
    - Roland Kochçular
    - Arda Turancılar
    - Burak Yılmazcılar
    - Yaz Yıldırımcılar
    - Selçuk İnananlar
    - Di Matteocular
    - Hardcore Azizciler
  - GS Hocası İsteyenler
  - Samet Aybabacılar
  - Hakan Baltacılar
- Alman Ekolücüler
  - Yerli Düşmanları
  - Devin Özekçiler
  - Okan Özkancılar
  - Erol Bulutçular
  - Dinozorbahçeli Almancılar
    - Daumcular
    - Löwcüler
    - Lorantçılar
    - Labbadiacılar
    - Rangnickçiler
    - Klinsmanncılar
    - Hürcelerciler
    - Nagelsmancılar
  - Yeni Nesil Almancılar
    - Terzicçiler
    - Hoeneßçiler
    - Roseciler
    - Nuriciler
    - Schmidtçiler
    - Jaissleciler
- Ersuncular
  - Tahir Karapınarcılar
  - Derbiden Derbiye İzleyenler
  - Begiristancılar (Sportif Direktör Olarak)
  - Çobani Örgütü
  - Küskün Ersuncular
- Serdar Ali Çelikler Terör Örgütü
  - Hoca Yiyiciler
  - Dönerci Batıranlar
  - Aykut Düşmanları (Vardar Örgütü)
  - Buvaccılar (Balkan Lobisi)
  - Brendan Rodgersçılar
  - De Zerbiciler
- İsim Takıntılıları
  - Krossçular
  - Ten Hagcılar
  - Yabancı Olsun Da Hoca Fark Etmezciler
  - Postecoglucular
  - Avrupa Kupası Edebiyatçıları
  - Rafa Benitezciler
  - Xaviciler
  - Allegriciler
  - Mottacılar
  - Kloppçular
  - Ancelotticiler
  - Conteciler
  - Fergusoncular
  - Thomas Frankçılar
  - Kompanyciler
  - Marescacılar
  - Xabi Alonsocular
  - Simeoneciler
  - Zidanecılar
  - Pirlocular
  - Nestacılar
  - Unai Emeryciler
  - Gerrardcılar
  - Shevchenkocular
  - Wengerciler
- Ütopikçiler
  - Pepciler
  - Southgateciler
  - Tuchelciler
  - Luis Enriqueciler
  - Flickçiler
  - Guidetticiler
  - Santarelliciler
- Voleybol Tayfa
  - Velascocular
  - Bernardiciler
  - Rezendeciler
  - Lavariniciler
  - Kiralycılar
  - Yeon-Koungcular (Camia Evlatları)
  - Abbondanzacılar
  - Dişi Kanaryalar
    - Tedescocular (muhtemelen adını ilk kez dün duydular)
    - Üçlü Sevenler
    - Toshackcılar (Dinozorbahçeliler)
- Anadolu İrfanı
  - Yılmazcılar
  - Çağdaşçılar
  - Samiciler
  - Mesut Bakkalcılar
  - Tolunay Kafkasçılar
  - İsmet Taşdemirciler
  - Rizacılar
  - İlhancılar
  - Servetçiler
  - Hikmet Karamancılar
  - Fatih Tekkeciler
  - İrfan Buzcular
- Hırvat Lobisi
  - Slaven Bilicciler
  - Niko Kovaccılar
  - Hakan Keleşçiler
  - Recep Uçarcılar
  - Mustafa Reşit Akçaycılar
  - Prosineckiciler
  - Bjelicacılar
  - Dalicciler
  - Ünal Karamancılar
  - Ömer Erdoğancılar
  - Ertuğrul Sağlamcılar
  - Filipe Luisciler
  - Yakın Koşu Kavakçılar (343 Lobisi)
  - Şenol Çorlucular
  - Hüseyin Eroğlucular
  - Sinan Kaloğlucular
  - Osman Zeki Korkmazcılar
  - Tomasçılar (Hırvat Lobisi)
- Brezilya Lobisi
  - Oldschool Brezilyacılar
  - Carlos Alberto Parreiracılar
  - Lazaroniciler
  - Alexciler
  - Aureliocular
  - Spalletticiler
  - Didiciler
- Camia Evladcılar
  - Kuytçular (Hollanda Lobisi)
  - Bülentçiler
  - Tuncaycılar
  - Ümit Özatçılar
  - Selçuk Şahinciler
  - Mehmet Topalcılar
  - Oğuz Çetinciler
  - Volkancılar
  - Rıdvan Dilmenciler
  - Serhat Akıncılar
  - Gökhan Gönülcüler
  - Roberto Carloscular
  - Mert Nobreciler
  - Sowcular
  - Avrupa Zicocuları
  - Pozitif Futbol Sevenler
  - Zicocular
  - Deividciler
  - Titeciler
  - Hakan Kutlucular
  - Şenol Cancılar
  - Mustafa Kaplançılar (Ankaralılar)
  - Özhan Pulatcılar (FM Tayfa)
  - Önder Özenciler
  - Abdullah Ercancılar
  - Mehmet Topuzcular
  - Webocular
  - Müjdat Yetkinciler
  - Fatih Akyelciler
  - Ogüncüler
  - Mirkovicciler (Balkan Lobisi)
  - Engin İpekoğlucular
  - Murat Şahinciler
  - Rüştücüler
  - Ahmet Yıldırımcılar
  - Yusuf Şimşekçiler
  - Coşkun Demirbakancılar
  - Metin Diyadinciler
  - Oktay Derelioğlucular
  - Semih Şentürkçüler
  - Orhan Şamcılar
  - Abdülkerim Durmazcılar
  - Hasan Ali Kaldırımcılar
- Yabancı Anadolu Hocası İsteyenler
  - Şumudicacılar
  - Stoilovcular
  - Gisdolcüler
  - Feldkampçılar
  - Hagiciler
  - Osieckciler
  - Thomas Reisçiler
  - Jakirovicciler
  - Ömer Kanerciler
  - Tamer Güneyciler
  - Vengloscular
  - Kuntzcular
  - Lucescucular
- Arjantin Lobisi
  - Prandelliciler
  - Kluivertçiler
  - Omerovicciler
  - Stanojevicciler
  - Sassariniciler
  - Joao Pereiracılar
  - Leonardocular (Brezilya Lobisi)
  - Sampaoliciler
  - Gallardocular
  - Anselmiciler
  - Setienciler
  - Pellegriniciler
  - Farioliciler
- Milli Takım Hocası İsteyenler
  - Montellacılar
- Blancçılar
  - Fernando Santosçular (Gizli JK’liler)
  - Defanstan Kısa Pasla Çıkma Fetişistleri
  - Kenan Koçakçılar
  - Valverdeciler
  - Rambo Okancılar
  - Skibbeciler
- Ali Koççu Yahudi Lobisi
- Esporcular
  - 2017 Worldscüler
  - Nextgenciler
  - Emre Aksoycular
  - Arkheciler
  - Magathçılar
  - Clementçiler
- Finkçiler
  - Hütterciler
  - Futbolu Bırakıp Masa Tenisi İzleyenler
  - Vladimir Petkoviciler
  - Recep Karatepeciler
  - Sercan Terzioğlucular
- Manciniciler
  - Sarriciler
  - Gattusocular
  - Glasnerciler
  - Van Bronckhorstçular
  - Graham Pottercılar
  - Volkan Balcıcılar
  - İrfan Saraloğlucular
- Zemancılar
  - Mustafa Denizliciler
  - Aragonesciler (İsim Takıntılılar)
- Zeki Murat Göleciler
`;

import MatchCenter from './components/Home/MatchCenter';

import PredictorPage from './components/Predictor/PredictorPage';

export default function App() {
  const [view, setView] = useState<'home' | 'universe' | 'match-center' | 'news' | 'predictor'>('home');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const treeData = useMemo(() => {
    const basicTree = parseMarkdownToTree(GALAXY_DATA);
    return enrichFactionData(basicTree);
  }, []);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="bg-fb-dark min-h-screen">
      {/* Navbar is hidden in Universe view to avoid clutter as requested */}
      {view !== 'universe' && (
        <Navbar 
          currentView={view} 
          onNavigate={setView} 
          onStartQuiz={() => {
            setView('universe');
            setIsQuizOpen(true);
          }} 
        />
      )}

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HomePage 
              onEnterUniverse={() => setView('universe')} 
              onStartQuiz={() => {
                setView('universe');
                setIsQuizOpen(true);
              }} 
              onNavigate={setView}
            />
          </motion.div>
        )}
        {view === 'universe' && (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UniverseView 
              treeData={treeData} 
              isQuizOpen={isQuizOpen} 
              setIsQuizOpen={setIsQuizOpen} 
              onBack={() => setView('home')}
            />
          </motion.div>
        )}
        {view === 'match-center' && (
          <motion.div
            key="match-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-24"
          >
            <div className="container mx-auto px-6 py-12">
              <MatchCenter onNavigate={setView} />
              
              <div className="mt-12 bg-fb-navy/50 rounded-[2.5rem] border border-white/5 p-8">
                <h3 className="text-2xl font-black italic text-white mb-4 tracking-tight">DİĞER MAÇLAR</h3>
                <p className="text-slate-400">Fikstür ve geçmiş maç sonuçları çok yakında burada listelenecek.</p>
              </div>
            </div>
          </motion.div>
        )}
        {view === 'news' && (
          <motion.div
            key="news"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-24"
          >
            <div className="container mx-auto px-6 py-12">
              <h1 className="text-4xl font-black italic text-fb-yellow mb-8 tracking-tighter">HABERLER</h1>
              <div className="bg-fb-navy/50 rounded-[2.5rem] border border-white/5 p-8">
                <p className="text-slate-400">En güncel Fenerbahçe haberleri çok yakında burada.</p>
              </div>
            </div>
          </motion.div>
        )}
        {view === 'predictor' && (
          <motion.div
            key="predictor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-20"
          >
            <PredictorPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
