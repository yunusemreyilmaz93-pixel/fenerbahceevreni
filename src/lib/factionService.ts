import { FactionNode } from '../types';

const TAG_POOL = [
  'Disiplin', 'Nostalji', 'Büyük İsimler', 'Kaos', 'Camia', 'Sistem', 
  'Realizm', 'Modern Futbol', 'Balkan', 'Portekiz', 'Brezilya', 'Alman Ekolü',
  'Fütüristler', 'Dinozorlar', 'Genç Nesil', 'Hücum Futbolu', 'Savunma Sanatı'
];

const VIBE_POOL = [
  'Analitik ve Soğukkanlı', 'Tutkulu ve Reaksiyoner', 'Gelenekçi ve Köklü',
  'Yenilikçi ve Radikal', 'Kaotik ama Sadık', 'Romantik ve Nostaljik'
];

const TONE_POOL = [
  'Ciddi ve Stratejik', 'Hafif Alaycı ama Bilge', 'Keskin ve Net',
  'Edebi ve Derin', 'Modern ve Hızlı'
];

const SPECIFIC_DATA: Record<string, Partial<FactionNode>> = {
  'Balkan Lobisi': {
    motto: 'Sertlik, Disiplin, Balkan İnadı',
    philosophy: 'Sahada "yumuşaklığa" gelemezler. Futbol; ter, kan ve son dakikaya kadar mücadele demektir. Karizmatik ama sert, otoriter ama babacan figürleri severler.',
    highlights: 'Tadic, Dzeko, Veselinovic, Stankovic, Ivic, Kaloperovic.',
    description: 'Balkan ekolü, Fenerbahçe tarihinin en başarılı dönemlerinin mimarıdır. Bu fraksiyonun üyeleri, takımın başında bir "komutan" görmek isterler. Disiplinden taviz veren, oyuncuya dayalı düzen kuran hocalara tahammülleri yoktur.',
    vibe: 'Otoriter ve Mücadeleci',
    tone: 'Keskin ve Net',
    representation: 'Camianın genetiğindeki "inatçı ve savaşçı" ruhu temsil ederler.',
    relatedFactions: {
      similar: ['Alman Ekolücüler', 'Hacı İsmail Kartalcılar'],
      opposite: ['Ahrazbahçeliler', 'İsim Takıntılıları']
    }
  },
  'Hollanda Lobisi': {
    motto: 'Hücum, Estetik ve Total Futbol',
    philosophy: "Fenerbahçe'nin genetiğindeki hücum futbolunu ancak Hollanda ekolünün geri getirebileceğine inanırlar. 4-3-3 dizilişi onlar için bir oyun planı değil, bir yaşam tarzıdır.",
    highlights: 'Cocu, Koeman, Advocaat, Hiddink, Van Persie, Kuyt.',
    description: 'Her yeni Hollandalı hoca geldiğinde "İşte şimdi Ajax gibi olacağız" diye heyecanlanırlar. Estetikten ödün vermeyen, topa sahip olan ve rakibi boğan bir oyun hayal ederler. Ancak genellikle "buranın iklimine uyum" sorunuyla karşılaşırlar.',
    vibe: 'Romantik ve Estetik',
    tone: 'Edebi ve Derin',
    representation: 'Fenerbahçe\'nin "göze hoş gelen futbol" arzusunun kalesidirler.',
    relatedFactions: {
      similar: ['Ütopikçiler', 'Brezilya Lobisi'],
      opposite: ['Anadolu İrfanı', 'Aykutçular']
    }
  },
  'Portekiz Lobisi': {
    motto: 'Taktik Deha ve Modern Doktrin',
    philosophy: 'Modern futbolun taktik dehasına ve yüksek tempoya bayılırlar. Hoca dediğin "oyun içinde oyun" kurmalı, her anı domine etmelidir.',
    highlights: 'Jesus, Mourinho, Vitor Pereira, Conceição, Abel Ferreira.',
    description: 'Portekizli hocaların aurası ve taktiksel esnekliği bu grubu büyüler. "Kabız futbol" yerine, her anı planlanmış, agresif ve sonuç odaklı bir modernizm ararlar. Samandıra\'da Portekizce konuşulması onları rahatsız etmez, aksine profesyonellik göstergesidir.',
    vibe: 'Modern ve Stratejik',
    tone: 'Ciddi ve Stratejik',
    representation: 'Camianın "dünya futboluna entegrasyon" çabasını temsil ederler.',
    relatedFactions: {
      similar: ['Alman Ekolücüler', 'İsim Takıntılıları'],
      opposite: ['Camia Evladıcılar', 'Anadolu İrfanı']
    }
  },
  'Alman Ekolücüler': {
    motto: 'Plan, Proje, Sistem',
    philosophy: '"Duyguyla değil akılla yönetelim" derler. Disiplin kırmızı çizgileridir, Fenerbahçe\'nin bir futbol fabrikasına dönüşmesini isterler.',
    highlights: 'Daum, Löw, Lorant, Hoeneß, Rose, Schmidt.',
    description: 'Alman disiplini ve fiziksel güç bu fraksiyonun kutsalıdır. "Sistem her şeydir, isimler geçicidir" felsefesiyle hareket ederler. Genç oyuncuların parlatılması ve taktiksel sadakat onlar için şampiyonluk kadar değerlidir.',
    vibe: 'Analitik ve Soğukkanlı',
    tone: 'Keskin ve Net',
    representation: 'Fenerbahçe\'nin "kurumsallaşma ve sistem" özlemini temsil ederler.',
    relatedFactions: {
      similar: ['Portekiz Lobisi', 'Balkan Lobisi'],
      opposite: ['Ahrazbahçeliler', 'Camia Evladıcılar']
    }
  },
  'Ahrazbahçeliler': {
    motto: 'Kaosun İçindeki Sadakat',
    philosophy: 'Fenerbahçe\'nin o kaotik havasından beslenirler. Herkesin gittiği yolun tersine gitmek, "olmaz" deneni istemek onların karakteridir.',
    highlights: 'Abdullah Avcı, Sergen Yalçın, Şenol Güneş, Fatih Terim (Gizli Hayranlık).',
    description: 'Bu grup, camianın en reaksiyoner ve bazen de en "damar" kısmıdır. Mantıktan ziyade duyguyla, bazen de sadece "terslik olsun" diye hareket ederler. Kaos anlarında en çok onların sesi çıkar.',
    vibe: 'Tutkulu ve Reaksiyoner',
    tone: 'Hafif Alaycı ama Bilge',
    representation: 'Camianın "aykırı ve kontrol edilemez" enerjisini temsil ederler.',
    relatedFactions: {
      similar: ['Anadolu İrfanı'],
      opposite: ['Alman Ekolücüler', 'Ütopikçiler']
    }
  },
  'Camia Evladcılar': {
    summary: '"Bizi en iyi bizi bilen, bu havayı soluyan, bu formanın ağırlığını hisseden anlar."',
    vibe: 'Aidiyetçi ve köklü',
    tone: 'Duygusal, gelenekçi, derin hafızalı',
    representation: "Fenerbahçe'nin öz değerlerine, camia hafızasına ve içeriden gelen figürlere duyulan güçlü bağlılığı temsil eder.",
    philosophy: 'Camia Evladcılar için aidiyet çoğu zaman taktik tahtasından daha ağır gelir. Onlara göre bu kulübede oturacak, bu formayı taşıyacak ya da bu kulübü temsil edecek kişinin önce Fenerbahçe’yi tanıması gerekir. Derbinin ağırlığını, tribünün sabrını, bu kulübün tansiyonunu ve o meşhur baskıyı yaşamamış biri ne kadar iyi olursa olsun hep bir adım geridedir.',
    highlights: 'Kuytçular, Bülentçiler, Tuncaycılar, Ümit Özatçılar, Selçuk Şahinciler, Mehmet Topalcılar, Oğuz Çetinciler, Volkancılar, Rıdvan Dilmenciler, Serhat Akıncılar, Gökhan Gönülcüler, Roberto Carloscular, Mert Nobreciler, Sowcular, Avrupa Zicocuları, Pozitif Futbol Sevenler, Zicocular, Deividciler, Titeciler, Hakan Kutlucular, Şenol Cancılar, Mustafa Kaplançılar, Özhan Pulatcılar, Önder Özenciler, Abdullah Ercancılar, Mehmet Topuzcular, Webocular, Müjdat Yetkinciler, Fatih Akyelciler, Ogüncüler, Mirkovicciler, Engin İpekoğlucular, Murat Şahinciler, Rüştücüler, Ahmet Yıldırımcılar, Yusuf Şimşekçiler, Coşkun Demirbakancılar, Metin Diyadinciler, Oktay Derelioğlucular, Semih Şentürkçüler, Orhan Şamcılar, Abdülkerim Durmazcılar, Hasan Ali Kaldırımcılar.',
    description: 'Bu fraksiyon için Fenerbahçe biraz da hafıza işidir. Kim bu kulüpte iz bıraktı, kim bu armaya gerçekten bağlandı, kim kötü günde de burada kaldı — bunlar onlar için ciddi meseledir. O yüzden dışarıdan gelen parlak ama soğuk profil yerine, içeriden gelen ve bu kulübün duygusunu bilen isimlere daha hızlı ısınırlar. Bazen fazla nostaljik bulunurlar. Bazen de “yine camia çocuğu muhabbeti başladı” tepkisi alırlar. Ama onların bakışında olay yalnızca romantizm değildir; aynı zamanda temsil meselesidir. Fenerbahçe’yi temsil edecek kişinin Fenerbahçe’yi gerçekten hissetmesi gerektiğine inanırlar.',
    tags: ['CAMİA', 'AİDİYET', 'KULÜPHAFIZASI', 'VEFA'],
    relatedFactions: {
      similar: ['Hacı İsmail Kartalcılar', 'Düz Fenerbahçeliler', 'Emre Bellocular'],
      opposite: ['Portekiz Lobisi', 'Alman Ekolücüler', 'İsim Takıntılıları']
    }
  },
  'Anadolu İrfanı': {
    motto: 'Ligi Bilen, Puanı Alan',
    philosophy: "Fantastik maceralara gerek olmadığını, bu ligin şifresini ancak buraların tozunu yutmuş hocaların çözeceğini savunurlar. Gerçekçidirler.",
    highlights: 'Yılmaz Vural, Rıza Çalımbay, Hikmet Karaman, Fatih Tekke, Çağdaş Atan.',
    description: 'Onlara göre modern taktikler karın doyurmaz; önemli olan kornerden gol bulmak ve 1-0\'ın üzerine yatabilmektir. "Avrupalı buraya gelip ne yapacak, Kayseri deplasmanını biliyor mu?" sorusu en büyük kozlarıdır.',
    vibe: 'Gerçekçi ve Pragmatik',
    tone: 'Hafif Alaycı ama Bilge',
    representation: 'Camianın "yerel gerçeklik ve sonuç odaklılık" tarafını temsil ederler.',
    relatedFactions: {
      similar: ['Ahrazbahçeliler', 'Aykutçular'],
      opposite: ['Ütopikçiler', 'Hollanda Lobisi']
    }
  },
  'Ütopikçiler': {
    motto: 'Zirve Tek Kişiliktir',
    philosophy: "Fenerbahçe'nin vizyonunu Türkiye sınırlarının çok ötesinde, dünya devleriyle bir tutarlar. İmkansızın peşinden koşmak hobileridir.",
    highlights: 'Pep Guardiola, Klopp, Tuchel, Ancelotti, Xabi Alonso, Zidane.',
    description: 'Beklentileri o kadar yüksektir ki, Mourinho bile onlar için "idare eder" bir başlangıçtır. Fenerbahçe\'nin her zaman dünyanın en iyi hocasıyla çalışması gerektiğine inanırlar.',
    vibe: 'Yenilikçi ve Radikal',
    tone: 'Modern ve Hızlı',
    representation: 'Fenerbahçe\'nin "küresel dev olma" vizyonunu temsil ederler.',
    relatedFactions: {
      similar: ['İsim Takıntılıları', 'Hollanda Lobisi'],
      opposite: ['Anadolu İrfanı', 'Ahrazbahçeliler']
    }
  },
  'İsim Takıntılıları': {
    motto: "CV'si Parlasın, Karizması Yetsin",
    philosophy: "Fenerbahçe'nin büyüklüğünün ancak dünya çapında, marka değeri yüksek isimlerle temsil edilebileceğine inanırlar.",
    highlights: 'Allegri, Ten Hag, Xavi, Wenger, Pirlo, Motta.',
    description: 'Takımın başına kim gelirse gelsin, önce Wikipedia sayfasındaki "başarılar" kısmına bakarlar. Karizma ve dünya basınındaki yankı, sahadaki oyundan daha önceliklidir.',
    vibe: 'Modern ve Hızlı',
    tone: 'Ciddi ve Stratejik',
    representation: 'Camianın "prestij ve marka değeri" takıntısını temsil ederler.',
    relatedFactions: {
      similar: ['Ütopikçiler', 'Portekiz Lobisi'],
      opposite: ['Balkan Lobisi', 'Hacı İsmail Kartalcılar']
    }
  },
  'Hacı İsmail Kartalcılar': {
    motto: "Samandıra'nın Dervişi",
    philosophy: "Gösterişsiz başarıya, dürüstlüğe ve sessiz sedasız iş yapmaya önem verirler. \"Fenerbahçe'nin evladı\" kavramının en saf halini temsil ederler.",
    highlights: 'İsmail Kartal, Turhan Sofuoğlu, Oğuz Çetin, Rıdvan Dilmen.',
    description: 'Onlar için her şeyin çözümü "Fenerbahçe sevgisi" ve takıma yapılacak "ufak bir dokunuş"tur. Sadakat ve aidiyet, taktik tahtasından daha değerlidir.',
    vibe: 'Gelenekçi ve Köklü',
    tone: 'Edebi ve Derin',
    representation: 'Fenerbahçe\'nin "saf sevgi ve iç huzur" arayışını temsil ederler.',
    relatedFactions: {
      similar: ['Camia Evladıcılar', 'Balkan Lobisi'],
      opposite: ['İsim Takıntılıları', 'Ahrazbahçeliler']
    }
  },
  'Aykutçular': {
    motto: 'Matematiksel Tutarlılık',
    philosophy: 'Defansif ciddiyet, matematiksel tutarlılık ve ideolojik bir duruş... Skorun değil, bir fikrin peşinden giderler.',
    highlights: 'Aykut Kocaman, Zeki Murat Göle, Tahir Karapınar.',
    description: 'Futbolun bir matematik oyunu olduğuna inanırlar. Koşu mesafeleri, savunma güvenliği ve sabır bu fraksiyonun kutsal üçlüsüdür. "Kocaman" bir sevdayı, bir sistem mücadelesi olarak görürler.',
    vibe: 'Analitik ve Soğukkanlı',
    tone: 'Ciddi ve Stratejik',
    representation: 'Camianın "sistemli ve sabırlı futbol" idealini temsil ederler.',
    relatedFactions: {
      similar: ['Anadolu İrfanı', 'Alman Ekolücüler'],
      opposite: ['Hollanda Lobisi', 'Brezilya Lobisi']
    }
  },
  'Düz Fenerbahçeliler': {
    motto: 'Pazartesi Huzuru',
    philosophy: 'Ne fraksiyon bilirler ne lobi. Pazar günü maç kazanılsın, Pazartesi işe keyifle gidilsin yeter.',
    highlights: 'Tüm Samimi Taraftarlar.',
    description: 'Onlar için tek gerçek skor tabelasıdır. Takım iyi oynasın, kötü oynasın fark etmez; yeter ki o üç puan gelsin ve hafta içi huzurla geçsin.',
    vibe: 'Kaotik ama Sadık',
    tone: 'Modern ve Hızlı',
    representation: 'Camianın "saf ve beklentisiz" çoğunluğunu temsil ederler.',
    relatedFactions: {
      similar: ['Camia Evladıcılar', 'Hacı İsmail Kartalcılar'],
      opposite: ['Ahrazbahçeliler']
    }
  },
  'Emre Bellocular': {
    summary: '"Sahada karakter, kulübede hırs, kenarda da biraz delilik görmeden tam ikna olmazlar."',
    vibe: 'Hırslı ve sert',
    tone: 'Ateşli, iddialı, reaksiyoner',
    representation: "Fenerbahçe'de Emre Belözoğlu figürünü; karakter, liderlik, saha içi sinir, kulüp aidiyeti ve mücadele ruhunun birleşimi olarak gören damarı temsil eder.",
    philosophy: 'Emre Bellocular için mesele yalnızca teknik direktörlük ya da saha kenarı performansı değildir. Onlar Emre Belözoğlu’nda daha çok karakter, liderlik, oyuna müdahale isteği ve “bu kulübün tansiyonunu taşıyabilme” halini sever. Biraz ateş, biraz ego, biraz kontrol arzusu, biraz da “takımı silkeler” beklentisi bu fraksiyonun temelini oluşturur.',
    highlights: 'Emre Bellocular, bağımsız tek fraksiyonlardan biri olarak doğrudan kendi başına durur.',
    description: 'Bu fraksiyonun insanları genelde yumuşak profillere kolay kolay ısınmaz. Onlara göre Fenerbahçe kulübesinde bazen fazla sakinlik değil, biraz öfke, biraz gerilim ve biraz da saha kenarında yaşayan bir karakter gerekir. Emre Belözoğlu sevgileri sadece futbol aklından değil; aynı zamanda sahadaki sinirden, rekabetten ve “bu takım gevşemeyecek” hissinden beslenir. Dışarıdan bakınca bu tayfa bazen fazla reaksiyoner görünür. Ama kendi iç mantıklarında olay nettir: Fenerbahçe gibi bir yerde bazen diplomasi değil, karakter göstermek gerekir.',
    tags: ['KARAKTER', 'HIRS', 'LİDERLİK', 'AİDİYET'],
    relatedFactions: {
      similar: ['Camia Evladıcılar', 'Hacı İsmail Kartalcılar', 'Balkan Lobisi'],
      opposite: ['Düz Fenerbahçeliler', 'Alman Ekolücüler', 'Hollanda Lobisi']
    }
  },
  'Basket Tayfa': {
    summary: '"Futbol tartışmasının ortasında bile bir anda Obradovic örneği verip ortamın ayarını değiştirebilirler."',
    vibe: 'Kültürlü ve özgüvenli',
    tone: 'Şubeler üstü, hafif elit, kupaya alışık',
    representation: "Fenerbahçe'yi yalnızca futbol üzerinden okumayan; basketbol şubesinin kültürünü, başarı hafızasını ve teknik seviye beklentisini de taraftarlığın merkezine koyan damarı temsil eder.",
    philosophy: 'Basket Tayfa için Fenerbahçelilik sadece hafta sonu futbol maçı izlemek değildir. Onlar kulübü daha geniş okur; şube kültürünü, koç etkisini, oyun disiplinini ve Avrupa seviyesinde rekabet alışkanlığını da işin içine katar. Bu yüzden beklentileri çoğu zaman yüksektir: sıradanlık değil, düzen, kalite ve kupaya oynayan yapı isterler.',
    highlights: 'Djordevicciler, Saraşçılar, Garnierciler, Spahijacılar, Obradovicciler, Tanjevicciler.',
    description: 'Bu tayfa bazen futbol fraksiyonları arasında ayrı bir cumhuriyet gibi yaşar. Çünkü onların referans seti biraz farklıdır: koç etkisi, sistem disiplini, oyuncu rolü, Avrupa standardı ve kulüp kültürü. Futbolda yaşanan her kaosta içlerinden biri çıkıp “basketbolda böyle mi yapılıyor?” demeye çok yakındır. Biraz haklı özgüvenleri vardır; çünkü başarı hafızaları kuvvetlidir. Bu yüzden sabır eşikleri de garip biçimde seçicidir: kaliteye sabrederler, dağınıklığa hiç sabretmezler. Onlar için büyük kulüp olmak, biraz da organizasyon kalitesi demektir.',
    tags: ['BASKETBOL', 'ŞUBEKÜLTÜRÜ', 'AVRUPASTANDARTI', 'KALİTEBEKLENTİSİ'],
    relatedFactions: {
      similar: ['Alman Ekolücüler', 'Voleybol Tayfa', 'Hollanda Lobisi'],
      opposite: ['Ahrazbahçeliler', 'Serdar Ali Çelikler Terör Örgütü', 'Düz Fenerbahçeliler']
    }
  },
  'Jesusçular': {
    summary: '"Oyunda tempo, kenarda karizma, hedefte de Avrupa geceleri olsun isterler."',
    vibe: 'Coşkulu ve iddialı',
    tone: 'Enerjik, büyük oynayan, gösterişli',
    representation: "Fenerbahçe'de Jorge Jesus figürünü; yüksek tempo, büyük hedef, Avrupa iddiası ve kenarda güçlü bir teknik direktör karizmasıyla özdeşleştiren damarı temsil eder.",
    philosophy: 'Jesusçular için mesele yalnızca maç kazanmak değildir; kazanırken oyunun hissedilmesi de gerekir. Onlar biraz tempo, biraz cesaret, biraz da “büyük takım gibi oynama” duygusu arar. Teknik direktör dediğin şey yalnızca kenarda duran biri değil, sahaya enerji ve iddia yayan bir figür olmalıdır.',
    highlights: 'Ziraat Edebiyatı Yapanlar, Avrupa Jesusçuları.',
    description: 'Bu tayfa için Jorge Jesus dönemi biraz “çok şey vaat eden, çok şey hissettiren” bir dönem olarak okunur. Yalnızca sonuç değil, hissiyat da önemlidir. Takım öne bassın, rakibi zorlasın, maç biraz büyük takım havası taşısın isterler. Bazen fazla romantik bulunurlar; çünkü iyi oyunun bıraktığı etkiyi, puan tablosunun üstüne koydukları anlar olur. Ama kendi iç mantıklarında olay nettir: Fenerbahçe gibi bir kulüp bazen sadece kazanmakla değil, baskın ve iddialı görünmekle de tatmin eder.',
    tags: ['JORGEJESUS', 'TEMPO', 'AVRUPAHEDEFİ', 'BÜYÜKOYUN'],
    relatedFactions: {
      similar: ['Portekiz Lobisi', 'Mourinhocular', 'Vitorcular'],
      opposite: ['Anadolu İrfanı', 'Düz Fenerbahçeliler', 'Hacı İsmail Kartalcılar']
    }
  },
  'Ersuncular': {
    summary: '"Önde baskı, yüksek tempo, biraz kaos, bol enerji: hayat onlara göre böyle daha güzel."',
    vibe: 'Ateşli ve tempocu',
    tone: 'Coşkulu, agresif, inançlı',
    representation: "Fenerbahçe'de Ersun Yanal figürünü; yüksek tempo, ön alan baskısı, hücum iştahı ve takımı ayağa kaldıran enerjiyle özdeşleştiren damarı temsil eder.",
    philosophy: 'Ersuncular için futbol biraz nabız işidir. Takım sahada canlı olacak, rakibe çökecek, tribünü ayağa kaldıracak, gerektiğinde kontrolü kaybetme pahasına heyecan üretecek. Onlara göre iyi takım bazen kusursuz değil; diri, cesur ve saldırgan olandır.',
    highlights: 'Küskün Ersuncular, Çobani Örgütü, Tahir Karapınarcılar, Derbiden Derbiye İzleyenler, Begiristancılar.',
    description: 'Bu fraksiyonun insanları “oyun temposu” lafını boşuna etmez. Onlar için takım biraz öne basmalı, biraz korkusuz oynamalı, biraz da rakibi boğmalıdır. Bazen bu iş dağılabilir, bazen fazla açık verilebilir, ama onların gözünde asıl günah ruhsuzluk ve temposuzluktur. Ersun Yanal sevgisi burada sadece bir teknik direktör sevgisi değildir; aynı zamanda tribünü ayağa kaldıran, takıma enerji pompalayan ve “bu takımın nabzı yükseldi” hissi veren bir futbol anlayışına bağlılıktır. İçlerinde hâlâ o dönemin gazını taşıyanlar da vardır, kırgın kalanlar da. Zaten alt kollarda bunun izi açıkça görülür.',
    tags: ['ERSUNYANAL', 'ÖNALANBASKISI', 'YÜKSEKTEMPO', 'ENERJİ'],
    relatedFactions: {
      similar: ['Zemancılar', 'Balkan Lobisi', 'Ahrazbahçeliler'],
      opposite: ['Alman Ekolücüler', 'Hollanda Lobisi', 'Düz Fenerbahçeliler']
    }
  },
  'Voleybol Tayfa': {
    summary: '"Futbol tayfa birbirini yerken onlar kupaya, düzene ve gerçekten işleyen sisteme bakar."',
    vibe: 'Kalite odaklı ve gururlu',
    tone: 'Şube kültürlü, seçici, hafif üst perdeden',
    representation: "Fenerbahçe'yi sadece futbol üzerinden değil, voleybol şubesinin kültürü, istikrarı ve başarı standardı üzerinden de okuyan damarı temsil eder.",
    philosophy: 'Voleybol Tayfa için Fenerbahçelilik biraz da kurumsal kalite meselesidir. Onlar için yalnızca tutku yetmez; doğru kadro planlaması, doğru koç seçimi, şube ciddiyeti ve kupaya oynayan yapı da gerekir. Bu yüzden bakışları genelde daha seçici, standartları biraz daha yüksektir.',
    highlights: 'Velascocular, Bernardiciler, Rezendeciler, Lavariniciler, Kiralycılar, Yeon-Koungcular, Abbondanzacılar, Dişi Kanaryalar.',
    description: 'Bu fraksiyonun insanları çoğu zaman futbol kaosuna dışarıdan bakan akraba gibidir: aynı aileden ama biraz daha düzenli, biraz daha organize, biraz da “biz bu işleri böyle yapmıyoruz” tavrındadırlar. Voleybol şubesinin başarı hafızası, onların beklenti seviyesini ciddi biçimde yükseltmiştir. Bu yüzden sıradanlık onlara kolay kolay yetmez. Kaliteli koç, oturmuş yapı, doğru rol dağılımı ve kazanma kültürü ararlar. Futbolda yaşanan her karmaşada içlerinden biri çıkıp “abi voleybolda böyle mi yönetiliyor?” deme hakkını kendinde görür; açık konuşmak gerekirse bazen çok da haksız sayılmaz.',
    tags: ['VOLEYBOL', 'ŞUBEKÜLTÜRÜ', 'KALİTESTANDARDI', 'KAZANMAALIŞKANLIĞI'],
    relatedFactions: {
      similar: ['Basket Tayfa', 'Alman Ekolücüler', 'Hollanda Lobisi'],
      opposite: ['Ahrazbahçeliler', 'Serdar Ali Çelikler Terör Örgütü', 'Düz Fenerbahçeliler']
    }
  },
  'Hırvat Lobisi': {
    summary: '"Bunlar için futbol biraz sertlik, biraz karakter, biraz da Doğu Avrupa ciddiyeti işidir."',
    vibe: 'Sert, disiplinli, karakterli',
    tone: 'Soğukkanlı ama mücadeleci',
    representation: "Fenerbahçe evreninde Balkan çizgisinin daha ciddi, daha omurgalı ve saha karakterine daha çok önem veren kolunu temsil eder.",
    philosophy: 'Hırvat Lobisi için iyi takım dediğin şey önce karakter koyar. Gerektiğinde kavga eder, mücadeleyi bırakmaz, oyunu yumuşatmaz. Bunlar için futbol biraz da omurga işidir. Sadece isme, parlamaya ya da havalı projelere değil; sahada direnç gösteren, takımı ayakta tutan ve gerektiğinde sertleşebilen profillere yakın dururlar.',
    highlights: 'Slaven Bilicciler, Niko Kovaccılar, Hakan Keleşçiler, Recep Uçarcılar, Prosineckiciler, Bjelicacılar, Dalicciler, Ünal Karamancılar, Ömer Erdoğancılar, Ertuğrul Sağlamcılar, Filipe Luisciler, Yakın Koşu Kavakçılar, Şenol Çorlucular, Hüseyin Eroğlucular, Sinan Kaloğlucular, Osman Zeki Korkmazcılar, Tomasçılar.',
    description: 'Bu fraksiyon çok fazla parlatılmış hikâye sevmez. Onların dünyasında takım biraz diri olacak, biraz sert olacak, biraz da “ben buradayım” diyecek. O yüzden bu lobi bazen dışarıdan bakınca aşırı ciddi görünebilir. Çünkü bunlar oyuna biraz savaş, biraz disiplin, biraz da saha psikolojisi üzerinden yaklaşır. Timeline’da çok süslü cümleler kurmayabilirler ama “bu adamın karakteri var” dediklerinde genelde boş konuşmazlar. Hırvat Lobisi biraz da “iyi futbol yumuşaklıkla değil, omurgayla gelir” diyenlerin evidir.',
    tags: ['BALKAN', 'KARAKTER', 'DİSİPLİN', 'MÜCADELE'],
    relatedFactions: {
      similar: ['Balkan Lobisi', 'Rumen Lobisi', 'Anadolu İrfanı'],
      opposite: ['Ütopikçiler', 'İsim Takıntılıları', 'Portekiz Lobisi']
    }
  },
  'Brezilya Lobisi': {
    summary: '"Bunlar için futbol biraz sambadır, biraz kalite, biraz da topa değince akan o eski Fenerbahçe hissi."',
    vibe: 'Yetenekli, estetik, hafif romantik',
    tone: 'Şık, nostaljik, teknik',
    representation: "Fenerbahçe evreninde Brezilya bağlantılı futbol aklını, teknik kaliteyi ve sahada iz bırakmış yıldız etkisini temsil eder.",
    philosophy: 'Brezilya Lobisi için futbol yalnızca plan ve mücadele değildir; biraz da zarafet, teknik kalite ve topun ayağa yakışmasıdır. Bu fraksiyonun insanları sahada fark yaratan oyuncuyu, estetik hissi veren oyunu ve biraz da yıldız ışığını sever. Onlar için bazı figürler sadece oyuncu ya da hoca değil, doğrudan bir dönemin hissidir.',
    highlights: 'Oldschool Brezilyacılar, Carlos Alberto Parreiracılar, Lazaroniciler, Alexciler, Aureliocular, Spalletticiler, Didiciler.',
    description: 'Bu fraksiyon biraz duygusal bir hafızayla çalışır. Çünkü Brezilya Lobisi denince iş sadece isim listesine bakmak değildir; aynı zamanda Fenerbahçe’de teknik kaliteyi, sahadaki estetiği ve “o top bu ayağa çok yakışıyor” hissini hatırlamaktır. Bazen romantik bulunurlar, bazen gereğinden fazla geçmişe bağlı gibi görünürler. Ama onların savunduğu şey aslında basittir: Fenerbahçe yalnızca mücadele eden değil, iz bırakan ve izlenirken keyif veren bir takım da olmalıdır. Bu yüzden bu lobi biraz kalite nostaljisi, biraz da futbol zevki taşır.',
    tags: ['BREZİLYA', 'TEKNİKKALİTE', 'ESTETİK', 'NOSTALJİ'],
    relatedFactions: {
      similar: ['Camia Evladcılar', 'Portekiz Lobisi', 'Hollanda Lobisi'],
      opposite: ['Ahrazbahçeliler', 'Anadolu İrfanı', 'Serdar Ali Çelikler Terör Örgütü']
    }
  },
  'Yabancı Anadolu Hocası İsteyenler': {
    summary: '"Ne büyük isim peşindeler ne de düz nostalji; onlar biraz gizli cevher, biraz saha aklı, biraz da \'bu adam burada iş yapar\' hissinin peşinde."',
    vibe: 'Pratik ve keşifçi',
    tone: 'Niş, gerçekçi, hafif scout kafalı',
    representation: "Fenerbahçe'de büyük CV yerine, lig gerçekliğini okuyabilen, saha düzeni kurabilen ve Anadolu refleksiyle yabancı dokunuşu birleştirebilen hoca arayışını temsil eder.",
    philosophy: 'Bu fraksiyon için mesele yalnızca kariyer değil, uyumdur. Onlara göre her büyük isim Fenerbahçe’ye uymaz; bazen daha az parlayan ama ligi, yapıyı, oyuncu grubunu ve saha pratiğini daha doğru okuyacak bir yabancı hoca çok daha değerli olabilir. Biraz “keşif”, biraz “abi bu adam iş yapar” sezgisi, biraz da sistemli pragmatizm bu tayfanın ana damarıdır.',
    highlights: 'Şumudicacılar, Stoilovcular, Gisdolcüler, Feldkampçılar, Hagiciler, Osieckciler, Thomas Reisçiler, Jakirovicciler, Ömer Kanerciler, Tamer Güneyciler, Vengloscular, Kuntzcular, Lucescucular.',
    description: 'Bu tayfa popüler isimlerle kolay kolay etkilenmez. Onların radarında bazen hiç manşet olmayan ama sahada net karşılığı olabilecek isimler vardır. Biraz “FM save” hissi, biraz “bu hoca tam burada iş yapar” özgüveni, biraz da büyük kulüp refleksinden kopmadan daha akılcı seçim yapma arzusu taşırlar. Dışarıdan bakınca bazen fazla niş görünebilirler. Ama kendi iç mantıkları güçlüdür: Fenerbahçe’ye gelecek hocanın illa manşet ismi olması gerekmez; doğru profil olması yeterlidir. Bu yüzden bu fraksiyon, büyük gösteriden çok doğru eşleşmeyi savunur.',
    tags: ['KEŞİF', 'PRAGMATİZM', 'YABANCIHOCA', 'SAHAGERÇEKÇİLİĞİ'],
    relatedFactions: {
      similar: ['Anadolu İrfanı', 'Rumen Lobisi', 'Hollanda Lobisi'],
      opposite: ['İsim Takıntılıları', 'Ütopikçiler', 'Portekiz Lobisi']
    }
  },
  'Arjantin Lobisi': {
    summary: '"Futbolda biraz delilik, biraz taktik takıntısı, biraz da kenarda sinirli dahi havası arayanların toplandığı yer."',
    vibe: 'Tutkulu ve teorik',
    tone: 'Ateşli, oyun odaklı, hafif çılgın',
    representation: "Fenerbahçe evreninde Arjantin ve Güney Amerika futbol aklının; taktik cesaret, saha karakteri ve yoğun futbol fikri taşıyan kolunu temsil eder.",
    philosophy: 'Arjantin Lobisi için iyi hoca biraz deli, biraz takıntılı, biraz da oyuna fazlasıyla kafayı takmış biri olabilir. Onlar için kenarda yalnızca duran değil, oyunun içine karakterini de katan figürler daha caziptir. Futbol biraz duygu, biraz taktik, biraz da kişilik meselesidir.',
    highlights: 'Prandelliciler, Kluivertçiler, Omerovicciler, Stanojevicciler, Sassariniciler, Joao Pereiracılar, Leonardocular, Sampaoliciler, Gallardocular, Anselmiciler, Setienciler, Pellegriniciler, Farioliciler.',
    description: 'Bu fraksiyonun insanları yalnızca “kim geldi” sorusuna bakmaz; “nasıl oynatacak, ne deneyecek, ne kadar cesur olacak” sorusuna da takılır. Çünkü onların sevdiği profil biraz fikir sahibi, biraz risk alan ve bazen fazla takıntılı görünen teknik adamlardır. Bazen bu tayfa fazla romantik bulunur, bazen de “abi yine çok niş yerlere gittiler” denir. Ama onların bakışında asıl güzellik tam da budur: sıradan çözümler değil, karakteri olan fikirler. Arjantin Lobisi biraz da futbolu düz bir yönetim işi değil, sahadaki bir karakter savaşı gibi görenlerin evidir.',
    tags: ['ARJANTİN', 'TAKTİKCESARET', 'TUTKU', 'OYUNFİKRİ'],
    relatedFactions: {
      similar: ['Portekiz Lobisi', 'Ütopikçiler', 'Hollanda Lobisi'],
      opposite: ['Düz Fenerbahçeliler', 'Ahrazbahçeliler', 'Hacı İsmail Kartalcılar']
    }
  },
  'Milli Takım Hocası İsteyenler': {
    summary: '"Kulüp takımına bile biraz turnuva mantığı, biraz kısa vadeli akıl ve biraz \'hemen sonuç\' refleksiyle bakan özel damar."',
    vibe: 'Sonuç odaklı ve kısa vadeli',
    tone: 'Pratik, serinkanlı, neticeci',
    representation: "Fenerbahçe'de kulüp hocalığından çok, milli takım tipi denge, kısa sürede düzen kurma ve doğrudan sonuç alma beklentisini temsil eder.",
    philosophy: 'Bu fraksiyon için mesele uzun yıllık romantik proje değildir; doğru kadroyu hızlı kuracak, oyuncu grubunu kısa sürede disipline edecek ve doğrudan sonuç alabilecek profil daha değerlidir. Biraz turnuva hocası mantığı, biraz pragmatizm, biraz da “çok uzatmadan takımı toparlasın” hissi bu tayfanın merkezindedir.',
    highlights: 'Montellacılar.',
    description: 'Bu fraksiyon çok geniş bir lobi değil ama kendi içinde net bir mantığı var. Onlar için bazen fazla teorik projeler, fazla uzun vadeli masallar ya da aşırı ideolojik hoca kavgaları yorucudur. Daha sade bir şey isterler: takımı toparla, doğru kadroyu kur, oyunu çok karmaşıklaştırma ve sonuç al. Dışarıdan bakınca biraz “az ama öz” görünürler. Çünkü bu tayfa büyük söylemlerden çok pratik etkiye bakar. Bir milli takım hocasının kulüp takımında da belli bir denge, mesafe ve kısa vadeli düzen kurabileceğine inanırlar.',
    tags: ['MİLLİTAKIM', 'PRAGMATİZM', 'KISAVADE', 'SONUÇODAKLILIK'],
    relatedFactions: {
      similar: ['Anadolu İrfanı', 'Alman Ekolücüler', 'Yabancı Anadolu Hocası İsteyenler'],
      opposite: ['Ütopikçiler', 'İsim Takıntılıları', 'Ahrazbahçeliler']
    }
  },
  'Blancçılar': {
    summary: '"Takım biraz ağırbaşlı olsun, biraz akıllı dursun, biraz da büyük kulüp gibi görünsün isteyenlerin damarı."',
    vibe: 'Ağırbaşlı ve seçkin',
    tone: 'Serinkanlı, düzenli, prestij odaklı',
    representation: "Fenerbahçe’de saha kenarında bağırıp çağırmaktan çok, karizma, denge ve büyük kulüp ağırlığı arayan damarı temsil eder.",
    philosophy: 'Blanççılar için teknik direktör yalnızca taktik veren biri değildir; biraz da kulübün yüzüdür. Kenarda panik yapmayan, oyunu uzaktan da olsa kontrol edebilen, takıma bir ağırlık ve seviye hissi veren figürler bunlara daha çok hitap eder. Onlara göre bazen fazla gürültü değil, doğru tonlama ve doğru duruş lazım.',
    highlights: 'Fernando Santosçular, Defanstan Kısa Pasla Çıkma Fetişistleri, Kenan Koçakçılar, Valverdeciler, Rambo Okancılar, Skibbeciler.',
    description: 'Bu fraksiyon biraz “bağıran değil bilen hoca” sever. Onlara göre büyük takım refleksi bazen yüksek sesle değil, sakin güvenle kurulur. Fazla kaotik, fazla duygusal ya da tamamen içgüdüsel çözümler onlara biraz yorucu gelir. Blanççılar bazen elitist gibi görünebilir; çünkü teknik direktörde yalnızca enerji değil, estetik bir ağırlık da ararlar. Ama kendi içlerinde mantıkları nettir: Fenerbahçe kulübesinde biraz klas, biraz denge, biraz da dışarıdan bakınca “bu kulübün bir standardı var” hissi olmalıdır.',
    tags: ['AĞIRBAŞLILIK', 'PRESTİJ', 'DENGE', 'BÜYÜKKULÜPHİSSİ'],
    relatedFactions: {
      similar: ['Alman Ekolücüler', 'Hollanda Lobisi', 'Portekiz Lobisi'],
      opposite: ['Ahrazbahçeliler', 'Serdar Ali Çelikler Terör Örgütü', 'Ersuncular']
    }
  },
  'Ali Koççu Yahudi Lobisi': {
    summary: '"Kulüpte ne olursa olsun, bir yerden büyük resim çıkarıp olayları stratejik satranç tahtasına bağlayanların mizahi evi."',
    vibe: 'Komplo-sever ve fazla yaratıcı',
    tone: 'Mizahi, uçlarda, internet kafası açık',
    representation: "Fenerbahçe evreninde olayları bazen gereğinden fazla büyük anlatan, her gelişmede görünmez bir satranç hamlesi arayan mizahi damarı temsil eder.",
    philosophy: 'Bu fraksiyon tamamen hafif absürt, internet doğalı ve memetik bir energy taşır. Onlar için kulüpte yaşanan hiçbir şey dümdüz değildir; her transferin, her açıklamanın, her kriz anının arkasında sanki daha büyük bir senaryo vardır. Ciddiyetle mizahın tam ortasında dolaşırlar.',
    highlights: 'Bağımsız tek başına geçen mizahi fraksiyonlardan biridir. Belirgin alt kolu yoktur.',
    description: 'Bu tayfa düz yorum yapmayı pek sevmez. Olayları biraz büyütür, biraz süsler, biraz da “abi bunun arkasında başka işler dönüyor” tadında yorumlar. Elbette tamamen mizahi okunması gereken bir alan burası; olayın eğlencesi de zaten burada başlar. Fenerbahçe internetinin meşhur özelliği olan “bir anda her şeyi fazla büyük okuma” refleksi bu fraksiyonda zirve yapar. Bazen bir yönetim hamlesi, bazen bir açıklama, bazen de alakasız bir gündem başlığı bunların elinde sanki dünya tarihinin dönüm noktasına dönüşebilir.',
    tags: ['MİZAH', 'MEMEENERJİSİ', 'BÜYÜKRESİM', 'İNTERNETFENERBAHÇE'],
    relatedFactions: {
      similar: ['Ahrazbahçeliler', 'Serdar Ali Çelikler Terör Örgütü', 'İsim Takıntılıları'],
      opposite: ['Düz Fenerbahçeliler', 'Alman Ekolücüler', 'Milli Takım Hocası İsteyenler']
    }
  },
  'Esporcular': {
    summary: '"Futbol dünyasında bile refleksi dijital, dili hızlı, heyecanı başka çalışan tayfa."',
    vibe: 'Genç, hızlı, dijital',
    tone: 'Online, enerjik, refleksif',
    representation: "Fenerbahçe evreninde klasik futbol tartışmasının dışına taşıp kulübü espor, dijital kültür ve yeni nesil rekabet üzerinden de okuyan damarı temsil eder.",
    philosophy: 'Esporcular için Fenerbahçe sadece saha içindeki 90 dakikadan ibaret değildir. Kulübün dijital yüzü, yeni nesil rekabet alanları ve internet kültürüyle kurduğu ilişki de işin bir parçasıdır. Onlar biraz daha hızlı düşünür, daha hızlı tepki verir ve klasik taraftar refleksinden daha farklı bir dijital aidiyet taşır.',
    highlights: '2017 Worldscüler, Nextgenciler, Emre Aksoycular, Arkheciler, Magathçılar, Clementçiler.',
    description: 'Bu fraksiyon biraz “kulüp dediğin artık yalnızca çim üstünde yaşamaz” diyenlerin alanıdır. Geleneksel futbol tayfaya bazen fazla dağınık, fazla internet çocuğu gibi görünebilirler; ama onların kurduğu aidiyet başka türlü çalışır. Onlar için rekabetin alanı geniştir, tempo yüksektir ve kültür biraz daha dijital akar.',
    tags: ['ESPOR', 'DİJİTALKÜLTÜR', 'YENİNESİL', 'ONLINEAİDİYET'],
    relatedFactions: {
      similar: ['Düz Fenerbahçeliler', 'Basket Tayfa', 'Voleybol Tayfa'],
      opposite: ['Camia Evladcılar', 'Hacı İsmail Kartalcılar', 'Aykutçular']
    }
  },
  'Finkçiler': {
    summary: '"Niş isimlerden korkmayan, biraz ters köşe, biraz \'siz bilmezsiniz\' enerjisi taşıyan damar."',
    vibe: 'Niş ve ters köşe',
    tone: 'Sessiz, garip derecede özgüvenli, hafif underground',
    representation: "Fenerbahçe evreninde çok parlamayan ama kendi içinde mantığı olan, daha niş teknik direktör ve futbol aklı arayışını temsil eder.",
    philosophy: 'Finkçiler için mesele manşet değil, isabet hissidir. Onlar herkesin konuştuğu isimden ziyade, az kişinin dillendirdiği ama doğru şartlarda işleyebilecek profillere bakar. Biraz ters yoldan yürürler ve bu durumdan da rahatsız olmazlar.',
    highlights: 'Hütterciler, Futbolu Bırakıp Masa Tenisi İzleyenler, Vladimir Petkoviciler, Recep Karatepeciler, Sercan Terzioğlucular.',
    description: 'Bu fraksiyonun insanları timeline’a “abi siz hep aynı 5 ismi sayıyorsunuz” enerjisiyle girer. Onlarda biraz futbol nerd’lüğü, biraz niş keşif tutkusu ve biraz da “trend değil ama mantıklı” özgüveni vardır. Bazen fazla marjinal görünürler ama kendi içlerinde çizgileri nettir: hoca seçimi popülerlik yarışması değildir.',
    tags: ['NİŞ', 'TERSKÖŞE', 'FUTBOLNERD', 'UNDERRATED'],
    relatedFactions: {
      similar: ['Yabancı Anadolu Hocası İsteyenler', 'Rumen Lobisi', 'Hollanda Lobisi'],
      opposite: ['İsim Takıntılıları', 'Ütopikçiler', 'Ahrazbahçeliler']
    }
  },
  'Manciniciler': {
    summary: '"Biraz karizma, biraz büyük kulüp havası, biraz da \'oyunu bilen adam\' etkisi arayanlar."',
    vibe: 'Karizmatik ve sofistike',
    tone: 'Şık, dış referanslı, hafif elit',
    representation: "Fenerbahçe'de yalnızca saha içi düzeni değil, teknik direktör figürünün ağırlığını ve büyük kulüp hissini de önemseyen damarı temsil eder.",
    philosophy: 'Manciniciler için teknik direktör biraz da vitrin işidir. Takımı yönetecek kişi yalnızca plan yapmayacak; kulübeye ağırlık, maça da bir seviye hissi getirecek. O yüzden bunlar sade çözümden çok karakterli, CV’li ve belli bir aura taşıyan figürlere yakın durur.',
    highlights: 'Sarriciler, Gattusocular, Glasnerciler, Van Bronckhorstçular, Graham Pottercılar, Volkan Balcıcılar, İrfan Saraloğlucular.',
    description: 'Bu fraksiyonun içinde biraz teknik akıl, biraz prestij tutkusu ve biraz da “Fenerbahçe kulübesi boş görünmemeli” refleksi vardır. Bazen fazla seçici görünürler, bazen de fazla şık takılırlar. Ama onların derdi sadece isim parlatmak değildir; oyun fikri olan, aynı zamanda kulübeye ağırlık koyan bir profil bulmaktır.',
    tags: ['AURA', 'KARİZMA', 'BÜYÜKKULÜPHİSSİ', 'DIŞREFERANS'],
    relatedFactions: {
      similar: ['Portekiz Lobisi', 'Blancçılar', 'İsim Takıntılıları'],
      opposite: ['Anadolu İrfanı', 'Düz Fenerbahçeliler', 'Hacı İsmail Kartalcılar']
    }
  },
  'Zemancılar': {
    summary: '"Savunma dengesi biraz ağlasın ama hayat olsun, tempo olsun, maç bir şeye benzesin diyenlerin damarı."',
    vibe: 'Cesur ve uçlarda',
    tone: 'Tempo bağımlısı, romantik, hafif çılgın',
    representation: "Fenerbahçe evreninde öne oynayan, risk alan, oyunu steril değil hareketli görmek isteyen futbol romantizmini temsil eder.",
    philosophy: 'Zemancılar için futbol biraz da delilik payı ister. Takım kontrollü ama sıkıcı olacağına, açık vere vere saldıran ve maça hayat getiren bir yapıda olsun daha iyidir. Onlar için oyun bazen kusursuz olmak zorunda değildir; yeter ki cesur olsun, diri olsun, seyir değeri taşısın.',
    highlights: 'Mustafa Denizliciler, Aragonesciler (İsim Takıntılılar).',
    description: 'Bu fraksiyonun insanları düzen sever ama fazla kontrollü, fazla steril yapıya da çabuk sıkılır. Onların gönlünde biraz tempo, biraz cesaret, biraz da “abi bu takım en azından bir şey deniyor” hissi vardır. Bazen fazla romantik kaçabilirler, bazen savunma güvenliğini gereğinden az önemseyebilirler; ama onların dünyasında asıl suç, korkak futboldur.',
    tags: ['TEMPO', 'CESARET', 'FUTBOLROMANTİZMİ', 'RİSK'],
    relatedFactions: {
      similar: ['Ersuncular', 'Ütopikçiler', 'Portekiz Lobisi'],
      opposite: ['Alman Ekolücüler', 'Düz Fenerbahçeliler', 'Milli Takım Hocası İsteyenler']
    }
  },
  'Zeki Murat Göleciler': {
    summary: '"Geçici çözüm gibi görünen şeyden bile bir ihtimal, bir düzen, bir hikâye çıkarabilen özel internet damarı."',
    vibe: 'Geçiş dönemi romantikleri',
    tone: 'Geçici ama ciddiye alan, hafif ironik',
    representation: "Fenerbahçe evreninde ara dönem, geçici emanet ve beklenmedik teknik sorumluluk figürlerinden bile anlam üretmeye çalışan damarı temsil eder.",
    philosophy: 'Zeki Murat Göleciler için mesele bazen büyük plan değil, anı doğru okumaktır. Her şey dağılmışken ortaya çıkan geçici bir figürün bile bir etkisi, bir düzeni ya da en azından bir hikâyesi olabileceğine inanırlar. Biraz geçiş dönemi gerçekçiliği, biraz internet ironisi, biraz da “buradan da bir şey çıkar mı?” merakı taşırlar.',
    highlights: 'Master dosyada bağımsız ve tek başına duran fraksiyonlardan biridir.',
    description: 'Bu fraksiyon biraz Fenerbahçe internetinin özel ürünüdür. Çünkü bazı isimler vardır; normal şartlarda kimse etrafında büyük bir lobi kurmaz dersin, ama tam da bu yüzden etrafında ilginç bir kült oluşur. Zeki Murat Göleciler biraz o hissin karşılığıdır. Tamamen şaka değildir, tamamen ciddi de değildir. Arada bir yerde durur. Hem dönemin kaosunu, hem geçici çözüm halini, hem de Fenerbahçe taraftarının en beklenmedik anda bile yeni bir damar üretme yeteneğini taşır.',
    tags: ['GEÇİŞDÖNEMİ', 'İNTERNETFENERBAHÇE', 'ARAÇÖZÜM', 'MİKROKÜLT'],
    relatedFactions: {
      similar: ['Zemancılar', 'Ersuncular', 'Düz Fenerbahçeliler'],
      opposite: ['İsim Takıntılıları', 'Ütopikçiler', 'Portekiz Lobisi']
    }
  },
  'Serdar Ali Çelikler Terör Örgütü': {
    summary: '"Timeline\'da huzur varken rahatsız olan, tartışma bitince yeni tartışma açan damar."',
    vibe: 'Kaotik ve kışkırtıcı',
    tone: 'Gergin, sert, sürekli tetikte',
    representation: "Fenerbahçe evreninde sürekli huzursuzluk üreten, gündemi sakin bırakmayan, kavga ve reaksiyonla beslenen fraksiyon hattını temsil eder.",
    philosophy: 'Bu fraksiyon için asıl mesele çoğu zaman çözümden çok tartışmanın kendisidir. Ortam sakinse biraz rahatsız olurlar; çünkü onların doğal yaşam alanı tansiyon, sert yorum, bitmeyen hoca tartışması ve sürekli yeni bir ayrışma üretmektir. Bir şey yolunda gidiyor gibi görünse bile, mutlaka oradan yeni bir kriz başlığı çıkarabileceklerine dair tuhaf bir özgüven taşırlar.',
    highlights: 'Hoca Yiyiciler, Dönerci Batıranlar, Aykut Düşmanları (Vardar Örgütü), Buvaccılar, Brendan Rodgersçılar, De Zerbiciler.',
    description: 'Bu tayfa için fikir beyan etmek bazen başlı başına bir aksiyon sporudur. Her teknik direktör tartışmasını birkaç seviye daha sert, birkaç ton daha gergin ve birkaç adım daha kaotik hale getirebilirler. O yüzden bu fraksiyon yalnızca bir görüş etrafında değil, aynı zamanda bir üslup etrafında şekillenir. İçlerinde gerçekten bir hoca isteyen de vardır, bir başka ismi savunan da; ama hepsini birleştiren ortak nokta şudur: ortamın tansiyonu düşmeyecek. Bir yerde düzen kuruluyor gibi görünüyorsa, bu fraksiyon oraya biraz fitne, biraz sertlik, biraz da “yok abi bu iş böyle olmaz” enerjisi taşır.',
    tags: ['KAOS', 'GERGİNLİK', 'REAKSİYON', 'GÜNDEMBAĞIMLILIĞI'],
    relatedFactions: {
      similar: ['Ahrazbahçeliler', 'Ersuncular', 'Balkan Lobisi'],
      opposite: ['Alman Ekolücüler', 'Hollanda Lobisi', 'Düz Fenerbahçeliler']
    }
  }
};

