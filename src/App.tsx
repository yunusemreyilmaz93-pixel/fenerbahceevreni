import React, { useState, useMemo, useEffect } from 'react';
import { parseMarkdownToTree } from './lib/markdownParser';
import { enrichFactionData } from './lib/factionService';
import TreeVisualization from './components/TreeVisualization';
import FactionDetail from './components/FactionDetail';
import QuizContainer from './components/Quiz/QuizContainer';
import Sidebar from './components/Sidebar';
import { FactionNode } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { toTurkishUppercase } from './lib/stringUtils';

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

export default function App() {
  const [selectedFaction, setSelectedFaction] = useState<FactionNode | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoomToNodeId, setZoomToNodeId] = useState<string | null>(null);

  const treeData = useMemo(() => {
    const basicTree = parseMarkdownToTree(GALAXY_DATA);
    return enrichFactionData(basicTree);
  }, []);

  const handleSelectFaction = (node: FactionNode) => {
    setSelectedFaction(node);
    setZoomToNodeId(node.id);
    // Reset zoomToNodeId after a delay so it can be triggered again
    setTimeout(() => setZoomToNodeId(null), 1500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-fb-dark">
      {/* Galaxy Background Elements */}
      <div className="absolute inset-0 galaxy-bg" />
      <div className="absolute inset-0 stars-overlay" />
      
      {/* Main Header - Optimized for Mobile */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none w-full px-4"
      >
        <h1 className="galaxy-title fb-gradient-text text-3xl md:text-5xl lg:text-6xl">{toTurkishUppercase('Fenerbahçe Evreni')}</h1>
      </motion.header>

      {/* Sidebar with Hierarchy Menu */}
      <Sidebar 
        data={treeData} 
        onSelectFaction={handleSelectFaction}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Quiz Trigger Button */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 100 }}
        className="absolute bottom-8 right-8 z-40"
      >
        <button
          onClick={() => setIsQuizOpen(true)}
          className="group relative flex items-center gap-4 p-1 pr-6 rounded-full bg-fb-navy/80 backdrop-blur-md border border-fb-yellow/30 hover:border-fb-yellow transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <div className="w-12 h-12 rounded-full bg-fb-yellow flex items-center justify-center shadow-[0_0_20px_rgba(254,221,0,0.3)] group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-fb-navy fill-fb-navy" />
          </div>
          <div className="text-left">
            <span className="intelligence-label text-fb-yellow text-[8px] block leading-none mb-1">KİMLİK ANALİZİ</span>
            <span className="text-xs font-black text-white uppercase tracking-tighter">HANGİ FRAKSİYONDASIN?</span>
          </div>
        </button>
      </motion.div>

      {/* Visualization Layer */}
      <div className="absolute inset-0 z-10">
        {/* Credit Card */}
        <div className="fixed top-6 right-6 z-30 hidden md:block">
          <div className="bg-white p-5 rounded-2xl border-2 border-fb-yellow shadow-[0_0_30px_rgba(254,221,0,0.3)] max-w-[300px] space-y-3">
            <p className="text-[14px] text-fb-navy font-black uppercase tracking-tight leading-tight">
              @caglarnefreti'nin fraksiyon görseli temel alınarak hazırlanmıştır.
            </p>
            <div className="h-0.5 bg-fb-navy/10 w-full" />
            <div className="space-y-1">
              <p className="text-[14px] text-fb-navy font-bold">
                Hazırlayan: <span className="font-black text-fb-accent">Yunus Emre YILMAZ</span>
              </p>
              <a 
                href="https://x.com/BasitBiOyun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[14px] text-fb-accent font-black hover:underline flex items-center gap-1 transition-all"
              >
                x.com/basitbioyun
              </a>
            </div>
          </div>
        </div>

        <TreeVisualization
          data={treeData}
          onNodeClick={setSelectedFaction}
          selectedNodeId={selectedFaction?.id}
          zoomToNodeId={zoomToNodeId}
        />
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedFaction && (
          <FactionDetail
            faction={selectedFaction}
            onClose={() => setSelectedFaction(null)}
            onFactionClick={(name) => {
              const findNode = (node: FactionNode): FactionNode | null => {
                if (node.name === name) return node;
                if (node.children) {
                  for (const child of node.children) {
                    const found = findNode(child);
                    if (found) return found;
                  }
                }
                return null;
              };
              const target = findNode(treeData);
              if (target) handleSelectFaction(target);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quiz Overlay */}
      <AnimatePresence>
        {isQuizOpen && (
          <QuizContainer 
            onClose={() => setIsQuizOpen(false)} 
            onExplore={(factionName) => {
              const findNode = (node: FactionNode): FactionNode | null => {
                if (node.name === factionName) return node;
                if (node.children) {
                  for (const child of node.children) {
                    const found = findNode(child);
                    if (found) return found;
                  }
                }
                return null;
              };
              const target = findNode(treeData);
              if (target) {
                handleSelectFaction(target);
                setIsQuizOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient Overlays */}
      <div className="absolute inset-0 vignette pointer-events-none z-20" />
    </div>
  );
}
