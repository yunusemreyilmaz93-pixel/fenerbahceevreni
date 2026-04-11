export interface QuizOption {
  text: string;
  scores: {
    main: string;
    secondary: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Yeni hoca açıklandı. Bildirim telefonuna düştü, ilk tepkin ne olur?",
    options: [
      { text: '"Sistemi olan, disiplinli biri. Sonunda işler rayına oturacak."', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: '"Dünya çapında isim, vizyon budur işte! Yer yerinden oynar."', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: '"Camiayı bilen, o havayı solumuş biri. En doğrusu buydu."', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: '"Sert adam, futbolcunun gözünün yaşına bakmaz. Bize böyle biri lazımdı."', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: '"Yine başladık kavgaya... Bakalım bu sefer kimi neyle suçlayacağız?"', scores: { main: 'Ahrazbahçeliler', secondary: 'Düz Fenerbahçeliler' } },
    ]
  },
  {
    id: 2,
    question: 'Sahada top oynanırken seni asıl "mest eden" görüntü hangisi?',
    options: [
      { text: 'Takımın makine gibi işlemesi, herkesin ne yapacağını ezbere bilmesi.', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Saf kalite, teknik ve "Ben büyük takımım" diyen o baskın oyun.', scores: { main: 'Portekiz Lobisi', secondary: 'İsim Takıntılıları' } },
      { text: 'Çubuklu formanın hakkını veren, her topa canını koyan o ruh.', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: 'Rakibi sahasına hapseden, eze eze oynayan o agresif futbol.', scores: { main: 'Balkan Lobisi', secondary: 'Ahrazbahçeliler' } },
      { text: '"Bu işin sonu şampiyonluktan da öte bir yere gidiyor" dedirten o büyük hikaye.', scores: { main: 'Ütopikçiler', secondary: 'İsim Takıntılıları' } },
    ]
  },
  {
    id: 3,
    question: 'Transfer haberi düştü. Hangi detay seni "Bu iş bitti" diyerek ikna eder?',
    options: [
      { text: '"Tam bir görev adamı, hocanın sistemine cuk oturur."', scores: { main: 'Alman Ekolücüler', secondary: 'Portekiz Lobisi' } },
      { text: '"Avrupa devinden geliyor, saf yetenek, tam bir star."', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: '"Karakteri sağlam, tam bu formanın ağırlığını taşıyacak adam."', scores: { main: 'Balkan Lobisi', secondary: 'Camia Evladıcılar' } },
      { text: '"Ligi biliyor, buradaki sertliğe alışık, direkt katkı verir."', scores: { main: 'Anadolu İrfanı', secondary: 'Balkan Lobisi' } },
      { text: '"Kim gelirse gelsin, biz hocanın/yönetimin arkasındayız."', scores: { main: 'Düz Fenerbahçeliler', secondary: 'Hacı İsmail Kartalcılar' } },
    ]
  },
  {
    id: 4,
    question: 'Sosyal medyada yine "fraksiyon kavgası" çıktı. Senin tavrın ne olur?',
    options: [
      { text: 'Açarım taktik tahtasını; sayılarla, verilerle doğrusunu anlatırım.', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Hocanın kariyerini, kazandığı kupaları önüne koyar sustururum.', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: '"Arma aşkına" derim, "Fenerbahçe’nin çocuğu" derim, değerleri savunurum.', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: '"Bize sertlik lazım, yumruğunu masaya vuranı savunurum" derim.', scores: { main: 'Balkan Lobisi', secondary: 'Ahrazbahçeliler' } },
      { text: '"Ne fraksiyonu beyler, Fenerbahçe var!" der, kavgayı uzaktan izlerim.', scores: { main: 'Düz Fenerbahçeliler', secondary: 'Camia Evladıcılar' } },
    ]
  },
  {
    id: 5,
    question: 'Takım kötü gidiyor, puanlar kaybediliyor. İlk ne dersin?',
    options: [
      { text: '"Sistemde hata var, yapısal sorunları çözemedik."', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: '"Bu kadronun hakkı bu değil, daha büyük bir isim gelip ayağa kaldırmalı."', scores: { main: 'Ütopikçiler', secondary: 'Portekiz Lobisi' } },
      { text: '"Yabancıya anlatamazsın burayı, içeriden bir abimiz gelip toparlamalı."', scores: { main: 'Hacı İsmail Kartalcılar', secondary: 'Camia Evladıcılar' } },
      { text: '"Topçular çok yumuşak kalıyor, biraz silkip kendilerine getirmek lazım."', scores: { main: 'Anadolu İrfanı', secondary: 'Aykutçular' } },
      { text: '"Çok steril kaldık, takıma biraz kaos, biraz hırs lazım."', scores: { main: 'Ahrazbahçeliler', secondary: 'Balkan Lobisi' } },
    ]
  },
  {
    id: 6,
    question: 'Hangi hoca profili seni içten içe daha çok heyecanlandırıyor?',
    options: [
      { text: 'Soğukkanlı, planlı, işine kimseyi karıştırmayan sistem adamı.', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Odaya girdiğinde herkesin ayağa kalktığı, karizmatik dünya markası.', scores: { main: 'Portekiz Lobisi', secondary: 'İsim Takıntılıları' } },
      { text: '"Bizden biri", camianın evladı, duygusal bağ kurabildiğin isim.', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: 'Tavizsiz, futbolcuyu "kıran", sahada savaşçı isteyen sert hoca.', scores: { main: 'Balkan Lobisi', secondary: 'Ahrazbahçeliler' } },
      { text: 'Kafasındaki ideoloji için dünyayı karşısına alan, inatçı dahi.', scores: { main: 'Aykutçular', secondary: 'Ütopikçiler' } },
    ]
  },
  {
    id: 7,
    question: 'Maç bitti, staddan ya da ekran başından hangi hisle kalkarsan "Tamamdır" dersin?',
    options: [
      { text: '"Satranç gibi maçtı, taktikle aldık."', scores: { main: 'Hollanda Lobisi', secondary: 'Alman Ekolücüler' } },
      { text: '"Kalitemizle ezdik, büyük takım gibi oynadık."', scores: { main: 'Portekiz Lobisi', secondary: 'İsim Takıntılıları' } },
      { text: '"İşte Fenerbahçe ruhu buydu, sahada her şeyimizi verdik."', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: '"Kora kor dövüştük, söke söke aldık."', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: '"Bu takımın tavanı yok, çok başka bir şeye evriliyoruz."', scores: { main: 'Ütopikçiler', secondary: 'Portekiz Lobisi' } },
    ]
  },
  {
    id: 8,
    question: 'Tribünde ya da arkadaş ortamında en çok hangi cümleyi kurarken buluyorsun kendini?',
    options: [
      { text: '"Planın yoksa şansın da yoktur abi."', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: '"Büyük kulüpsen, büyük isimlerle yürüyeceksin."', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: '"Bu takımın bir ruhu, bir geleneği var; onu unutmamak lazım."', scores: { main: 'Camia Evladıcılar', secondary: 'Aykutçular' } },
      { text: '"Sahada savaşmayana ekmek yok, burası Fenerbahçe!"', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: '"Siz çok ciddisiniz, biraz rahatlayın, Fenerbahçe bu her şey olur."', scores: { main: 'Ahrazbahçeliler', secondary: 'Düz Fenerbahçeliler' } },
    ]
  },
  {
    id: 9,
    question: 'Hoca tercihinde senin için "kırmızı çizgi" nedir?',
    options: [
      { text: 'Modern bir oyun yapısı kurabilecek mi?', scores: { main: 'Portekiz Lobisi', secondary: 'Alman Ekolücüler' } },
      { text: 'İsmiyle, ağırlığıyla camiayı birleştirebilir mi?', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: 'Fenerbahçe’nin genetiğini ne kadar biliyor?', scores: { main: 'Hacı İsmail Kartalcılar', secondary: 'Camia Evladıcılar' } },
      { text: 'Karakteri buradaki baskıyı kaldıracak kadar sert mi?', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: 'Kendine has bir çizgisi, savunacağı bir fikri var mı?', scores: { main: 'Aykutçular', secondary: 'Hollanda Lobisi' } },
    ]
  },
  {
    id: 10,
    question: 'Senin için Fenerbahçeli olmanın özeti hangisi?',
    options: [
      { text: 'Doğru futbolu, doğru planla savunmak.', scores: { main: 'Hollanda Lobisi', secondary: 'Alman Ekolücüler' } },
      { text: 'Her zaman en iyisini, en büyüğünü hedeflemek.', scores: { main: 'Ütopikçiler', secondary: 'İsim Takıntılıları' } },
      { text: 'Ne olursa olsun o aidiyet duygusundan kopmamak.', scores: { main: 'Düz Fenerbahçeliler', secondary: 'Camia Evladıcılar' } },
      { text: 'Tutkuyla sevmek, gerektiğinde en sert tepkiyi vermek.', scores: { main: 'Ahrazbahçeliler', secondary: 'Balkan Lobisi' } },
      { text: 'Bir duruşu olmak, her devrin adamı olmamak.', scores: { main: 'Aykutçular', secondary: 'Hacı İsmail Kartalcılar' } },
    ]
  },
  {
    id: 11,
    question: 'İzlediğin maçta seni çileden çıkaran şey nedir?',
    options: [
      { text: 'Plansızlık; sahada kimin ne yaptığı belli değilse deliririm.', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Korkak futbol; geri yaslanıp rakibi izliyorsak dayanamam.', scores: { main: 'Portekiz Lobisi', secondary: 'Balkan Lobisi' } },
      { text: 'Ruhsuzluk; formanın ağırlığını hissetmeyen oyuncu görmeyeceğim.', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: 'Yumuşaklık; rakibe dokunmadan, ikili mücadeleye girmeden maç bitmez.', scores: { main: 'Balkan Lobisi', secondary: 'Ahrazbahçeliler' } },
      { text: 'Vizyonsuzluk; "Küçük olsun bizim olsun" kafasından nefret ederim.', scores: { main: 'Ütopikçiler', secondary: 'İsim Takıntılıları' } },
    ]
  },
  {
    id: 12,
    question: 'Yönetimin hangi açıklaması sana "Mantıklı olan bu" dedirtir?',
    options: [
      { text: '"5 yıllık bir plan ve altyapı sistemi kuruyoruz."', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: '"Dünya yıldızlarını getirip vizyonu büyütüyoruz."', scores: { main: 'Ütopikçiler', secondary: 'İsim Takıntılıları' } },
      { text: '"Camiayı birleştirecek, özümüze dönecek isimlerle yola çıkıyoruz."', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: '"Sahada savaşacak, karakterli bir kadro kuruyoruz."', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: '"Zor ama doğru olanın peşinden gidiyoruz, gerçekçiyiz."', scores: { main: 'Anadolu İrfanı', secondary: 'Düz Fenerbahçeliler' } },
    ]
  },
  {
    id: 13,
    question: 'Şu kavramlardan hangisi senin "Fenerbahçe dünyanı" en iyi anlatıyor?',
    options: [
      { text: 'Ekol (Alman disiplini, sistem...)', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Aura (Işıltı, karizma, büyüklük...)', scores: { main: 'Portekiz Lobisi', secondary: 'İsim Takıntılıları' } },
      { text: 'Camia (Birlik, beraberlik, aile...)', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: 'Kaos (Kavga, gürültü, hırs...)', scores: { main: 'Ahrazbahçeliler', secondary: 'Balkan Lobisi' } },
      { text: 'Gelenek (Duruş, çizgi, kimlik...)', scores: { main: 'Aykutçular', secondary: 'Düz Fenerbahçeliler' } },
    ]
  },
  {
    id: 14,
    question: 'İşler sıkıştı, bir risk alınacak. Sen hangi riski tercih edersin?',
    options: [
      { text: 'Sonuçlar kötü olsa da sistemden taviz vermeme riskini.', scores: { main: 'Alman Ekolücüler', secondary: 'Hollanda Lobisi' } },
      { text: 'Bütün parayı bir dünya yıldızına basma riskini.', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: 'Eskilerden, tanıdık bir isme takımı emanet etme riskini.', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: 'Çok sert, oyuncularla papaz olabilecek bir hocayı getirme riskini.', scores: { main: 'Balkan Lobisi', secondary: 'Anadolu İrfanı' } },
      { text: 'Kimsenin adını duymadığı ama dahi denilen birini deneme riskini.', scores: { main: 'Ütopikçiler', secondary: 'Ahrazbahçeliler' } },
    ]
  },
  {
    id: 15,
    question: 'Son karar anı: "Hoca budur" derken içinden ne geçer?',
    options: [
      { text: '"Bakalım taktik tahtasında ne sırlar var?"', scores: { main: 'Hollanda Lobisi', secondary: 'Alman Ekolücüler' } },
      { text: '"Bu adam gelirse kombineler tükenir, dünya bizi konuşur."', scores: { main: 'İsim Takıntılıları', secondary: 'Ütopikçiler' } },
      { text: '"Sonunda bizden biri, bizi anlayan biri geldi."', scores: { main: 'Camia Evladıcılar', secondary: 'Hacı İsmail Kartalcılar' } },
      { text: '"Bu hoca takımı ayağa diker, kimsenin gözünün yaşına bakmaz."', scores: { main: 'Balkan Lobisi', secondary: 'Ahrazbahçeliler' } },
      { text: '"Ben zaten bu tartışmaların üstündeyim, sonuca bakarım."', scores: { main: 'Düz Fenerbahçeliler', secondary: 'Anadolu İrfanı' } },
    ]
  }
];
