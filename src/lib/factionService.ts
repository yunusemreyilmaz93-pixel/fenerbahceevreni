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
  'Camia Evladıcılar': {
    motto: 'Bizi Ancak Bizden Biri Anlar',
    philosophy: 'Aidiyet duygusu onlar için taktik dizilişten çok daha önemlidir. Çubuklunun ruhunu bilmeyen o kulübeye oturmamalıdır.',
    highlights: 'Tuncay Şanlı, Ümit Özat, Selçuk Şahin, Volkan Demirel, Alex.',
    description: 'Yabancı hocalara karşı her zaman bir şüpheleri vardır. "Buranın havasını solumuş, derbilerin önemini bilen" bir hoca her zaman bir adım öndedir. Vefa, bu fraksiyonun en büyük motivasyonudur.',
    vibe: 'Gelenekçi ve Köklü',
    tone: 'Edebi ve Derin',
    representation: 'Fenerbahçe\'nin "öz değerlerine dönüş" arzusunu temsil ederler.',
    relatedFactions: {
      similar: ['Hacı İsmail Kartalcılar', 'Düz Fenerbahçeliler'],
      opposite: ['Portekiz Lobisi', 'Alman Ekolücüler']
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
