export interface FactionProfile {
  name: string;
  description: string;
  subFactions: string[];
  shortSummary: string;
}

export const FACTION_PROFILES: Record<string, FactionProfile> = {
  'Balkan Lobisi': {
    name: 'Balkan Lobisi',
    description: 'Sen sahada "yumuşaklığa" gelemiyorsun. Senin için futbol; ter, kan ve son dakikaya kadar mücadele demek. Karizmatik ama sert, otoriter ama babacan figürleri seviyorsun.',
    subFactions: ['Tadicciler', 'Dzekocular', 'Veselinovicciler', 'Stankovicciler'],
    shortSummary: 'Sertlik, disiplin ve Balkan inadı senin damarlarında güçlü akıyor.'
  },
  'Hollanda Lobisi': {
    name: 'Hollanda Lobisi',
    description: 'Hücum, Estetik ve Total Hayal Kırıklığı... Fenerbahçe\'nin genetiğindeki hücum futbolunu ancak Hollanda ekolünün geri getirebileceğine inanırsın. 4-3-3 dizilişi senin için bir oyun planı değil, bir yaşam tarzıdır. Her yeni Hollandalı hoca geldiğinde "İşte şimdi Ajax gibi olacağız" diye heyecanlanıp, sezon ortasında "Bu adamlar çok soğuk, buranın iklimine uymadılar" diyerek hüzünlenmenle meşhursun.',
    subFactions: ['Cocucular', 'Koemancılar', 'Hiddinkçiler', 'Advocaatcılar'],
    shortSummary: 'Hücum futbolu, estetik ve total futbol senin yaşam tarzın.'
  },
  'Portekiz Lobisi': {
    name: 'Portekiz Lobisi',
    description: 'Modern futbolun taktik dehasına ve yüksek tempoya bayılıyorsun. Senin hoca dediğin "oyun içinde oyun" kurmalı, her anı domine etmeli.',
    subFactions: ['Jesusçular', 'Mourinhocular', 'Vitorcular', 'Conceiçaocular'],
    shortSummary: 'Teknik kalite, aura ve modern futbol aklı senin damarında güçlü akıyor.'
  },
  'Alman Ekolücüler': {
    name: 'Alman Ekolücüler',
    description: 'Plan, proje, sistem! "Duyguyla değil akılla yönetelim" diyorsun. Disiplin senin kırmızı çizgin, Fenerbahçe\'nin bir futbol fabrikasına dönüşmesini istiyorsun.',
    subFactions: ['Hoeneßçiler', 'Roseciler', 'Jaissleciler', 'Terzicçiler'],
    shortSummary: 'Sen daha çok sistem, disiplin ve düzen üzerinden ikna olan taraftarsın.'
  },
  'Ahrazbahçeliler': {
    name: 'Ahrazbahçeliler',
    description: 'Sen Fenerbahçe\'nin o kaotik havasından besleniyorsun. Herkesin gittiği yolun tersine gitmek, "olmaz" deneni istemek senin karakterin. Bir parça kaos seni hayata bağlar.',
    subFactions: ['Apo Avcıcılar', 'Sergenciler', 'Şenolcular', 'Terimciler'],
    shortSummary: 'Kaos, reaksiyon ve alışılmışın dışındaki yollar senin oyun alanın.'
  },
  'Camia Evladıcılar': {
    name: 'Camia Evladıcılar',
    description: '"Bizi ancak bizden biri anlar" felsefesindesin. Aidiyet duygusu senin için taktik dizilişten çok daha önemli. Çubuklunun ruhunu bilmeyen o kulübeye oturmasın.',
    subFactions: ['Tuncaycılar', 'Ümit Özatçılar', 'Mehmet Topalcılar', 'Kuytçular'],
    shortSummary: 'Sende aidiyet, camia hafızası ve içeriden gelen enerji ağır basıyor.'
  },
  'Anadolu İrfanı': {
    name: 'Anadolu İrfanı',
    description: 'Ligi Bilen, Puanı Alan... Fantastik maceralara gerek olmadığını, bu ligin şifresini ancak buraların tozunu yutmuş hocaların çözeceğini savunursun. Gerçekçisin, "Puan tablosu yalan söylemez" düsturuyla hareket edersin. Sana göre modern taktikler karın doyurmaz; önemli olan kornerden gol bulmak ve 1-0\'ın üzerine yatabilmektir.',
    subFactions: ['Yılmazcılar', 'Rızacılar', 'Tolunay Kafkasçılar', 'Fatih Tekkeciler'],
    shortSummary: 'Ligi bilen, gerçekçi ve sonuç odaklı bir futbol aklına sahipsin.'
  },
  'Ütopikçiler': {
    name: 'Ütopikçiler',
    description: 'Zirve Tek Kişiliktir, O da Bizim Hoca Olmalıdır! Fenerbahçe\'nin vizyonunu Türkiye sınırlarının çok ötesinde, dünya devleriyle bir tutarsın. "Neden olmasın?" sorusu senin temel yakıtındır; imkansızın peşinden koşmak hobindir. Seni bir gün Kadıköy vapurunda Pep Guardiola ile karşılaşacağına ikna etmek zordur ama sen buna yürekten inanırsın.',
    subFactions: ['Pepciler', 'Tuchelciler', 'Kloppcular', 'Xabi Alonsocular'],
    shortSummary: 'Vizyonun sınır tanımıyor, Fenerbahçe için hep en iyisini ve en büyüğünü hayal ediyorsun.'
  },
  'İsim Takıntılıları': {
    name: 'İsim Takıntılıları',
    description: 'CV\'si Parlasın, Karizması Yetsin! Fenerbahçe\'nin büyüklüğünün ancak dünya çapında, marka değeri yüksek isimlerle temsil edilebileceğine inanırsın. Hocanın taktiğinden çok, dünya basınında ne kadar ses getirdiğiyle ilgilenirsin. Takımın başına kim gelirse gelsin, önce Wikipedia sayfasındaki "başarılar" kısmına bakarsın.',
    subFactions: ['Ten Hagcılar', 'Xaviciler', 'Wengerciler', 'Pirlocular'],
    shortSummary: 'Karizma, marka değeri ve dünya çapında temsil senin için her şey.'
  },
  'Hacı İsmail Kartalcılar': {
    name: 'Hacı İsmail Kartalcılar',
    description: 'Samandıra\'nın Dervişi, Fenerbahçe\'nin Askeri... Gösterişsiz başarıya, dürüstlüğe ve sessiz sedasız iş yapmaya önem verirsin. "Fenerbahçe\'nin evladı" kavramının en saf halini temsil edersin. Senin için her şeyin çözümü "Fenerbahçe sevgisi" ve takıma yapılacak "ufak bir dokunuş"tur.',
    subFactions: ['Oldschool İsocular', 'Güçlendirilmiş İsmail Kartalcılar', 'Sonradan İsocu Olanlar'],
    shortSummary: 'Sessiz güç, dürüstlük ve sarsılmaz bir Fenerbahçe aidiyeti senin imzan.'
  },
  'Aykutçular': {
    name: 'Aykutçular',
    description: 'Defansif ciddiyet, matematiksel tutarlılık ve ideolojik bir duruş... Sen skorun değil, bir fikrin peşinden gidiyorsun. "Kocaman" bir sevdan var.',
    subFactions: ['Dinozorbahçeli Aykutçular', 'Sad Edit Tayfa'],
    shortSummary: 'Matematiksel tutarlılık ve sarsılmaz bir futbol ideolojisinin peşindesin.'
  },
  'Düz Fenerbahçeliler': {
    name: 'Düz Fenerbahçeliler',
    description: 'Sen ne fraksiyon bilirsin ne lobi. Pazar günü maç kazanılsın, Pazartesi işe keyifle gidilsin yeter. Senin için tek gerçek skor tabelası ve huzur.',
    subFactions: [],
    shortSummary: 'Senin için tek gerçek Fenerbahçe\'nin galibiyeti ve huzurlu bir Pazartesi.'
  }
};
