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
import MacMerkeziPage from './components/Home/MacMerkeziPage';
import PredictorPage from './components/Predictor/PredictorPage';
import { AnalysisPage } from './components/Home/AnalysisPage';
import { TransferRadarPage } from './components/Home/TransferRadarPage';
import { PlayersPage } from './components/Home/PlayersPage';
import { FanRoomPage } from './components/Home/FanRoomPage';
import { PremiumPage } from './components/Home/PremiumPage';
import { AboutPage } from './components/Home/AboutPage';
import { ContactPage } from './components/Home/ContactPage';
import BultenPage from './components/Home/BultenPage';
import PrivacyPage from './components/Home/PrivacyPage';
import TermsPage from './components/Home/TermsPage';
import CookiesPage from './components/Home/CookiesPage';
import KvkkPage from './components/Home/KvkkPage';
import NotFoundPage from './components/Home/NotFoundPage';
import CookieConsentBanner from './components/Home/CookieConsentBanner';
import { seedNewsletterSubscribersIfEmpty } from './lib/newsletterService';
import { latestArticles, transferTargets, playerPerformances, communityPoll } from './constants/mockData';
import { ShieldCheck, HelpCircle, Star, MessagesSquare, Sparkles, Send, Info, Calendar, BarChart3, AlertTriangle } from 'lucide-react';

import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminLayout } from './components/Admin/AdminLayout';
import { dbGetCollection } from './lib/dbService';
import { onAuthStateChangedAdmin, isAdminUserLoggedIn, getAdminUser, logoutAdmin, auth } from './lib/firebase';
import { isAdminEmail } from './lib/envHelper';

