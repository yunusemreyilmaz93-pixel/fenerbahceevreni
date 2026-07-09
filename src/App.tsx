import React, { useState, useMemo, useEffect, useRef } from 'react';
import { viewToPath, pathToView, pathSubSlug } from './lib/routing';
import { parseMarkdownToTree } from './lib/markdownParser';
import { enrichFactionData } from './lib/factionService';
const UniverseView = React.lazy(() => import('./components/UniverseView'));
import HomePage from './components/Home/HomePage';
import Navbar from './components/Home/Navbar';
import { FactionNode } from './types';
import { AnimatePresence, motion } from 'motion/react';

// Using the full markdown provided by the user
const GALAXY_DATA = `
# FenerbahÃ§e
- DÃ¼z FenerbahÃ§eliler
- Balkan Lobisi
  - Yeni Nesil BalkancÄ±lar
    - Tadicciler
    - Dzekocular
    - Sandro Zuficciler
  - DinozorbahÃ§eli BalkancÄ±lar
    - Veselinovicciler
    - Stankovicciler
    - Ä°vicciler
    - Kaloperovicciler
    - Baricciler
    - Gegicciler
- Hollanda Lobisi
  - Cocucular
  - KoemancÄ±lar
  - HiddinkÃ§iler
  - AdvocaatcÄ±lar
  - RVPciler
- Macar Lobisi
  - Capellocular
  - Solskjaerciler
  - Terraneocular
  - Favreciler
- Rumen Lobisi
  - Trpisovskyciler
  - NeestrupÃ§ular
  - TeascacÄ±lar
  - Ionescucular
  - Datcucular
- HacÄ± Ä°smail KartalcÄ±lar
  - Oldschool Ä°socular
  - GÃ¼Ã§lendirilmiÅŸ Ä°smail KartalcÄ±lar
  - Saran Lobisi
  - Sonradan Ä°socu Olanlar
  - ConceiÃ§aocular
  - Portekiz DÃ¼ÅŸmanlarÄ±
- Emre Bellocular
- AykutÃ§ular
  - DinozorbahÃ§eli AykutÃ§ular
  - Sad Edit Tayfa
- Basket Tayfa
  - Djordevicciler
  - SaraÅŸÃ§Ä±lar
  - Garnierciler
  - SpahijacÄ±lar
  - Obradovicciler
  - Tanjevicciler
- Portekiz Lobisi
  - Kahve EditÃ§ileri
  - Vitorcular
    - Scout BahÃ§eliler
    - RVP DÃ¼ÅŸmanlarÄ±
  - Mourinhohcular
    - Foticiler
    - Wolves SevdalÄ±larÄ±
    - Wonderkid FetiÅŸistleri
    - KÃ¼skÃ¼nler
    - Global Moucular
    - Nuno Espirito Santocular
    - JardÄ±mciler
  - Abel Ferreiraâ€™cÄ±lar
  - FonsecacÄ±lar
  - Villas-BoasÃ§Ä±lar
  - Jose Moraisciler
  - Amorimciler
  - Meirelesciler
- JesusÃ§ular
  - Ziraat EdebiyatÄ± Yapanlar
  - Avrupa JesusÃ§ularÄ±
- AhrazbahÃ§eliler
  - Apo AvcÄ±cÄ±lar
  - Sergenciler
  - Terimciler
  - Åenolcular
  - OkancÄ±lar
  - Karam TayfacÄ±lar
    - Murat YakÄ±ncÄ±lar
    - Roland KochÃ§ular
    - Arda TurancÄ±lar
    - Burak YÄ±lmazcÄ±lar
    - Yaz YÄ±ldÄ±rÄ±mcÄ±lar
    - SelÃ§uk Ä°nananlar
    - Di Matteocular
    - Hardcore Azizciler
  - GS HocasÄ± Ä°steyenler
  - Samet AybabacÄ±lar
  - Hakan BaltacÄ±lar
- Alman EkolÃ¼cÃ¼ler
  - Yerli DÃ¼ÅŸmanlarÄ±
  - Devin Ã–zekÃ§iler
  - Okan Ã–zkancÄ±lar
  - Erol BulutÃ§ular
  - DinozorbahÃ§eli AlmancÄ±lar
    - Daumcular
    - LÃ¶wcÃ¼ler
    - LorantÃ§Ä±lar
    - LabbadiacÄ±lar
    - RangnickÃ§iler
    - KlinsmanncÄ±lar
    - HÃ¼rcelerciler
    - NagelsmancÄ±lar
  - Yeni Nesil AlmancÄ±lar
    - TerzicÃ§iler
    - HoeneÃŸÃ§iler
    - Roseciler
    - Nuriciler
    - SchmidtÃ§iler
    - Jaissleciler
- Ersuncular
  - Tahir KarapÄ±narcÄ±lar
  - Derbiden Derbiye Ä°zleyenler
  - BegiristancÄ±lar (Sportif DirektÃ¶r Olarak)
  - Ã‡obani Ã–rgÃ¼tÃ¼
  - KÃ¼skÃ¼n Ersuncular
- Serdar Ali Ã‡elikler TerÃ¶r Ã–rgÃ¼tÃ¼
  - Hoca Yiyiciler
  - DÃ¶nerci BatÄ±ranlar
  - Aykut DÃ¼ÅŸmanlarÄ± (Vardar Ã–rgÃ¼tÃ¼)
  - BuvaccÄ±lar (Balkan Lobisi)
  - Brendan RodgersÃ§Ä±lar
  - De Zerbiciler
- Ä°sim TakÄ±ntÄ±lÄ±larÄ±
  - KrossÃ§ular
  - Ten HagcÄ±lar
  - YabancÄ± Olsun Da Hoca Fark Etmezciler
  - Postecoglucular
  - Avrupa KupasÄ± EdebiyatÃ§Ä±larÄ±
  - Rafa Benitezciler
  - Xaviciler
  - Allegriciler
  - MottacÄ±lar
  - KloppÃ§ular
  - Ancelotticiler
  - Conteciler
  - Fergusoncular
  - Thomas FrankÃ§Ä±lar
  - Kompanyciler
  - MarescacÄ±lar
  - Xabi Alonsocular
  - Simeoneciler
  - ZidanecÄ±lar
  - Pirlocular
  - NestacÄ±lar
  - Unai Emeryciler
  - GerrardcÄ±lar
  - Shevchenkocular
  - Wengerciler
- ÃœtopikÃ§iler
  - Pepciler
  - Southgateciler
  - Tuchelciler
  - Luis Enriqueciler
  - FlickÃ§iler
  - Guidetticiler
  - Santarelliciler
- Voleybol Tayfa
  - Velascocular
  - Bernardiciler
  - Rezendeciler
  - Lavariniciler
  - KiralycÄ±lar
  - Yeon-Koungcular (Camia EvlatlarÄ±)
  - AbbondanzacÄ±lar
  - DiÅŸi Kanaryalar
    - Tedescocular (muhtemelen adÄ±nÄ± ilk kez dÃ¼n duydular)
    - ÃœÃ§lÃ¼ Sevenler
    - ToshackcÄ±lar (DinozorbahÃ§eliler)
- Anadolu Ä°rfanÄ±
  - YÄ±lmazcÄ±lar
  - Ã‡aÄŸdaÅŸÃ§Ä±lar
  - Samiciler
  - Mesut BakkalcÄ±lar
  - Tolunay KafkasÃ§Ä±lar
  - Ä°smet TaÅŸdemirciler
  - RizacÄ±lar
  - Ä°lhancÄ±lar
  - ServetÃ§iler
  - Hikmet KaramancÄ±lar
  - Fatih Tekkeciler
  - Ä°rfan Buzcular
- HÄ±rvat Lobisi
  - Slaven Bilicciler
  - Niko KovaccÄ±lar
  - Hakan KeleÅŸÃ§iler
  - Recep UÃ§arcÄ±lar
  - Mustafa ReÅŸit AkÃ§aycÄ±lar
  - Prosineckiciler
  - BjelicacÄ±lar
  - Dalicciler
  - Ãœnal KaramancÄ±lar
  - Ã–mer ErdoÄŸancÄ±lar
  - ErtuÄŸrul SaÄŸlamcÄ±lar
  - Filipe Luisciler
  - YakÄ±n KoÅŸu KavakÃ§Ä±lar (343 Lobisi)
  - Åenol Ã‡orlucular
  - HÃ¼seyin EroÄŸlucular
  - Sinan KaloÄŸlucular
  - Osman Zeki KorkmazcÄ±lar
  - TomasÃ§Ä±lar (HÄ±rvat Lobisi)
- Brezilya Lobisi
  - Oldschool BrezilyacÄ±lar
  - Carlos Alberto ParreiracÄ±lar
  - Lazaroniciler
  - Alexciler
  - Aureliocular
  - Spalletticiler
  - Didiciler
- Camia EvladcÄ±lar
  - KuytÃ§ular (Hollanda Lobisi)
  - BÃ¼lentÃ§iler
  - TuncaycÄ±lar
  - Ãœmit Ã–zatÃ§Ä±lar
  - SelÃ§uk Åahinciler
  - Mehmet TopalcÄ±lar
  - OÄŸuz Ã‡etinciler
  - VolkancÄ±lar
  - RÄ±dvan Dilmenciler
  - Serhat AkÄ±ncÄ±lar
  - GÃ¶khan GÃ¶nÃ¼lcÃ¼ler
  - Roberto Carloscular
  - Mert Nobreciler
  - Sowcular
  - Avrupa ZicocularÄ±
  - Pozitif Futbol Sevenler
  - Zicocular
  - Deividciler
  - Titeciler
  - Hakan Kutlucular
  - Åenol CancÄ±lar
  - Mustafa KaplanÃ§Ä±lar (AnkaralÄ±lar)
  - Ã–zhan PulatcÄ±lar (FM Tayfa)
  - Ã–nder Ã–zenciler
  - Abdullah ErcancÄ±lar
  - Mehmet Topuzcular
  - Webocular
  - MÃ¼jdat Yetkinciler
  - Fatih Akyelciler
  - OgÃ¼ncÃ¼ler
  - Mirkovicciler (Balkan Lobisi)
  - Engin Ä°pekoÄŸlucular
  - Murat Åahinciler
  - RÃ¼ÅŸtÃ¼cÃ¼ler
  - Ahmet YÄ±ldÄ±rÄ±mcÄ±lar
  - Yusuf ÅimÅŸekÃ§iler
  - CoÅŸkun DemirbakancÄ±lar
  - Metin Diyadinciler
  - Oktay DerelioÄŸlucular
  - Semih ÅentÃ¼rkÃ§Ã¼ler
  - Orhan ÅamcÄ±lar
  - AbdÃ¼lkerim DurmazcÄ±lar
  - Hasan Ali KaldÄ±rÄ±mcÄ±lar
- YabancÄ± Anadolu HocasÄ± Ä°steyenler
  - ÅumudicacÄ±lar
  - Stoilovcular
  - GisdolcÃ¼ler
  - FeldkampÃ§Ä±lar
  - Hagiciler
  - Osieckciler
  - Thomas ReisÃ§iler
  - Jakirovicciler
  - Ã–mer Kanerciler
  - Tamer GÃ¼neyciler
  - Vengloscular
  - Kuntzcular
  - Lucescucular
- Arjantin Lobisi
  - Prandelliciler
  - KluivertÃ§iler
  - Omerovicciler
  - Stanojevicciler
  - Sassariniciler
  - Joao PereiracÄ±lar
  - Leonardocular (Brezilya Lobisi)
  - Sampaoliciler
  - Gallardocular
  - Anselmiciler
  - Setienciler
  - Pellegriniciler
  - Farioliciler
- Milli TakÄ±m HocasÄ± Ä°steyenler
  - MontellacÄ±lar
- BlancÃ§Ä±lar
  - Fernando SantosÃ§ular (Gizli JKâ€™liler)
  - Defanstan KÄ±sa Pasla Ã‡Ä±kma FetiÅŸistleri
  - Kenan KoÃ§akÃ§Ä±lar
  - Valverdeciler
  - Rambo OkancÄ±lar
  - Skibbeciler
- Ali KoÃ§Ã§u Yahudi Lobisi
- Esporcular
  - 2017 WorldscÃ¼ler
  - Nextgenciler
  - Emre Aksoycular
  - Arkheciler
  - MagathÃ§Ä±lar
  - ClementÃ§iler
- FinkÃ§iler
  - HÃ¼tterciler
  - Futbolu BÄ±rakÄ±p Masa Tenisi Ä°zleyenler
  - Vladimir Petkoviciler
  - Recep Karatepeciler
  - Sercan TerzioÄŸlucular
- Manciniciler
  - Sarriciler
  - Gattusocular
  - Glasnerciler
  - Van BronckhorstÃ§ular
  - Graham PottercÄ±lar
  - Volkan BalcÄ±cÄ±lar
  - Ä°rfan SaraloÄŸlucular
- ZemancÄ±lar
  - Mustafa Denizliciler
  - Aragonesciler (Ä°sim TakÄ±ntÄ±lÄ±lar)
- Zeki Murat GÃ¶leciler
`;