export function enrichFactionData(node: FactionNode, parent?: FactionNode): FactionNode {
  // If already enriched and not in SPECIFIC_DATA, return
  if (node.vibe && !SPECIFIC_DATA[node.name]) return node;

  const enriched = { ...node };
  
  // Apply specific data if available
  if (SPECIFIC_DATA[node.name]) {
    Object.assign(enriched, SPECIFIC_DATA[node.name]);
  }
  
  // Set parent name for header
  if (parent) {
    enriched.parentName = parent.name;
  }

  // Generate deterministic but "random-feeling" data based on name
  const seed = node.name.length + node.depth;
  
  // 1. Summary (if not set)
  if (!enriched.summary) {
    enriched.summary = '';
  }

  // 2. Quick Identity (if not set)
  if (!enriched.vibe) {
    enriched.vibe = VIBE_POOL[seed % VIBE_POOL.length];
  }
  if (!enriched.representation) {
    enriched.representation = `${node.name} zihniyeti, camianın ${node.depth % 2 === 0 ? 'geleneksel' : 'modern'} dokusunu yansıtır.`;
  }
  if (!enriched.tone) {
    enriched.tone = TONE_POOL[(seed * 2) % TONE_POOL.length];
  }

  // 3. Description
  if (!enriched.description) {
    enriched.description = '';
  }

  // 4. Tags
  if (!enriched.tags) {
    const numTags = 2 + (seed % 3);
    const tags: string[] = [];
    for (let i = 0; i < numTags; i++) {
      const tag = TAG_POOL[(seed + i * 7) % TAG_POOL.length];
      if (!tags.includes(tag)) tags.push(tag);
    }
    enriched.tags = tags;
  }

  // 5. Related Factions (if not set)
  if (!enriched.relatedFactions) {
    enriched.relatedFactions = {
      similar: ['Düz Fenerbahçeliler', 'Camia Evladıcılar'].filter(n => n !== node.name).slice(0, 2),
      opposite: ['Ahrazbahçeliler'].filter(n => n !== node.name).slice(0, 1)
    };
  }

  // Recursively enrich children
  if (enriched.children) {
    enriched.children = enriched.children.map(child => enrichFactionData(child, enriched));
  }

  return enriched;
}