export default function App() {
  const [view, setView] = useState<'home' | 'universe' | 'match-center' | 'analysis' | 'transfer-radar' | 'players' | 'fan-room' | 'premium' | 'about' | 'contact' | 'predictor' | 'admin' | 'admin-login' | 'bulten' | 'privacy' | 'terms' | 'cookies' | 'kvkk' | '404'>('home');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [joinedPremium, setJoinedPremium] = useState(false);
  const [aboutMsg, setAboutMsg] = useState(false);

  // Secure Auth State Monitors
  const [authChecking, setAuthChecking] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Dynamic public CMS states
  const [articles, setArticles] = useState<any[]>([]);
  const [transferReports, setTransferReports] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [pollValue, setPollValue] = useState<any>(null);
  const [homeSettings, setHomeSettings] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  const treeData = useMemo(() => {
    const basicTree = parseMarkdownToTree(GALAXY_DATA);
    return enrichFactionData(basicTree);
  }, []);

  // Sync route param check and global state loading
  useEffect(() => {
    const fetchPublicCMS = async () => {
      try {
        await seedNewsletterSubscribersIfEmpty();
        
        const arts = await dbGetCollection('articles');
        setArticles(arts.length > 0 ? arts : latestArticles);

        const targets = await dbGetCollection('transferReports');
        setTransferReports(targets.length > 0 ? targets : transferTargets);

        const plyrs = await dbGetCollection('players');
        setPlayersList(plyrs.length > 0 ? plyrs : playerPerformances);

        const polls = await dbGetCollection('polls');
        const activePoll = polls.find((p: any) => p.status === 'active') || polls[0];
        setPollValue(activePoll || communityPoll);

        const homes = await dbGetCollection('homeSettings');
        const mainHome = homes.find(h => h.id === 'main');
        if (mainHome) setHomeSettings(mainHome);
      } catch (err) {
        console.error("Public CMS retrieval failed:", err);
        setArticles(latestArticles);
        setTransferReports(transferTargets);
        setPlayersList(playerPerformances);
        setPollValue(communityPoll);
      }
    };
    fetchPublicCMS();

    // Check URL Hash routing or param trigger for /admin access
    const checkHashRoute = async () => {
      const path = window.location.pathname + window.location.hash + window.location.search;
      if (path.includes('bulten') || path.includes('/bulten')) {
        setView('bulten');
        setAuthChecking(false);
      } else if (path.includes('gizlilik-politikasi') || path.includes('/privacy')) {
        setView('privacy');
        setAuthChecking(false);
      } else if (path.includes('kullanim-sartlari') || path.includes('/terms')) {
        setView('terms');
        setAuthChecking(false);
      } else if (path.includes('cerez-politikasi') || path.includes('/cookies')) {
        setView('cookies');
        setAuthChecking(false);
      } else if (path.includes('kvkk-aydinlatma-metni') || path.includes('/kvkk')) {
        setView('kvkk');
        setAuthChecking(false);
      } else if (path.includes('admin') || path.includes('/admin')) {
        setAuthChecking(true);
        const logged = await isAdminUserLoggedIn();
        if (logged) {
          const userObj = await getAdminUser();
          if (userObj && isAdminEmail(userObj.email)) {
            setAdminUser(userObj);
            setUnauthorized(false);
            setView('admin');
          } else if (userObj) {
            setUnauthorized(true);
            setAdminUser(null);
          } else {
            setUnauthorized(false);
            setView('admin-login');
          }
        } else {
          // Check if Firebase auth has user logged in but unauthorized
          const fbUser = auth ? auth.currentUser : null;
          if (fbUser && !isAdminEmail(fbUser.email)) {
            setUnauthorized(true);
          } else {
            setUnauthorized(false);
            setView('admin-login');
          }
        }
        setAuthChecking(false);
      } else {
        setAuthChecking(false);
      }
    };
    checkHashRoute();

    // Monitor Firebase Auth
    const unsubscribe = onAuthStateChangedAdmin((user) => {
      setAdminUser(user);
      setAuthChecking(false);
      if (user) {
        setUnauthorized(false);
        if (view === 'admin-login') {
          setView('admin');
        }
      } else {
        const fbUser = auth ? auth.currentUser : null;
        if (fbUser && !isAdminEmail(fbUser.email)) {
          setUnauthorized(true);
        } else {
          setUnauthorized(false);
        }
        if (view === 'admin') {
          setView('admin-login');
        }
      }
    });

    return () => unsubscribe();

  }, [view]);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Unified scroll handler for section routing
  const handleScrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="bg-fb-dark min-h-screen text-slate-100 font-sans">
      {/* Sticky Top Navigation */}
      {view !== 'universe' && view !== 'admin' && view !== 'admin-login' && (
        <Navbar 
          currentView={view} 
          onNavigate={(targetView) => {
            if (targetView === 'newsletter-section') {
              setView('home');
              handleScrollToSection('newsletter-section');
            } else {
              setView(targetView);
            }
          }}
          onScrollToSection={(sec) => {
            if (view === 'home') handleScrollToSection(sec);
          }}
          onStartQuiz={() => {
            setView('universe');
            setIsQuizOpen(true);
          }} 
        />
      )}

      <AnimatePresence mode="wait">
        {/* HOMEPAGE */}
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HomePage 
              onEnterUniverse={() => setView('universe')} 
              onStartQuiz={() => {
                setView('universe');
                setIsQuizOpen(true);
              }} 
              onNavigate={(targetView) => {
                if (targetView === 'newsletter-section') {
                  handleScrollToSection('newsletter-section');
                } else {
                  setView(targetView);
                }
              }}
              articles={articles}
              transferReports={transferReports}
              playersList={playersList}
              pollValue={pollValue}
              homeSettings={homeSettings}
            />
          </motion.div>
        )}

        {/* UNIVERSE VIEW: Interactive Factions Atlas */}
        {view === 'universe' && (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <UniverseView 
              treeData={treeData} 
              isQuizOpen={isQuizOpen} 
              setIsQuizOpen={setIsQuizOpen} 
              onBack={() => setView('home')}
            />
          </motion.div>
        )}

        {/* FEATURED MATCH CENTER */}
        {view === 'match-center' && (
          <motion.div
            key="match-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 text-left"
          >
            <div className="container mx-auto px-6 py-6">
              <MacMerkeziPage onNavigate={setView} />
            </div>
          </motion.div>
        )}

        {/* LATEST ANALYSIS PAGE */}
        {view === 'analysis' && (
          <AnalysisPage onNavigate={setView} />
        )}

        {/* SCOUT & TRANSFER RADAR PAGE */}
        {view === 'transfer-radar' && (
          <TransferRadarPage onNavigate={setView} />
        )}

        {/* PLAYER PERFORMANCE ZONE PAGE */}
        {view === 'players' && (
          <PlayersPage onNavigate={setView} />
        )}

        {/* COMMUNITY / TARAFTAR ODASI PAGE */}
        {view === 'fan-room' && (
          <motion.div
            key="fan-room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 text-left"
          >
            <FanRoomPage onNavigate={setView} />
          </motion.div>
        )}

        {/* PREMIUM MEMBERSHIP PAGE */}
        {view === 'premium' && (
          <motion.div
            key="premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 text-left"
          >
            <PremiumPage onNavigate={setView} />
          </motion.div>
        )}

        {/* ABOUT / HAKKINDA PAGE */}
        {view === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 text-left"
          >
            <AboutPage onNavigate={setView} />
          </motion.div>
        )}

        {/* CONTACT / İLETİŞİM PAGE */}
        {view === 'contact' && (
          <motion.div
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-28 text-left"
          >
            <ContactPage onNavigate={setView} />
          </motion.div>
        )}

        {/* BÜLTEN PAGE */}
        {view === 'bulten' && (
          <motion.div
            key="bulten"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BultenPage onNavigate={setView} />
          </motion.div>
        )}

        {/* CHAMPIONSHIP PREDICTOR */}
        {view === 'predictor' && (
          <motion.div
            key="predictor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-20"
          >
            <PredictorPage />
          </motion.div>
        )}

        {/* SECURE LOADING SCREEN FOR ADMIN CHECKS */}
        {authChecking && (view === 'admin' || view === 'admin-login') && (
          <div className="min-h-screen bg-fb-dark flex flex-col items-center justify-center p-6 text-slate-100 uppercase tracking-wider font-bold">
            <div className="w-10 h-10 border-4 border-fb-yellow border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-sm font-black text-fb-yellow">Yetki kontrol ediliyor...</div>
          </div>
        )}

        {/* UNAUTHORIZED SCREEN */}
        {unauthorized && !authChecking && (view === 'admin' || view === 'admin-login') && (
          <div className="min-h-screen bg-fb-dark flex flex-col items-center justify-center p-6 text-slate-100 text-center font-sans">
            <ShieldCheck className="w-16 h-16 text-rose-500 mb-4 animate-pulse shrink-0 bg-transparent" />
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide mb-2">YETKİSİZ ERİŞİM</h2>
            <p className="text-xs text-fb-muted max-w-sm mb-6 font-semibold leading-relaxed">
              Bu alana erişim yetkiniz yok.
            </p>
            <button
              onClick={() => {
                setUnauthorized(false);
                setView('home');
              }}
              className="px-6 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_25px_rgba(255,210,31,0.15)]"
            >
              Ana Sayfaya Dön
            </button>
            <button
              onClick={async () => {
                await logoutAdmin();
                setAdminUser(null);
                setUnauthorized(false);
                setView('admin-login');
              }}
              className="mt-4 text-xs text-slate-400 hover:text-white font-bold transition-all underline underline-offset-4 cursor-pointer"
            >
              Yönetici Giriş Sayfasına Dön
            </button>
          </div>
        )}

        {/* SECURE ADMIN LOGIN PANEL */}
        {!authChecking && !unauthorized && view === 'admin-login' && (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminLogin 
              onLoginSuccess={(user) => {
                setAdminUser(user);
                setView('admin');
              }}
              onBackToSite={() => setView('home')}
              onNavigate={setView}
            />
          </motion.div>
        )}

        {/* LIVE ADMINISTRATION CMS CONSOLE */}
        {!authChecking && !unauthorized && view === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminLayout 
              adminUser={adminUser}
              onLogout={async () => {
                await logoutAdmin();
                setAdminUser(null);
                setView('home');
              }}
              onExitAdmin={() => setView('home')}
            />
          </motion.div>
        )}
        {/* LEGAL: GİZLİLİK POLİTİKASI */}
        {view === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PrivacyPage onNavigate={setView} />
          </motion.div>
        )}

        {/* LEGAL: KULLANIM ŞARTLARI */}
        {view === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TermsPage onNavigate={setView} />
          </motion.div>
        )}

        {/* LEGAL: ÇEREZ POLİTİKASI */}
        {view === 'cookies' && (
          <motion.div
            key="cookies"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CookiesPage onNavigate={setView} />
          </motion.div>
        )}

        {/* LEGAL: KVKK AYDINLATMA METNİ */}
        {view === 'kvkk' && (
          <motion.div
            key="kvkk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <KvkkPage onNavigate={setView} />
          </motion.div>
        )}

        {/* 404 NOT FOUND */}
        {view === '404' && (
          <motion.div
            key="404"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <NotFoundPage onNavigate={setView} />
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'admin' && view !== 'admin-login' && (
        <CookieConsentBanner onNavigate={setView} />
      )}
    </div>
  );
}