import MatchCenter from './components/Home/MatchCenter';
import MacMerkeziPage from './components/Home/MacMerkeziPage';
const PredictorPage = React.lazy(() => import('./components/Predictor/PredictorPage'));
import { AnalysisPage } from './components/Home/AnalysisPage';
import { TransferRadarPage } from './components/Home/TransferRadarPage';
import { PlayersPage } from './components/Home/PlayersPage';
import { FanRoomPage } from './components/Home/FanRoomPage';
import { AboutPage } from './components/Home/AboutPage';
import { ContactPage } from './components/Home/ContactPage';
import BultenPage from './components/Home/BultenPage';
import PrivacyPage from './components/Home/PrivacyPage';
import TermsPage from './components/Home/TermsPage';
import CookiesPage from './components/Home/CookiesPage';
import KvkkPage from './components/Home/KvkkPage';
import NotFoundPage from './components/Home/NotFoundPage';
import CookieConsentBanner from './components/Home/CookieConsentBanner';
import { ShieldCheck, HelpCircle, Star, MessagesSquare, Send, Info, Calendar, BarChart3, AlertTriangle } from 'lucide-react';

const AdminLogin = React.lazy(() => import('./components/Admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = React.lazy(() => import('./components/Admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
import { dbGetCollection } from './lib/dbService';
import { onAuthStateChangedAdmin, isAdminUserLoggedIn, getAdminUser, logoutAdmin, auth, ensureAnonymousUser } from './lib/firebase';
import { isAdminEmail } from './lib/envHelper';

export default function App() {
  const [view, setView] = useState<'home' | 'universe' | 'match-center' | 'analysis' | 'transfer-radar' | 'players' | 'fan-room' | 'about' | 'contact' | 'predictor' | 'admin' | 'admin-login' | 'bulten' | 'privacy' | 'terms' | 'cookies' | 'kvkk' | '404'>('home');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
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
  const [announcement, setAnnouncement] = useState<any>(null);

  // URL routing (Faz 3): derin link iÃ§in oyuncu slug'Ä± + geri/ileri senkron bayraÄŸÄ±
  const [initialPlayerSlug, setInitialPlayerSlug] = useState<string | null>(null);
  const suppressPushRef = useRef(false);
  const routeReadyRef = useRef(false);

  const treeData = useMemo(() => {
    const basicTree = parseMarkdownToTree(GALAXY_DATA);
    return enrichFactionData(basicTree);
  }, []);

  // Sync route param check and global state loading
  useEffect(() => {
    const fetchPublicCMS = async () => {
      try {
        const arts = await dbGetCollection('articles');
        setArticles(arts);

        const targets = await dbGetCollection('transferReports');
        setTransferReports(targets);

        const plyrs = await dbGetCollection('players');
        setPlayersList(plyrs);

        const polls = await dbGetCollection('polls');
        const activePoll = polls.find((p: any) => p.status === 'active') || polls[0];
        setPollValue(activePoll || null);

        const homes = await dbGetCollection('homeSettings');
        const mainHome = homes.find(h => h.id === 'main');
        if (mainHome) setHomeSettings(mainHome);

        const anns = await dbGetCollection('announcements');
        const activeAnn = anns.find((a: any) => {
          if (a.status !== 'active') return false;
          const now = new Date();
          if (a.startDate) {
            const start = new Date(a.startDate);
            if (now < start) return false;
          }
          if (a.endDate) {
            const end = new Date(a.endDate);
            if (now > end) return false;
          }
          return true;
        });
        setAnnouncement(activeAnn || null);
      } catch (err) {
        console.error("Public CMS retrieval failed:", err);
        setArticles([]);
        setTransferReports([]);
        setPlayersList([]);
        setPollValue(null);
      }
    };
    fetchPublicCMS();

    // Give every visitor an invisible Firebase identity for polls and community actions.
    ensureAnonymousUser().catch((err) => {
      console.warn('Anonymous Firebase session could not be started:', err);
    });

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
        // Ä°Ã§erik sayfalarÄ± iÃ§in path â†’ view Ã§Ã¶zÃ¼mÃ¼ (derin link desteÄŸi)
        const resolved = pathToView(window.location.pathname);
        if (resolved && resolved !== 'admin' && resolved !== 'home') {
          setView(resolved);
          if (resolved === 'players') {
            const slug = pathSubSlug(window.location.pathname);
            if (slug) setInitialPlayerSlug(slug);
          }
        }
        setAuthChecking(false);
      }
      routeReadyRef.current = true;
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

  // URL routing (Faz 3): geri/ileri tuÅŸu â†’ view; view deÄŸiÅŸince pushState
  useEffect(() => {
    const onPop = () => {
      const v = pathToView(window.location.pathname);
      if (v) {
        suppressPushRef.current = true;
        setView(v);
        if (v === 'players') setInitialPlayerSlug(pathSubSlug(window.location.pathname));
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!routeReadyRef.current) return;            // ilk mount'ta pushlama
    if (suppressPushRef.current) { suppressPushRef.current = false; return; } // popstate kaynaklÄ±
    // YalnÄ±zca bÃ¶lÃ¼m gerÃ§ekten deÄŸiÅŸtiyse push et; aynÄ± bÃ¶lÃ¼mdeki alt-path'i (Ã¶r. /oyuncular/talisca) ezme
    if (pathToView(window.location.pathname) !== view) {
      window.history.pushState({ view }, '', viewToPath(view));
    }
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
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <span className="text-[#FFD21F] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">YÃ¼kleniyor...</span>
          </div>
        }
      >
      {/* Site-Wide Announcement Bar */}
      {announcement && view !== 'admin' && view !== 'admin-login' && (
        <div className="bg-fb-yellow text-fb-navy py-2 px-6 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-3 relative z-50 shadow-md animate-fade-in">
          <span>{announcement.title}: {announcement.shortText}</span>
          {announcement.link && (
            <a 
              href={announcement.link} 
              target="_blank" 
              rel="noreferrer" 
              className="underline hover:text-black transition-colors ml-2 font-black italic"
            >
              Ä°ncele â†’
            </a>
          )}
        </div>
      )}
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
          <PlayersPage
            onNavigate={setView}
            initialPlayerSlug={initialPlayerSlug}
            onPlayerRoute={(slug) => {
              const target = slug ? `/oyuncular/${slug}` : '/oyuncular';
              if (window.location.pathname !== target) {
                window.history.pushState({ view: 'players' }, '', target);
              }
            }}
          />
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

        {/* CONTACT / Ä°LETÄ°ÅÄ°M PAGE */}
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

        {/* BÃœLTEN PAGE */}
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
            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-wide mb-2">YETKÄ°SÄ°Z ERÄ°ÅÄ°M</h2>
            <p className="text-xs text-fb-muted max-w-sm mb-6 font-semibold leading-relaxed">
              Bu alana eriÅŸim yetkiniz yok.
            </p>
            <button
              onClick={() => {
                setUnauthorized(false);
                setView('home');
              }}
              className="px-6 py-2.5 bg-fb-yellow hover:bg-white text-fb-navy font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_25px_rgba(255,210,31,0.15)]"
            >
              Ana Sayfaya DÃ¶n
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
              YÃ¶netici GiriÅŸ SayfasÄ±na DÃ¶n
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
        {/* LEGAL: GÄ°ZLÄ°LÄ°K POLÄ°TÄ°KASI */}
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

        {/* LEGAL: KULLANIM ÅARTLARI */}
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

        {/* LEGAL: Ã‡EREZ POLÄ°TÄ°KASI */}
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

        {/* LEGAL: KVKK AYDINLATMA METNÄ° */}
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
      </React.Suspense>
    </div>
  );
}


