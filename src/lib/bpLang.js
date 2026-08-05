/* ============================================================================
   BP — language packs.

   Every sentence BP composes itself lives here in all four languages. What is
   NOT here, on purpose: book titles, author names, genres, blurbs and dates.
   Those are published content (see data/books.js) and stay in the language
   they were written in — translating a book's title would be wrong.

   TO ADD A LANGUAGE: add an entry to LANGS and a matching pack to PACKS. Every
   pack has the same shape, so a missing key is a visible gap, not a crash —
   `pack()` falls back to English per key.

   NOTE: the Spanish, German and Hindi copy is written to be clear and natural,
   but it has not been reviewed by a native speaker. Worth one pass before this
   goes in front of real visitors.
   ========================================================================== */

export const LANGS = [
  { code: 'en', label: 'English', native: 'English', speech: 'en-US' },
  { code: 'es', label: 'Spanish', native: 'Español', speech: 'es-ES' },
  { code: 'de', label: 'German', native: 'Deutsch', speech: 'de-DE' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', speech: 'hi-IN' },
]

export const SERVICE_IDS = ['reviews', 'trailers', 'summaries', 'video-reviews', 'interviews', 'campaigns', 'social', 'website', 'blogs']

/* ------------------------------- English -------------------------------- */

const en = {
  ui: {
    name: 'BP',
    role: 'Books Paradise assistant',
    and: 'and',
    placeholder: 'Ask me about a book, review or author…',
    send: 'Send message',
    close: 'Close chat',
    reset: 'Start a new conversation',
    open: 'Open BP, the Books Paradise assistant',
    voiceOn: 'Turn voice off',
    voiceOff: 'Turn voice on',
    listen: 'Speak your question',
    listening: 'Listening…',
    stopListening: 'Stop listening',
    language: 'Language',
    micUnsupported: 'Voice input isn’t supported in this browser — you can still type.',
    switched: 'Switched to **English**. Everything from here on is in English.',
  },
  chips: {
    latestBooks: 'Latest Books',
    bookReviews: 'Book Reviews',
    authorInterviews: 'Author Interviews',
    promoteMyBook: 'Promote My Book',
    contactUs: 'Contact Us',
    allBooks: 'Browse all books',
    allReviews: 'All reviews',
    allInterviews: 'All interviews',
    bookOfWeek: 'Book of the Week',
    everyWeek: 'See every week',
    latestReviews: 'Latest reviews',
    somethingElse: 'Something else',
    readSummary: 'Read the summary',
    readReview: 'Read the review',
    bookPage: 'Book page',
    similar: 'Similar books',
    allServices: 'All services',
    getStarted: 'Get started',
    contactTeam: 'Contact the team',
    showServices: 'Show me the services',
    openJoin: 'Open Join Us',
    about: 'About Books Paradise',
    whatCanYouDo: 'What can you do?',
    gripping: 'Something gripping',
    cosy: 'Something cosy',
    loveStory: 'A love story',
    magical: 'Something magical',
    bestRated: 'Just show me the best',
    open: (label) => `Open ${label}`,
    see: (label) => `See ${label}`,
  },
  say: {
    greeting:
      'Hi, I’m **BP** — your reading companion at Books Paradise. 📖\n\nI can help you find your next book, point you at our newest reviews, summaries and author interviews, or explain how we promote books for authors.\n\nWhat are you in the mood for?',
    thanks: 'Any time. 🙂 Anything else I can dig out for you?',
    capabilities:
      'Here’s what I’m good for:\n\n• **Finding you a book** — by genre, mood, author or title\n• **The newest reviews, summaries and interviews**\n• **Book of the Week** and the full collection\n• **Getting around the site** — just tell me what you’re looking for\n• **Author services** — reviews, trailers, summary videos, interviews, Goodreads & Amazon campaigns and more',
    promoIntro: 'Happy to help — here’s everything we do for authors:',
    promoOutro: 'Tell me which one you’re curious about, or send your book details through **Join Us** and the team will put a plan together.',
    serviceOutro: 'Want this for your book? Send us the details through **Join Us** and we’ll take it from there.',
    freshest: 'Freshest on the shelf:',
    topRated: 'Our highest-rated titles right now:',
    latestReviews: 'Our latest published reviews:',
    reviewsIntro: 'Honest, in-depth reviews — here’s what readers are reading right now:',
    summariesIntro: 'Every book on the site has a full summary — here are a few to start with:',
    interviewsIntro: 'Author interviews — the writers behind the books, in their own words:',
    latestInterviews: 'The most recent author interviews:',
    weekPicks: (range) => `**Book of the Week** — ${range}’s picks:`,
    bookDetail: (b) =>
      `**${b.title}** — ${b.author}\n${b.genre} · ${b.pages} pages · ★ ${b.rating} from ${b.reviewCount} readers\n\n${b.about.slice(0, 220)}…`,
    reviewIntro: (b, score, quote) => `Here’s our full review of **${b.title}** — we rated it ★ ${score}.\n\n“${quote}…”`,
    summaryIntro: (b) => `**${b.title}** by ${b.author}\n\n${b.about}`,
    similar: (title, genre) => `If you liked **${title}**, these share its ${genre} streak.`,
    author: (name, what, hasInterview) => `**${name}** — ${what} on the site${hasInterview ? ', plus an interview' : ''}.`,
    genreLead: (genre) => `Good call — our best **${genre}** on the shelf.`,
    moodLead: (line) => `So you’re after ${line}.`,
    startHere: 'Here’s where I’d start:',
    recommendAsk: 'Happy to. What are you in the mood for?',
    navTo: (label) => `Right this way — **${label}**.`,
    navPlain: (label) => `**${label}** is what you want.`,
    fallback:
      'I’m not sure I got that one. I’m best at finding books, reviews, summaries and author interviews — or explaining how we promote books for authors.\n\nTry one of these?',
    empty: 'I didn’t catch that — try asking me for a book, a review, or how to promote your book.',
    cardKind: { book: 'Book', review: 'Review', summary: 'Summary', interview: 'Interview' },
    metaReview: (score) => `Full review · ★ ${score}`,
    metaSummary: (pages) => `Summary · ${pages} pages`,
  },
  moods: {
    cozy: 'something warm and easy to sink into',
    dark: 'something dark and atmospheric',
    thrilling: 'something that keeps you turning pages',
    romantic: 'a proper love story',
    emotional: 'something that will move you',
    uplifting: 'something hopeful',
    escape: 'somewhere else entirely',
    magical: 'a little magic',
    thoughtful: 'something quieter and beautifully written',
    historical: 'something set in the past',
  },
  places: {
    books: 'Featured Books',
    'all-books': 'The full book collection',
    reviews: 'Book Reviews',
    trailers: 'Book Trailers',
    weeks: 'Book of the Week',
    interviews: 'Author Interviews',
    community: 'the Community',
    about: 'About Books Paradise',
    offer: 'What We Offer',
    newsletter: 'Join Us',
  },
  services: {
    reviews: {
      name: 'Honest Book Reviews',
      blurb: 'Genuine, in-depth reviews that build trust and help readers find their next favourite read.',
      bullets: ['A full written review published on the site', 'Covers story, characters, pacing and writing', 'Shared with our reading community'],
    },
    trailers: {
      name: 'Cinematic Book Trailers',
      blurb: 'High-quality cinematic videos that capture your book’s essence and leave a lasting impression.',
      bullets: ['Scripted and edited around your story', 'Built for social feeds and retail pages', 'Delivered ready to post'],
    },
    summaries: {
      name: 'Book Summary Videos',
      blurb: 'Short, beautifully produced videos that walk readers through what your book is about — without spoiling it.',
      bullets: ['A tight, spoiler-safe retelling', 'Narrated and captioned', 'Great for discovery on social'],
    },
    'video-reviews': {
      name: 'Video Reviews',
      blurb: 'A reviewer on camera talking through your book — the format readers trust most.',
      bullets: ['Spoken, personal and honest', 'Published to our channels', 'Clips you can reuse in ads'],
    },
    interviews: {
      name: 'Author Interviews',
      blurb: 'Highlighting authors, their journey and their stories — so readers connect with you, not just the book.',
      bullets: ['A written Q&A published on the site', 'Your story, process and what’s next', 'Linked to your book page'],
    },
    campaigns: {
      name: 'Goodreads & Amazon Review Campaigns',
      blurb: 'Organised reader campaigns that get your book in front of reviewers on the platforms that matter for sales.',
      bullets: ['Reader outreach on Goodreads and Amazon', 'Coordinated around your launch date', 'Reviews are always the reader’s own honest opinion'],
    },
    social: {
      name: 'Social Media Promotion',
      blurb: 'Book features across Instagram, Facebook, YouTube and the website to put your book in front of a wider audience.',
      bullets: ['Feature posts and reels', 'Cross-posted to the site', 'Built to drive real engagement'],
    },
    website: {
      name: 'Author Website Creation',
      blurb: 'Professional, author-focused websites that establish your online presence and connect you with readers.',
      bullets: ['Designed around your books', 'Mobile-ready and fast', 'Yours to keep and grow'],
    },
    blogs: {
      name: 'Book Blogs & Articles',
      blurb: 'Engaging blog posts that inform, inspire and bring more visibility to your book and brand.',
      bullets: ['Written around your themes', 'Published on the site', 'Search-friendly and shareable'],
    },
  },
  faqs: {
    submit:
      'Send us your book details — title, genre, a short blurb and where it’s available — and we’ll come back with the services that fit it best.\n\nThe quickest way is the **Join Us** form at the bottom of the home page.',
    pricing:
      'Pricing isn’t published on the site — packages are put together around what a book actually needs, so it varies.\n\nShare your book and which services interest you through **Join Us** and the team will come back to you directly.',
    timeline:
      'Timelines depend on the service and how busy the queue is — a written review moves faster than a cinematic trailer.\n\nAsk the team through **Join Us** with your launch date and they’ll tell you what’s realistic.',
    honest:
      'Reviews here are honest ones. A promotion package buys the reviewer’s **time and attention**, never a particular rating — what they think of the book is theirs alone.\n\nThat’s the whole point: readers only trust reviews they believe are real.',
    genres: (list) => `We cover a wide spread — the shelf right now runs across ${list}.\n\nIf your book sits outside that, still ask; it’s worth a conversation.`,
    indie:
      'Absolutely — indie and debut authors are a big part of what we do. A first book often needs the visibility most.\n\nTell us about yours through **Join Us** and we’ll suggest where to start.',
    formats:
      'Format isn’t a barrier — ebook, paperback, hardcover or audiobook all work for reviews, trailers and features.\n\nMention the formats you have when you get in touch.',
    contact:
      'The fastest way to reach us is the **Join Us** form at the foot of the home page — drop your email there and the team picks it up from your side.\n\nReaders are welcome too: it’s also how you get new reviews, trailers and weekly picks in your inbox.',
    about:
      'Books Paradise is a home for readers and authors: honest reviews, cinematic book trailers, author interviews and weekly picks — plus promotion services that help authors reach readers.\n\nI’m **BP**, the assistant here. I can find you a book, point you at a review or interview, or walk you through the author services.',
  },
}

/* ------------------------------- Spanish -------------------------------- */

const es = {
  ui: {
    name: 'BP',
    role: 'Asistente de Books Paradise',
    and: 'y',
    placeholder: 'Pregúntame por un libro, reseña o autor…',
    send: 'Enviar mensaje',
    close: 'Cerrar chat',
    reset: 'Empezar una conversación nueva',
    open: 'Abrir BP, el asistente de Books Paradise',
    voiceOn: 'Desactivar la voz',
    voiceOff: 'Activar la voz',
    listen: 'Habla tu pregunta',
    listening: 'Escuchando…',
    stopListening: 'Dejar de escuchar',
    language: 'Idioma',
    micUnsupported: 'Este navegador no admite la entrada por voz, pero puedes escribir.',
    switched: 'Cambiado a **español**. A partir de ahora te respondo en español.',
  },
  chips: {
    latestBooks: 'Libros nuevos',
    bookReviews: 'Reseñas',
    authorInterviews: 'Entrevistas',
    promoteMyBook: 'Promocionar mi libro',
    contactUs: 'Contacto',
    allBooks: 'Ver todos los libros',
    allReviews: 'Todas las reseñas',
    allInterviews: 'Todas las entrevistas',
    bookOfWeek: 'Libro de la semana',
    everyWeek: 'Ver todas las semanas',
    latestReviews: 'Últimas reseñas',
    somethingElse: 'Otra cosa',
    readSummary: 'Leer el resumen',
    readReview: 'Leer la reseña',
    bookPage: 'Página del libro',
    similar: 'Libros parecidos',
    allServices: 'Todos los servicios',
    getStarted: 'Empezar',
    contactTeam: 'Hablar con el equipo',
    showServices: 'Ver los servicios',
    openJoin: 'Abrir Únete',
    about: 'Sobre Books Paradise',
    whatCanYouDo: '¿Qué puedes hacer?',
    gripping: 'Algo trepidante',
    cosy: 'Algo acogedor',
    loveStory: 'Una historia de amor',
    magical: 'Algo mágico',
    bestRated: 'Enséñame lo mejor',
    open: (label) => `Abrir ${label}`,
    see: (label) => `Ver ${label}`,
  },
  say: {
    greeting:
      'Hola, soy **BP**, tu compañero de lectura en Books Paradise. 📖\n\nPuedo ayudarte a encontrar tu próximo libro, mostrarte nuestras reseñas, resúmenes y entrevistas más recientes, o explicarte cómo promocionamos libros para autores.\n\n¿Qué te apetece leer?',
    thanks: 'Cuando quieras. 🙂 ¿Te busco algo más?',
    capabilities:
      'Esto es lo que sé hacer:\n\n• **Encontrarte un libro** — por género, estado de ánimo, autor o título\n• **Las reseñas, resúmenes y entrevistas más recientes**\n• **El libro de la semana** y la colección completa\n• **Guiarte por la web** — dime qué buscas\n• **Servicios para autores** — reseñas, tráileres, vídeos de resumen, entrevistas, campañas en Goodreads y Amazon y más',
    promoIntro: 'Con mucho gusto. Esto es todo lo que hacemos por los autores:',
    promoOutro: 'Dime cuál te interesa, o envíanos los datos de tu libro desde **Únete** y el equipo preparará un plan.',
    serviceOutro: '¿Lo quieres para tu libro? Envíanos los datos desde **Únete** y seguimos desde ahí.',
    freshest: 'Lo más nuevo en la estantería:',
    topRated: 'Nuestros títulos mejor valorados ahora mismo:',
    latestReviews: 'Nuestras reseñas más recientes:',
    reviewsIntro: 'Reseñas honestas y a fondo. Esto es lo que están leyendo ahora:',
    summariesIntro: 'Cada libro de la web tiene un resumen completo. Aquí van algunos para empezar:',
    interviewsIntro: 'Entrevistas de autor: quienes escriben los libros, en sus propias palabras:',
    latestInterviews: 'Las entrevistas de autor más recientes:',
    weekPicks: (range) => `**Libro de la semana** — selección del ${range}:`,
    bookDetail: (b) =>
      `**${b.title}** — ${b.author}\n${b.genre} · ${b.pages} páginas · ★ ${b.rating} según ${b.reviewCount} lectores\n\n${b.about.slice(0, 220)}…`,
    reviewIntro: (b, score, quote) => `Esta es nuestra reseña completa de **${b.title}**. Le dimos ★ ${score}.\n\n«${quote}…»`,
    summaryIntro: (b) => `**${b.title}**, de ${b.author}\n\n${b.about}`,
    similar: (title, genre) => `Si te gustó **${title}**, estos comparten su vena ${genre}.`,
    author: (name, what, hasInterview) => `**${name}** — ${what} en la web${hasInterview ? ', y además una entrevista' : ''}.`,
    genreLead: (genre) => `Buena elección: lo mejor que tenemos en **${genre}**.`,
    moodLead: (line) => `Así que buscas ${line}.`,
    startHere: 'Yo empezaría por aquí:',
    recommendAsk: 'Encantado. ¿Qué te apetece?',
    navTo: (label) => `Por aquí — **${label}**.`,
    navPlain: (label) => `Lo que buscas es **${label}**.`,
    fallback:
      'No estoy seguro de haberte entendido. Se me da bien encontrar libros, reseñas, resúmenes y entrevistas, o explicar cómo promocionamos libros para autores.\n\n¿Probamos con alguna de estas?',
    empty: 'No te he entendido. Pídeme un libro, una reseña, o pregúntame cómo promocionar tu libro.',
    cardKind: { book: 'Libro', review: 'Reseña', summary: 'Resumen', interview: 'Entrevista' },
    metaReview: (score) => `Reseña completa · ★ ${score}`,
    metaSummary: (pages) => `Resumen · ${pages} páginas`,
  },
  moods: {
    cozy: 'algo cálido y acogedor',
    dark: 'algo oscuro y con mucha atmósfera',
    thrilling: 'algo que no te deje soltar el libro',
    romantic: 'una buena historia de amor',
    emotional: 'algo que te emocione',
    uplifting: 'algo esperanzador',
    escape: 'escaparte a otro sitio',
    magical: 'un poco de magia',
    thoughtful: 'algo más pausado y muy bien escrito',
    historical: 'algo ambientado en el pasado',
  },
  places: {
    books: 'Libros destacados',
    'all-books': 'La colección completa',
    reviews: 'Reseñas',
    trailers: 'Tráileres de libros',
    weeks: 'Libro de la semana',
    interviews: 'Entrevistas de autor',
    community: 'la Comunidad',
    about: 'Sobre Books Paradise',
    offer: 'Lo que ofrecemos',
    newsletter: 'Únete',
  },
  services: {
    reviews: {
      name: 'Reseñas honestas',
      blurb: 'Reseñas auténticas y a fondo que generan confianza y ayudan a los lectores a elegir su próxima lectura.',
      bullets: ['Una reseña escrita completa publicada en la web', 'Analiza historia, personajes, ritmo y estilo', 'Compartida con nuestra comunidad lectora'],
    },
    trailers: {
      name: 'Tráileres cinematográficos',
      blurb: 'Vídeos de alta calidad que capturan la esencia de tu libro y dejan huella.',
      bullets: ['Guionizados y editados a partir de tu historia', 'Pensados para redes y páginas de venta', 'Listos para publicar'],
    },
    summaries: {
      name: 'Vídeos de resumen',
      blurb: 'Vídeos breves y bien producidos que cuentan de qué va tu libro, sin destriparlo.',
      bullets: ['Un resumen ágil y sin spoilers', 'Con narración y subtítulos', 'Ideal para que te descubran en redes'],
    },
    'video-reviews': {
      name: 'Reseñas en vídeo',
      blurb: 'Alguien hablando de tu libro ante la cámara: el formato en el que más confían los lectores.',
      bullets: ['Cercano, personal y honesto', 'Publicado en nuestros canales', 'Con clips que puedes reutilizar en anuncios'],
    },
    interviews: {
      name: 'Entrevistas de autor',
      blurb: 'Damos espacio a los autores, su trayectoria y sus historias, para que los lectores conecten contigo y no solo con el libro.',
      bullets: ['Una entrevista escrita publicada en la web', 'Tu historia, tu proceso y lo que viene', 'Enlazada a la página de tu libro'],
    },
    campaigns: {
      name: 'Campañas en Goodreads y Amazon',
      blurb: 'Campañas organizadas que ponen tu libro delante de reseñadores en las plataformas que de verdad influyen en las ventas.',
      bullets: ['Contacto con lectores en Goodreads y Amazon', 'Coordinadas con tu fecha de lanzamiento', 'La opinión del lector siempre es suya y honesta'],
    },
    social: {
      name: 'Promoción en redes sociales',
      blurb: 'Presencia de tu libro en Instagram, Facebook, YouTube y la web para llegar a mucho más público.',
      bullets: ['Publicaciones y reels destacados', 'Replicado también en la web', 'Pensado para generar interacción real'],
    },
    website: {
      name: 'Creación de webs de autor',
      blurb: 'Webs profesionales centradas en el autor, que consolidan tu presencia online y te acercan a los lectores.',
      bullets: ['Diseñada en torno a tus libros', 'Rápida y adaptada a móvil', 'Tuya, para conservarla y hacerla crecer'],
    },
    blogs: {
      name: 'Blogs y artículos',
      blurb: 'Artículos que informan, inspiran y dan más visibilidad a tu libro y a tu marca.',
      bullets: ['Escritos en torno a tus temas', 'Publicados en la web', 'Optimizados para buscadores y fáciles de compartir'],
    },
  },
  faqs: {
    submit:
      'Envíanos los datos de tu libro — título, género, una sinopsis breve y dónde está disponible — y te diremos qué servicios le encajan mejor.\n\nLo más rápido es el formulario **Únete** al final de la página de inicio.',
    pricing:
      'Los precios no están publicados en la web: cada paquete se arma según lo que el libro necesita, así que varía.\n\nCuéntanos tu libro y qué servicios te interesan desde **Únete** y el equipo te responderá directamente.',
    timeline:
      'Los plazos dependen del servicio y de la carga de trabajo: una reseña escrita sale antes que un tráiler cinematográfico.\n\nEscribe al equipo desde **Únete** con tu fecha de lanzamiento y te dirán qué es realista.',
    honest:
      'Aquí las reseñas son honestas. Un paquete de promoción paga el **tiempo y la atención** del reseñador, nunca una nota concreta: lo que opine del libro es solo suyo.\n\nDe eso se trata: los lectores solo confían en las reseñas que creen auténticas.',
    genres: (list) => `Abarcamos bastante: ahora mismo la estantería incluye ${list}.\n\nSi tu libro queda fuera de ahí, pregúntanos igualmente; merece la pena hablarlo.`,
    indie:
      'Por supuesto. Los autores independientes y quienes debutan son buena parte de lo que hacemos, y un primer libro suele ser el que más visibilidad necesita.\n\nCuéntanos el tuyo desde **Únete** y te proponemos por dónde empezar.',
    formats:
      'El formato no es un problema: ebook, tapa blanda, tapa dura o audiolibro sirven para reseñas, tráileres y entrevistas.\n\nIndícanos qué formatos tienes cuando nos escribas.',
    contact:
      'La forma más rápida de contactarnos es el formulario **Únete** al pie de la página de inicio: deja tu correo y el equipo lo recoge desde su lado.\n\nLos lectores también son bienvenidos: así recibes nuevas reseñas, tráileres y selecciones semanales en tu correo.',
    about:
      'Books Paradise es una casa para lectores y autores: reseñas honestas, tráileres cinematográficos, entrevistas de autor y selecciones semanales, además de servicios de promoción para que los autores lleguen a sus lectores.\n\nYo soy **BP**, el asistente. Puedo buscarte un libro, llevarte a una reseña o entrevista, o explicarte los servicios para autores.',
  },
}

/* -------------------------------- German -------------------------------- */

const de = {
  ui: {
    name: 'BP',
    role: 'Books-Paradise-Assistent',
    and: 'und',
    placeholder: 'Frag mich nach einem Buch, einer Rezension oder einem Autor…',
    send: 'Nachricht senden',
    close: 'Chat schließen',
    reset: 'Neues Gespräch beginnen',
    open: 'BP öffnen, den Books-Paradise-Assistenten',
    voiceOn: 'Sprachausgabe ausschalten',
    voiceOff: 'Sprachausgabe einschalten',
    listen: 'Frage einsprechen',
    listening: 'Ich höre zu…',
    stopListening: 'Aufnahme beenden',
    language: 'Sprache',
    micUnsupported: 'Dieser Browser unterstützt keine Spracheingabe – tippen geht aber weiterhin.',
    switched: 'Auf **Deutsch** umgestellt. Ab jetzt antworte ich auf Deutsch.',
  },
  chips: {
    latestBooks: 'Neue Bücher',
    bookReviews: 'Rezensionen',
    authorInterviews: 'Autoreninterviews',
    promoteMyBook: 'Mein Buch bewerben',
    contactUs: 'Kontakt',
    allBooks: 'Alle Bücher ansehen',
    allReviews: 'Alle Rezensionen',
    allInterviews: 'Alle Interviews',
    bookOfWeek: 'Buch der Woche',
    everyWeek: 'Alle Wochen ansehen',
    latestReviews: 'Neueste Rezensionen',
    somethingElse: 'Etwas anderes',
    readSummary: 'Zusammenfassung lesen',
    readReview: 'Rezension lesen',
    bookPage: 'Buchseite',
    similar: 'Ähnliche Bücher',
    allServices: 'Alle Leistungen',
    getStarted: 'Loslegen',
    contactTeam: 'Team kontaktieren',
    showServices: 'Leistungen anzeigen',
    openJoin: '„Mitmachen“ öffnen',
    about: 'Über Books Paradise',
    whatCanYouDo: 'Was kannst du?',
    gripping: 'Etwas Spannendes',
    cosy: 'Etwas Gemütliches',
    loveStory: 'Eine Liebesgeschichte',
    magical: 'Etwas Magisches',
    bestRated: 'Zeig mir das Beste',
    open: (label) => `${label} öffnen`,
    see: (label) => `${label} ansehen`,
  },
  say: {
    greeting:
      'Hallo, ich bin **BP** – dein Lesebegleiter bei Books Paradise. 📖\n\nIch helfe dir, dein nächstes Buch zu finden, zeige dir unsere neuesten Rezensionen, Zusammenfassungen und Autoreninterviews oder erkläre dir, wie wir Bücher für Autoren bewerben.\n\nWorauf hast du Lust?',
    thanks: 'Jederzeit. 🙂 Kann ich sonst noch etwas heraussuchen?',
    capabilities:
      'Das kann ich für dich tun:\n\n• **Ein Buch finden** – nach Genre, Stimmung, Autor oder Titel\n• **Die neuesten Rezensionen, Zusammenfassungen und Interviews**\n• **Buch der Woche** und die vollständige Sammlung\n• **Dich über die Seite führen** – sag mir einfach, was du suchst\n• **Leistungen für Autoren** – Rezensionen, Trailer, Zusammenfassungsvideos, Interviews, Goodreads- und Amazon-Kampagnen und mehr',
    promoIntro: 'Sehr gerne – das bieten wir Autoren an:',
    promoOutro: 'Sag mir, was dich interessiert, oder schick uns die Daten zu deinem Buch über **Mitmachen** – dann stellt das Team einen Plan zusammen.',
    serviceOutro: 'Möchtest du das für dein Buch? Schick uns die Details über **Mitmachen**, dann kümmern wir uns darum.',
    freshest: 'Das Neueste im Regal:',
    topRated: 'Unsere aktuell bestbewerteten Titel:',
    latestReviews: 'Unsere neuesten Rezensionen:',
    reviewsIntro: 'Ehrliche, ausführliche Rezensionen – das lesen unsere Leser gerade:',
    summariesIntro: 'Zu jedem Buch auf der Seite gibt es eine vollständige Zusammenfassung. Hier ein paar zum Anfangen:',
    interviewsIntro: 'Autoreninterviews – die Menschen hinter den Büchern, in ihren eigenen Worten:',
    latestInterviews: 'Die neuesten Autoreninterviews:',
    weekPicks: (range) => `**Buch der Woche** – die Auswahl vom ${range}:`,
    bookDetail: (b) =>
      `**${b.title}** – ${b.author}\n${b.genre} · ${b.pages} Seiten · ★ ${b.rating} von ${b.reviewCount} Lesern\n\n${b.about.slice(0, 220)}…`,
    reviewIntro: (b, score, quote) => `Hier ist unsere vollständige Rezension zu **${b.title}** – wir haben ★ ${score} vergeben.\n\n„${quote}…“`,
    summaryIntro: (b) => `**${b.title}** von ${b.author}\n\n${b.about}`,
    similar: (title, genre) => `Wenn dir **${title}** gefallen hat, teilen diese den ${genre}-Zug.`,
    author: (name, what, hasInterview) => `**${name}** – ${what} auf der Seite${hasInterview ? ', dazu ein Interview' : ''}.`,
    genreLead: (genre) => `Gute Wahl – unser Bestes im Bereich **${genre}**.`,
    moodLead: (line) => `Du suchst also ${line}.`,
    startHere: 'Damit würde ich anfangen:',
    recommendAsk: 'Sehr gerne. Worauf hast du Lust?',
    navTo: (label) => `Hier entlang – **${label}**.`,
    navPlain: (label) => `**${label}** ist das, was du suchst.`,
    fallback:
      'Das habe ich nicht ganz verstanden. Am besten bin ich darin, Bücher, Rezensionen, Zusammenfassungen und Autoreninterviews zu finden – oder zu erklären, wie wir Bücher für Autoren bewerben.\n\nVielleicht eines davon?',
    empty: 'Das habe ich nicht verstanden. Frag mich nach einem Buch, einer Rezension oder danach, wie du dein Buch bewerben kannst.',
    cardKind: { book: 'Buch', review: 'Rezension', summary: 'Zusammenfassung', interview: 'Interview' },
    metaReview: (score) => `Vollständige Rezension · ★ ${score}`,
    metaSummary: (pages) => `Zusammenfassung · ${pages} Seiten`,
  },
  moods: {
    cozy: 'etwas Warmes zum Wohlfühlen',
    dark: 'etwas Dunkles mit dichter Atmosphäre',
    thrilling: 'etwas, das dich nicht mehr loslässt',
    romantic: 'eine richtige Liebesgeschichte',
    emotional: 'etwas, das dich berührt',
    uplifting: 'etwas Hoffnungsvolles',
    escape: 'einen Ort weit weg von hier',
    magical: 'ein bisschen Magie',
    thoughtful: 'etwas Ruhigeres und sehr schön Geschriebenes',
    historical: 'etwas, das in der Vergangenheit spielt',
  },
  places: {
    books: 'Ausgewählte Bücher',
    'all-books': 'Die vollständige Sammlung',
    reviews: 'Rezensionen',
    trailers: 'Buchtrailer',
    weeks: 'Buch der Woche',
    interviews: 'Autoreninterviews',
    community: 'die Community',
    about: 'Über Books Paradise',
    offer: 'Unser Angebot',
    newsletter: 'Mitmachen',
  },
  services: {
    reviews: {
      name: 'Ehrliche Buchrezensionen',
      blurb: 'Echte, ausführliche Rezensionen, die Vertrauen schaffen und Lesern bei der nächsten Buchwahl helfen.',
      bullets: ['Eine vollständige Rezension auf der Seite', 'Zu Handlung, Figuren, Tempo und Sprache', 'Mit unserer Lese-Community geteilt'],
    },
    trailers: {
      name: 'Cineastische Buchtrailer',
      blurb: 'Hochwertige Videos, die das Wesen deines Buches einfangen und im Gedächtnis bleiben.',
      bullets: ['Nach deiner Geschichte geschrieben und geschnitten', 'Für Social Media und Shopseiten gemacht', 'Fertig zum Veröffentlichen'],
    },
    summaries: {
      name: 'Zusammenfassungsvideos',
      blurb: 'Kurze, schön produzierte Videos, die zeigen, worum es in deinem Buch geht – ohne zu spoilern.',
      bullets: ['Kompakt und spoilerfrei erzählt', 'Vertont und untertitelt', 'Ideal, um auf Social Media entdeckt zu werden'],
    },
    'video-reviews': {
      name: 'Video-Rezensionen',
      blurb: 'Jemand spricht vor der Kamera über dein Buch – das Format, dem Leser am meisten vertrauen.',
      bullets: ['Persönlich, gesprochen und ehrlich', 'Auf unseren Kanälen veröffentlicht', 'Mit Clips für deine Werbung'],
    },
    interviews: {
      name: 'Autoreninterviews',
      blurb: 'Wir rücken Autoren, ihren Weg und ihre Geschichten ins Licht – damit Leser sich mit dir verbinden, nicht nur mit dem Buch.',
      bullets: ['Ein schriftliches Interview auf der Seite', 'Deine Geschichte, dein Arbeitsprozess, deine Pläne', 'Mit deiner Buchseite verlinkt'],
    },
    campaigns: {
      name: 'Goodreads- und Amazon-Kampagnen',
      blurb: 'Organisierte Leserkampagnen, die dein Buch auf den Plattformen sichtbar machen, die für den Verkauf zählen.',
      bullets: ['Leseransprache auf Goodreads und Amazon', 'Auf deinen Erscheinungstermin abgestimmt', 'Die Bewertung bleibt immer die ehrliche Meinung des Lesers'],
    },
    social: {
      name: 'Social-Media-Promotion',
      blurb: 'Beiträge auf Instagram, Facebook, YouTube und der Website, damit dein Buch ein größeres Publikum erreicht.',
      bullets: ['Feature-Posts und Reels', 'Zusätzlich auf der Website', 'Auf echte Interaktion ausgelegt'],
    },
    website: {
      name: 'Autoren-Websites',
      blurb: 'Professionelle Websites rund um den Autor, die deine Online-Präsenz aufbauen und dich mit Lesern verbinden.',
      bullets: ['Rund um deine Bücher gestaltet', 'Schnell und für Mobilgeräte gemacht', 'Gehört dir und wächst mit'],
    },
    blogs: {
      name: 'Buchblogs und Artikel',
      blurb: 'Beiträge, die informieren, inspirieren und deinem Buch und deiner Marke mehr Sichtbarkeit verschaffen.',
      bullets: ['Rund um deine Themen geschrieben', 'Auf der Seite veröffentlicht', 'Suchmaschinenfreundlich und teilbar'],
    },
  },
  faqs: {
    submit:
      'Schick uns die Daten zu deinem Buch – Titel, Genre, einen kurzen Klappentext und wo es erhältlich ist – und wir melden uns mit den passenden Leistungen.\n\nAm schnellsten geht das über das Formular **Mitmachen** unten auf der Startseite.',
    pricing:
      'Preise stehen nicht auf der Website – die Pakete werden danach zusammengestellt, was ein Buch wirklich braucht, und sind deshalb unterschiedlich.\n\nSchreib uns über **Mitmachen**, welches Buch und welche Leistungen dich interessieren, dann meldet sich das Team direkt bei dir.',
    timeline:
      'Die Dauer hängt von der Leistung und der Auslastung ab – eine geschriebene Rezension geht schneller als ein cineastischer Trailer.\n\nNenn dem Team über **Mitmachen** deinen Erscheinungstermin, dann sagen sie dir, was realistisch ist.',
    honest:
      'Die Rezensionen hier sind ehrlich. Ein Werbepaket bezahlt die **Zeit und Aufmerksamkeit** des Rezensenten, niemals eine bestimmte Bewertung – was er vom Buch hält, bleibt ihm überlassen.\n\nGenau darum geht es: Leser vertrauen nur Rezensionen, die sie für echt halten.',
    genres: (list) => `Wir decken viel ab – im Regal stehen gerade ${list}.\n\nWenn dein Buch da nicht hineinpasst, frag trotzdem; es lohnt sich, darüber zu sprechen.`,
    indie:
      'Auf jeden Fall. Indie- und Debütautoren machen einen großen Teil unserer Arbeit aus, und gerade ein erstes Buch braucht Sichtbarkeit am dringendsten.\n\nErzähl uns über **Mitmachen** von deinem, dann schlagen wir dir einen Einstieg vor.',
    formats:
      'Das Format ist kein Hindernis – E-Book, Taschenbuch, Hardcover oder Hörbuch funktionieren für Rezensionen, Trailer und Interviews gleichermaßen.\n\nSag uns einfach, welche Formate es gibt.',
    contact:
      'Am schnellsten erreichst du uns über das Formular **Mitmachen** am Fuß der Startseite – trag dort deine E-Mail ein, das Team meldet sich.\n\nLeser sind ebenso willkommen: So bekommst du neue Rezensionen, Trailer und die Wochenauswahl in dein Postfach.',
    about:
      'Books Paradise ist ein Zuhause für Leser und Autoren: ehrliche Rezensionen, cineastische Buchtrailer, Autoreninterviews und Wochenauswahlen – dazu Werbeleistungen, mit denen Autoren ihre Leser erreichen.\n\nIch bin **BP**, der Assistent hier. Ich finde dir ein Buch, führe dich zu einer Rezension oder einem Interview oder erkläre dir die Leistungen für Autoren.',
  },
}

/* -------------------------------- Hindi --------------------------------- */

const hi = {
  ui: {
    name: 'BP',
    role: 'Books Paradise सहायक',
    and: 'और',
    placeholder: 'किसी किताब, समीक्षा या लेखक के बारे में पूछें…',
    send: 'संदेश भेजें',
    close: 'चैट बंद करें',
    reset: 'नई बातचीत शुरू करें',
    open: 'BP खोलें, Books Paradise का सहायक',
    voiceOn: 'आवाज़ बंद करें',
    voiceOff: 'आवाज़ चालू करें',
    listen: 'अपना सवाल बोलें',
    listening: 'सुन रहा हूँ…',
    stopListening: 'सुनना बंद करें',
    language: 'भाषा',
    micUnsupported: 'इस ब्राउज़र में आवाज़ से पूछना उपलब्ध नहीं है — आप लिखकर पूछ सकते हैं।',
    switched: '**हिन्दी** पर बदल दिया गया। अब से मैं हिन्दी में जवाब दूँगा।',
  },
  chips: {
    latestBooks: 'नई किताबें',
    bookReviews: 'समीक्षाएँ',
    authorInterviews: 'लेखक इंटरव्यू',
    promoteMyBook: 'मेरी किताब का प्रचार',
    contactUs: 'संपर्क करें',
    allBooks: 'सभी किताबें देखें',
    allReviews: 'सभी समीक्षाएँ',
    allInterviews: 'सभी इंटरव्यू',
    bookOfWeek: 'इस हफ़्ते की किताब',
    everyWeek: 'हर हफ़्ते की सूची',
    latestReviews: 'नई समीक्षाएँ',
    somethingElse: 'कुछ और',
    readSummary: 'सारांश पढ़ें',
    readReview: 'समीक्षा पढ़ें',
    bookPage: 'किताब का पेज',
    similar: 'इससे मिलती-जुलती किताबें',
    allServices: 'सभी सेवाएँ',
    getStarted: 'शुरू करें',
    contactTeam: 'टीम से बात करें',
    showServices: 'सेवाएँ दिखाएँ',
    openJoin: '“Join Us” खोलें',
    about: 'Books Paradise के बारे में',
    whatCanYouDo: 'आप क्या कर सकते हैं?',
    gripping: 'कुछ रोमांचक',
    cosy: 'कुछ हल्का-फुल्का',
    loveStory: 'एक प्रेम कहानी',
    magical: 'कुछ जादुई',
    bestRated: 'सबसे बेहतरीन दिखाएँ',
    open: (label) => `${label} खोलें`,
    see: (label) => `${label} देखें`,
  },
  say: {
    greeting:
      'नमस्ते, मैं **BP** हूँ — Books Paradise पर आपका पढ़ने का साथी। 📖\n\nमैं आपकी अगली किताब ढूँढने में मदद कर सकता हूँ, नई समीक्षाएँ, सारांश और लेखक इंटरव्यू दिखा सकता हूँ, या बता सकता हूँ कि हम लेखकों की किताबों का प्रचार कैसे करते हैं।\n\nआज आपका क्या पढ़ने का मन है?',
    thanks: 'हमेशा हाज़िर हूँ। 🙂 और कुछ ढूँढ दूँ?',
    capabilities:
      'मैं इन कामों में मदद कर सकता हूँ:\n\n• **किताब ढूँढना** — शैली, मूड, लेखक या नाम से\n• **नई समीक्षाएँ, सारांश और इंटरव्यू**\n• **इस हफ़्ते की किताब** और पूरा संग्रह\n• **वेबसाइट पर रास्ता दिखाना** — बस बताइए क्या चाहिए\n• **लेखकों के लिए सेवाएँ** — समीक्षाएँ, ट्रेलर, सारांश वीडियो, इंटरव्यू, Goodreads और Amazon कैंपेन और भी बहुत कुछ',
    promoIntro: 'ज़रूर — लेखकों के लिए हम यह सब करते हैं:',
    promoOutro: 'बताइए किसमें दिलचस्पी है, या **Join Us** के ज़रिए अपनी किताब की जानकारी भेजिए — टीम पूरी योजना बना देगी।',
    serviceOutro: 'अपनी किताब के लिए यह चाहिए? **Join Us** से जानकारी भेजिए, आगे हम संभाल लेंगे।',
    freshest: 'सबसे नई किताबें:',
    topRated: 'अभी सबसे ज़्यादा रेटिंग वाली किताबें:',
    latestReviews: 'हमारी सबसे नई समीक्षाएँ:',
    reviewsIntro: 'ईमानदार और विस्तृत समीक्षाएँ — पाठक अभी यही पढ़ रहे हैं:',
    summariesIntro: 'वेबसाइट की हर किताब का पूरा सारांश मौजूद है। शुरुआत इनसे कीजिए:',
    interviewsIntro: 'लेखक इंटरव्यू — किताबों के पीछे के लोग, उन्हीं के शब्दों में:',
    latestInterviews: 'सबसे नए लेखक इंटरव्यू:',
    weekPicks: (range) => `**इस हफ़्ते की किताब** — ${range} का चयन:`,
    bookDetail: (b) =>
      `**${b.title}** — ${b.author}\n${b.genre} · ${b.pages} पेज · ★ ${b.rating}, ${b.reviewCount} पाठकों के अनुसार\n\n${b.about.slice(0, 220)}…`,
    reviewIntro: (b, score, quote) => `**${b.title}** की हमारी पूरी समीक्षा — हमने इसे ★ ${score} दिया।\n\n“${quote}…”`,
    summaryIntro: (b) => `**${b.title}**, लेखक ${b.author}\n\n${b.about}`,
    similar: (title, genre) => `अगर **${title}** पसंद आई, तो इनमें भी वही ${genre} वाला रंग है।`,
    author: (name, what, hasInterview) => `**${name}** — वेबसाइट पर ${what}${hasInterview ? ', साथ में एक इंटरव्यू भी' : ''}।`,
    genreLead: (genre) => `बढ़िया चुनाव — **${genre}** में हमारी सबसे अच्छी किताबें।`,
    moodLead: (line) => `तो आपको ${line} चाहिए।`,
    startHere: 'मैं यहाँ से शुरू करूँगा:',
    recommendAsk: 'ज़रूर। आज किस तरह की किताब पढ़ने का मन है?',
    navTo: (label) => `इधर आइए — **${label}**।`,
    navPlain: (label) => `आपको **${label}** चाहिए।`,
    fallback:
      'माफ़ कीजिए, मैं ठीक से समझ नहीं पाया। मैं किताबें, समीक्षाएँ, सारांश और लेखक इंटरव्यू ढूँढने में सबसे अच्छा हूँ — या बता सकता हूँ कि हम लेखकों की किताबों का प्रचार कैसे करते हैं।\n\nइनमें से कुछ आज़माएँ?',
    empty: 'मैं समझ नहीं पाया। किसी किताब, समीक्षा, या किताब के प्रचार के बारे में पूछिए।',
    cardKind: { book: 'किताब', review: 'समीक्षा', summary: 'सारांश', interview: 'इंटरव्यू' },
    metaReview: (score) => `पूरी समीक्षा · ★ ${score}`,
    metaSummary: (pages) => `सारांश · ${pages} पेज`,
  },
  moods: {
    cozy: 'कुछ हल्का और सुकून देने वाला',
    dark: 'कुछ गहरा और रहस्यमय माहौल वाला',
    thrilling: 'कुछ ऐसा जो छोड़ने का मन न करे',
    romantic: 'एक अच्छी प्रेम कहानी',
    emotional: 'कुछ ऐसा जो दिल छू ले',
    uplifting: 'कुछ उम्मीद जगाने वाला',
    escape: 'कहीं दूर ले जाने वाली कहानी',
    magical: 'थोड़ा जादू',
    thoughtful: 'कुछ शांत और बेहतरीन लिखा हुआ',
    historical: 'बीते दौर की कोई कहानी',
  },
  places: {
    books: 'चुनिंदा किताबें',
    'all-books': 'पूरा किताब संग्रह',
    reviews: 'समीक्षाएँ',
    trailers: 'बुक ट्रेलर',
    weeks: 'इस हफ़्ते की किताब',
    interviews: 'लेखक इंटरव्यू',
    community: 'कम्युनिटी',
    about: 'Books Paradise के बारे में',
    offer: 'हमारी सेवाएँ',
    newsletter: 'Join Us',
  },
  services: {
    reviews: {
      name: 'ईमानदार किताब समीक्षाएँ',
      blurb: 'सच्ची और गहराई से लिखी समीक्षाएँ, जो भरोसा बनाती हैं और पाठकों को अगली किताब चुनने में मदद करती हैं।',
      bullets: ['वेबसाइट पर पूरी लिखित समीक्षा', 'कहानी, किरदार, रफ़्तार और लेखन पर बात', 'हमारी पाठक कम्युनिटी के साथ साझा'],
    },
    trailers: {
      name: 'सिनेमैटिक बुक ट्रेलर',
      blurb: 'बेहतरीन गुणवत्ता वाले वीडियो, जो आपकी किताब की आत्मा दिखाते हैं और याद रह जाते हैं।',
      bullets: ['आपकी कहानी पर लिखा और एडिट किया गया', 'सोशल मीडिया और सेल पेज के लिए तैयार', 'पोस्ट करने लायक फ़ाइल तक'],
    },
    summaries: {
      name: 'सारांश वीडियो',
      blurb: 'छोटे और खूबसूरती से बने वीडियो, जो बताते हैं किताब किस बारे में है — बिना कहानी खोले।',
      bullets: ['बिना स्पॉइलर, कसा हुआ सारांश', 'आवाज़ और सबटाइटल के साथ', 'सोशल मीडिया पर पहचान बनाने के लिए बढ़िया'],
    },
    'video-reviews': {
      name: 'वीडियो समीक्षाएँ',
      blurb: 'कैमरे के सामने कोई आपकी किताब पर बात करता है — पाठक इसी फ़ॉर्मेट पर सबसे ज़्यादा भरोसा करते हैं।',
      bullets: ['बोलकर, अपनेपन के साथ और ईमानदार', 'हमारे चैनलों पर प्रकाशित', 'विज्ञापन में दोबारा इस्तेमाल लायक क्लिप'],
    },
    interviews: {
      name: 'लेखक इंटरव्यू',
      blurb: 'लेखक, उनके सफ़र और उनकी कहानियों को सामने लाते हैं — ताकि पाठक सिर्फ़ किताब से नहीं, आपसे जुड़ें।',
      bullets: ['वेबसाइट पर लिखित सवाल-जवाब', 'आपकी कहानी, तरीक़ा और आगे की योजना', 'आपकी किताब के पेज से जुड़ा हुआ'],
    },
    campaigns: {
      name: 'Goodreads और Amazon रिव्यू कैंपेन',
      blurb: 'व्यवस्थित पाठक कैंपेन, जो आपकी किताब को उन प्लेटफ़ॉर्म पर समीक्षकों तक पहुँचाते हैं जहाँ बिक्री तय होती है।',
      bullets: ['Goodreads और Amazon पर पाठकों तक पहुँच', 'आपकी लॉन्च तारीख़ के हिसाब से', 'समीक्षा हमेशा पाठक की अपनी ईमानदार राय रहती है'],
    },
    social: {
      name: 'सोशल मीडिया प्रचार',
      blurb: 'Instagram, Facebook, YouTube और वेबसाइट पर फ़ीचर, ताकि आपकी किताब ज़्यादा लोगों तक पहुँचे।',
      bullets: ['फ़ीचर पोस्ट और रील', 'वेबसाइट पर भी प्रकाशित', 'असली जुड़ाव बढ़ाने के लिए बनाया गया'],
    },
    website: {
      name: 'लेखक वेबसाइट',
      blurb: 'लेखक पर केंद्रित पेशेवर वेबसाइट, जो आपकी ऑनलाइन पहचान बनाती है और पाठकों से जोड़ती है।',
      bullets: ['आपकी किताबों के इर्द-गिर्द डिज़ाइन', 'मोबाइल पर तेज़ और आसान', 'आपकी अपनी, आगे बढ़ाने के लिए'],
    },
    blogs: {
      name: 'बुक ब्लॉग और लेख',
      blurb: 'ऐसे लेख जो जानकारी देते हैं, प्रेरित करते हैं और आपकी किताब व पहचान को ज़्यादा नज़र में लाते हैं।',
      bullets: ['आपके विषयों पर लिखे हुए', 'वेबसाइट पर प्रकाशित', 'सर्च के अनुकूल और साझा करने लायक'],
    },
  },
  faqs: {
    submit:
      'अपनी किताब की जानकारी भेजिए — नाम, शैली, छोटा परिचय और कहाँ उपलब्ध है — हम बता देंगे कौन-सी सेवाएँ सबसे सही रहेंगी।\n\nसबसे तेज़ तरीक़ा है होम पेज के नीचे वाला **Join Us** फ़ॉर्म।',
    pricing:
      'क़ीमतें वेबसाइट पर नहीं दी गई हैं — हर पैकेज किताब की ज़रूरत के हिसाब से बनता है, इसलिए यह अलग-अलग होता है।\n\n**Join Us** के ज़रिए अपनी किताब और पसंद की सेवाएँ बताइए, टीम सीधे आपसे संपर्क करेगी।',
    timeline:
      'समय सेवा और मौजूदा काम पर निर्भर करता है — लिखित समीक्षा सिनेमैटिक ट्रेलर से जल्दी तैयार होती है।\n\n**Join Us** से अपनी लॉन्च तारीख़ बताइए, टीम बता देगी क्या मुमकिन है।',
    honest:
      'यहाँ समीक्षाएँ ईमानदार होती हैं। प्रचार पैकेज समीक्षक का **समय और ध्यान** ख़रीदता है, कोई ख़ास रेटिंग नहीं — किताब के बारे में उनकी राय पूरी तरह उनकी अपनी रहती है।\n\nबात यही है: पाठक उन्हीं समीक्षाओं पर भरोसा करते हैं जो उन्हें सच्ची लगती हैं।',
    genres: (list) => `हम कई शैलियाँ कवर करते हैं — अभी संग्रह में ${list} शामिल हैं।\n\nअगर आपकी किताब इनसे अलग है, तब भी पूछिए; बात करने लायक है।`,
    indie:
      'बिलकुल। स्वतंत्र और पहली बार लिख रहे लेखक हमारे काम का बड़ा हिस्सा हैं, और पहली किताब को ही सबसे ज़्यादा पहचान की ज़रूरत होती है।\n\n**Join Us** से अपनी किताब के बारे में बताइए, हम शुरुआत का रास्ता सुझा देंगे।',
    formats:
      'फ़ॉर्मेट कोई रुकावट नहीं — ईबुक, पेपरबैक, हार्डकवर या ऑडियोबुक, सब पर समीक्षा, ट्रेलर और फ़ीचर हो सकते हैं।\n\nसंपर्क करते समय बता दीजिए कौन-कौन से फ़ॉर्मेट उपलब्ध हैं।',
    contact:
      'हम तक पहुँचने का सबसे तेज़ तरीक़ा है होम पेज के नीचे वाला **Join Us** फ़ॉर्म — वहाँ अपना ईमेल छोड़िए, टीम आगे संपर्क कर लेगी।\n\nपाठकों का भी स्वागत है: इसी से नई समीक्षाएँ, ट्रेलर और हर हफ़्ते का चयन आपके इनबॉक्स में आता है।',
    about:
      'Books Paradise पाठकों और लेखकों दोनों का ठिकाना है: ईमानदार समीक्षाएँ, सिनेमैटिक बुक ट्रेलर, लेखक इंटरव्यू और हर हफ़्ते का चयन — साथ ही ऐसी प्रचार सेवाएँ जो लेखकों को पाठकों तक पहुँचाती हैं।\n\nमैं **BP** हूँ, यहाँ का सहायक। मैं किताब ढूँढ सकता हूँ, किसी समीक्षा या इंटरव्यू तक ले जा सकता हूँ, या लेखकों की सेवाएँ समझा सकता हूँ।',
  },
}

export const PACKS = { en, es, de, hi }

// Per-key fallback to English, so a half-finished pack degrades instead of crashing.
export const pack = (code) => PACKS[code] || PACKS.en

/* ========================== matching vocabulary ==========================
   Keywords are matched against the ACTIVE language and English at once —
   people routinely type "reviews" or "thriller" while chatting in Spanish.
   ====================================================================== */

export const KW = {
  greet: {
    en: ['hi', 'hey', 'hello', 'yo', 'hiya', 'howdy', 'good morning', 'good afternoon', 'good evening'],
    es: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal'],
    de: ['hallo', 'hi', 'servus', 'moin', 'guten morgen', 'guten tag', 'guten abend'],
    hi: ['namaste', 'namaskar', 'hello', 'हैलो', 'नमस्ते', 'नमस्कार'],
  },
  thanks: {
    en: ['thank', 'thanks', 'thx', 'cheers', 'appreciate'],
    es: ['gracias', 'muchas gracias', 'genial'],
    de: ['danke', 'vielen dank', 'dankeschon'],
    hi: ['dhanyavad', 'shukriya', 'धन्यवाद', 'शुक्रिया'],
  },
  capabilities: {
    en: ['what can you do', 'how can you help', 'what do you do', 'help me', 'options'],
    es: ['que puedes hacer', 'en que me ayudas', 'como me ayudas', 'ayuda', 'opciones'],
    de: ['was kannst du', 'wie kannst du helfen', 'hilfe', 'was machst du'],
    hi: ['aap kya kar sakte', 'kya kar sakte ho', 'madad', 'आप क्या कर सकते', 'क्या कर सकते', 'मदद'],
  },
  promote: {
    en: ['promote', 'promotion', 'my book', 'i am an author', 'im an author', 'i wrote', 'my novel', 'market my', 'advertise', 'publicity', 'feature my', 'work with you', 'services', 'what do you offer', 'packages'],
    es: ['promocionar', 'promocion', 'mi libro', 'soy autor', 'soy autora', 'he escrito', 'mi novela', 'publicidad', 'servicios', 'que ofreceis', 'que ofrecen', 'paquetes'],
    de: ['bewerben', 'werbung', 'mein buch', 'ich bin autor', 'ich bin autorin', 'geschrieben', 'mein roman', 'leistungen', 'angebot', 'pakete', 'vermarkten'],
    hi: ['prachar', 'promote', 'meri kitab', 'main lekhak', 'sevaen', 'प्रचार', 'मेरी किताब', 'मैं लेखक', 'सेवाएँ', 'सेवाएं', 'पैकेज'],
  },
  latest: {
    en: ['latest', 'newest', 'new', 'recent', 'recently', 'just published'],
    es: ['ultimo', 'ultimos', 'ultima', 'ultimas', 'nuevo', 'nuevos', 'nueva', 'nuevas', 'reciente', 'recientes'],
    de: ['neueste', 'neuesten', 'neu', 'neue', 'aktuell', 'aktuelle', 'kurzlich'],
    hi: ['nayi', 'naya', 'naye', 'latest', 'नई', 'नया', 'नये', 'नवीनतम', 'हाल'],
  },
  best: {
    en: ['best', 'top', 'popular', 'highest rated', 'rated'],
    es: ['mejor', 'mejores', 'popular', 'populares', 'mejor valorado', 'mejor valorados'],
    de: ['beste', 'besten', 'top', 'beliebt', 'bestbewertet'],
    hi: ['sabse achhi', 'behtareen', 'top', 'सबसे अच्छी', 'बेहतरीन', 'लोकप्रिय'],
  },
  review: {
    en: ['review', 'reviews', 'reviewed'],
    es: ['resena', 'resenas', 'critica', 'criticas', 'opinion', 'opiniones'],
    de: ['rezension', 'rezensionen', 'kritik', 'besprechung', 'bewertung'],
    hi: ['samiksha', 'review', 'समीक्षा', 'समीक्षाएँ', 'समीक्षाएं'],
  },
  summary: {
    en: ['summary', 'summaries', 'summarise', 'summarize', 'plot', 'what is it about'],
    es: ['resumen', 'resumenes', 'de que va', 'de que trata', 'sinopsis', 'argumento'],
    de: ['zusammenfassung', 'zusammenfassungen', 'worum geht', 'inhalt', 'handlung'],
    hi: ['saransh', 'सारांश', 'kahani kya hai', 'किस बारे में', 'कहानी क्या'],
  },
  interview: {
    en: ['interview', 'interviews'],
    es: ['entrevista', 'entrevistas'],
    de: ['interview', 'interviews', 'gesprach'],
    hi: ['interview', 'साक्षात्कार', 'इंटरव्यू'],
  },
  week: {
    en: ['book of the week', 'weekly pick', 'this week', 'week'],
    es: ['libro de la semana', 'esta semana', 'semana', 'semanal'],
    de: ['buch der woche', 'diese woche', 'woche', 'wochentlich'],
    hi: ['hafte ki kitab', 'is hafte', 'हफ़्ते की किताब', 'इस हफ्ते', 'सप्ताह'],
  },
  recommend: {
    en: ['recommend', 'suggestion', 'suggest', 'next read', 'what to read', 'what should i read', 'pick for me', 'surprise me', 'anything good'],
    es: ['recomienda', 'recomiendame', 'recomendacion', 'que leo', 'que leer', 'sugerencia', 'sugiere', 'sorprendeme'],
    de: ['empfehl', 'empfehlung', 'was soll ich lesen', 'vorschlag', 'uberrasch mich'],
    hi: ['sujhav', 'recommend', 'kya padhu', 'सुझाव', 'क्या पढ़ूँ', 'क्या पढ़ें', 'बताइए कौन सी'],
  },
  navVerb: {
    en: ['where', 'find', 'take me', 'go to', 'show me', 'navigate', 'open', 'section', 'page'],
    es: ['donde', 'dónde', 'encontrar', 'llevame', 'ir a', 'ensename', 'muestrame', 'abrir', 'seccion', 'pagina'],
    de: ['wo', 'finde', 'bring mich', 'geh zu', 'zeig mir', 'offne', 'bereich', 'seite'],
    hi: ['kahan', 'dhundo', 'le chalo', 'dikhao', 'kholo', 'कहाँ', 'दिखाओ', 'दिखाइए', 'खोलो', 'सेक्शन', 'पेज'],
  },
  capability: {
    // "do you make trailers?" — a question about what the business offers
    en: ['do you do', 'do you offer', 'do you make', 'do you have', 'can you make', 'can you do', 'tell me about your', 'what is your'],
    es: ['haceis', 'hacen', 'ofreceis', 'ofrecen', 'teneis', 'tienen', 'podeis hacer', 'pueden hacer', 'hablame de vuestro'],
    de: ['macht ihr', 'bietet ihr', 'habt ihr', 'konnt ihr', 'erzahl mir von eurem'],
    hi: ['kya aap banate', 'kya aap karte', 'क्या आप बनाते', 'क्या आप करते', 'क्या आपके पास'],
  },
  browseVerb: {
    // vetoes the capability reading above: "can you show me reviews?"
    en: ['show me', 'have any', 'recommend', 'suggest', 'got any'],
    es: ['muestrame', 'ensename', 'recomienda', 'sugiere'],
    de: ['zeig mir', 'empfiehl', 'schlag vor'],
    hi: ['dikhao', 'दिखाओ', 'दिखाइए', 'सुझाओ'],
  },
}

/* Service match phrases. English always applies; the rest add per language. */
export const SERVICE_KW = {
  reviews: {
    en: ['book review', 'honest review', 'review service', 'reviews'],
    es: ['resena de libro', 'resenas honestas', 'servicio de resenas'],
    de: ['buchrezension', 'ehrliche rezension', 'rezensionsservice'],
    hi: ['kitab samiksha', 'किताब समीक्षा', 'ईमानदार समीक्षा'],
  },
  trailers: {
    en: ['trailer', 'trailers', 'cinematic'],
    es: ['trailer', 'trailers', 'cinematografico'],
    de: ['trailer', 'buchtrailer', 'cineastisch'],
    hi: ['trailer', 'ट्रेलर', 'बुक ट्रेलर'],
  },
  summaries: {
    en: ['summary video', 'summary videos'],
    es: ['video de resumen', 'videos de resumen'],
    de: ['zusammenfassungsvideo', 'zusammenfassungsvideos'],
    hi: ['saransh video', 'सारांश वीडियो'],
  },
  'video-reviews': {
    en: ['video review', 'video reviews', 'youtube review'],
    es: ['resena en video', 'resenas en video'],
    de: ['video rezension', 'videorezension', 'video-rezension'],
    hi: ['video samiksha', 'वीडियो समीक्षा'],
  },
  interviews: {
    en: ['author interview', 'author feature', 'interview service'],
    es: ['entrevista de autor', 'entrevistas de autor'],
    de: ['autoreninterview', 'autorinterview'],
    hi: ['lekhak interview', 'लेखक इंटरव्यू'],
  },
  campaigns: {
    en: ['goodreads', 'amazon', 'review campaign', 'campaign', 'campaigns'],
    es: ['goodreads', 'amazon', 'campana de resenas', 'campana'],
    de: ['goodreads', 'amazon', 'rezensionskampagne', 'kampagne'],
    hi: ['goodreads', 'amazon', 'कैंपेन', 'campaign'],
  },
  social: {
    en: ['social media', 'instagram', 'facebook', 'youtube', 'reels', 'social'],
    es: ['redes sociales', 'instagram', 'facebook', 'youtube', 'reels'],
    de: ['social media', 'instagram', 'facebook', 'youtube', 'soziale medien'],
    hi: ['social media', 'instagram', 'facebook', 'youtube', 'सोशल मीडिया'],
  },
  website: {
    en: ['author website', 'website', 'landing page'],
    es: ['web de autor', 'pagina web', 'sitio web'],
    de: ['autorenwebsite', 'website', 'webseite', 'internetseite'],
    hi: ['website', 'वेबसाइट', 'लेखक वेबसाइट'],
  },
  blogs: {
    en: ['book blog', 'blog', 'blogs', 'article', 'articles', 'guest post'],
    es: ['blog', 'blogs', 'articulo', 'articulos'],
    de: ['blog', 'blogs', 'artikel', 'gastbeitrag'],
    hi: ['blog', 'ब्लॉग', 'लेख', 'article'],
  },
}

/* Phrases that only ever name a service, whatever the language. */
export const AUTHOR_ONLY = [
  'video review', 'summary video', 'goodreads', 'amazon', 'review campaign', 'author website', 'guest post', 'book blog',
  'resena en video', 'video de resumen', 'campana de resenas', 'web de autor',
  'videorezension', 'video rezension', 'zusammenfassungsvideo', 'rezensionskampagne', 'autorenwebsite',
  'वीडियो समीक्षा', 'सारांश वीडियो', 'लेखक वेबसाइट',
]

/* FAQ trigger phrases, per language. */
export const FAQ_KW = {
  contact: {
    en: ['contact', 'get in touch', 'reach you', 'reach out', 'talk to someone', 'speak to', 'email you', 'your email', 'customer support'],
    es: ['contacto', 'contactar', 'como os contacto', 'como contactar', 'escribiros', 'vuestro correo', 'su correo', 'atencion al cliente'],
    de: ['kontakt', 'kontaktieren', 'erreiche ich euch', 'wie erreiche', 'eure email', 'eure e-mail', 'kundenservice'],
    hi: ['sampark', 'contact', 'संपर्क', 'कैसे संपर्क', 'ईमेल'],
  },
  submit: {
    en: ['how do i submit', 'submit my book', 'send my book', 'how to submit', 'submission'],
    es: ['como envio', 'enviar mi libro', 'mandar mi libro', 'como mando'],
    de: ['wie reiche ich', 'buch einreichen', 'buch schicken', 'einsenden'],
    hi: ['kaise bhejun', 'kitab bhejna', 'कैसे भेजूँ', 'किताब भेजना', 'कैसे जमा'],
  },
  pricing: {
    en: ['how much', 'price', 'pricing', 'cost', 'rates', 'fee', 'charges', 'budget', 'quote'],
    es: ['cuanto cuesta', 'precio', 'precios', 'coste', 'tarifa', 'tarifas', 'presupuesto'],
    de: ['was kostet', 'wie viel kostet', 'preis', 'preise', 'kosten', 'gebuhr', 'honorar'],
    hi: ['kitna kharch', 'kimat', 'price', 'कीमत', 'क़ीमत', 'कितना खर्च', 'शुल्क', 'फीस'],
  },
  timeline: {
    en: ['how long', 'turnaround', 'how many days', 'when will', 'timeline', 'how fast'],
    es: ['cuanto tarda', 'cuanto tiempo', 'cuantos dias', 'plazo', 'plazos'],
    de: ['wie lange', 'wie viele tage', 'dauer', 'wann ist'],
    hi: ['kitna samay', 'kitne din', 'कितना समय', 'कितने दिन', 'कब तक'],
  },
  honest: {
    en: ['reviews honest', 'really honest', 'unbiased', 'biased', 'paid review', 'buy a review', 'positive review', 'guarantee', 'fake review', 'is it honest'],
    es: ['resenas honestas', 'resena pagada', 'comprar una resena', 'resena positiva', 'garantia', 'imparcial'],
    de: ['rezensionen ehrlich', 'gekaufte rezension', 'bezahlte rezension', 'positive rezension', 'garantie', 'unparteiisch'],
    hi: ['samiksha imandar', 'ईमानदार समीक्षा', 'पेड रिव्यू', 'गारंटी'],
  },
  genres: {
    en: ['what genres', 'which genres', 'do you accept', 'any genre', 'genres do you'],
    es: ['que generos', 'cuales generos', 'aceptais', 'aceptan'],
    de: ['welche genres', 'welche gattungen', 'nehmt ihr', 'akzeptiert ihr'],
    hi: ['kaun si shailiyan', 'कौन सी शैलियाँ', 'कौन सी विधा', 'क्या आप लेते'],
  },
  indie: {
    en: ['self published', 'self-published', 'indie author', 'debut', 'first book', 'new author'],
    es: ['autopublicado', 'autor independiente', 'autora independiente', 'primer libro', 'debut'],
    de: ['selfpublisher', 'selbstverlag', 'indie autor', 'erstes buch', 'debut'],
    hi: ['self published', 'pehli kitab', 'पहली किताब', 'स्वतंत्र लेखक'],
  },
  formats: {
    en: ['ebook', 'e-book', 'audiobook', 'paperback', 'hardcover', 'print', 'kindle'],
    es: ['ebook', 'audiolibro', 'tapa blanda', 'tapa dura', 'impreso', 'kindle'],
    de: ['ebook', 'e-book', 'horbuch', 'taschenbuch', 'hardcover', 'gedruckt', 'kindle'],
    hi: ['ebook', 'audiobook', 'paperback', 'ऑडियोबुक', 'पेपरबैक', 'हार्डकवर'],
  },
  about: {
    en: ['who are you', 'what is books paradise', 'about books paradise', 'about the site', 'what is bp', 'what is this site'],
    es: ['quien eres', 'que es books paradise', 'sobre books paradise', 'sobre la web', 'quienes sois'],
    de: ['wer bist du', 'was ist books paradise', 'uber books paradise', 'uber die seite'],
    hi: ['aap kaun', 'books paradise kya hai', 'आप कौन', 'यह वेबसाइट क्या', 'के बारे में'],
  },
}

/* Mood vocabulary. */
export const MOOD_KW = {
  cozy: {
    en: ['cozy', 'cosy', 'comfort', 'comforting', 'gentle', 'warm', 'wholesome', 'light', 'feel good', 'soothing', 'calm'],
    es: ['acogedor', 'acogedora', 'reconfortante', 'tranquilo', 'tranquila', 'ligero', 'suave'],
    de: ['gemutlich', 'wohlfuhl', 'sanft', 'leicht', 'warm', 'beruhigend'],
    hi: ['halka', 'sukoon', 'हल्की', 'हल्का', 'सुकून', 'आरामदायक'],
  },
  dark: {
    en: ['dark', 'creepy', 'haunting', 'haunted', 'gothic', 'eerie', 'spooky', 'chilling', 'scary', 'atmospheric', 'unsettling'],
    es: ['oscuro', 'oscura', 'inquietante', 'gotico', 'gotica', 'terror', 'siniestro'],
    de: ['dunkel', 'duster', 'gruselig', 'gothic', 'unheimlich', 'beklemmend'],
    hi: ['dark', 'darawni', 'गहरा', 'डरावनी', 'रहस्यमय'],
  },
  thrilling: {
    en: ['thrill', 'thriller', 'thrilling', 'gripping', 'edge of my seat', 'page turner', 'fast paced', 'fast', 'tense', 'suspense', 'twist', 'twists'],
    es: ['trepidante', 'emocionante', 'suspense', 'intriga', 'rapido', 'giro', 'giros'],
    de: ['spannend', 'thriller', 'fesselnd', 'nervenkitzel', 'schnell', 'wendung'],
    hi: ['romanchak', 'thriller', 'रोमांचक', 'तेज़', 'सस्पेंस'],
  },
  romantic: {
    en: ['romance', 'romantic', 'love story', 'love', 'swoon', 'heartfelt'],
    es: ['romance', 'romantico', 'romantica', 'historia de amor', 'amor'],
    de: ['romantik', 'romantisch', 'liebesgeschichte', 'liebe'],
    hi: ['prem', 'romance', 'प्रेम', 'प्यार', 'रोमांस'],
  },
  emotional: {
    en: ['sad', 'cry', 'emotional', 'moving', 'heartbreak', 'heartbreaking', 'tearjerker', 'grief', 'melancholy', 'bittersweet'],
    es: ['triste', 'llorar', 'emotivo', 'emotiva', 'conmovedor', 'desgarrador'],
    de: ['traurig', 'weinen', 'emotional', 'bewegend', 'herzzerreissend'],
    hi: ['dukhi', 'bhavuk', 'दुखद', 'भावुक', 'रुला'],
  },
  uplifting: {
    en: ['uplifting', 'hopeful', 'happy', 'joy', 'joyful', 'positive', 'inspiring', 'hope'],
    es: ['esperanzador', 'alegre', 'feliz', 'positivo', 'inspirador'],
    de: ['hoffnungsvoll', 'frohlich', 'positiv', 'inspirierend', 'aufbauend'],
    hi: ['umeed', 'khushi', 'उम्मीद', 'खुशी', 'प्रेरणादायक'],
  },
  escape: {
    en: ['escape', 'escapist', 'adventure', 'journey', 'travel', 'epic', 'quest', 'voyage', 'survival'],
    es: ['evasion', 'aventura', 'viaje', 'epico', 'epica', 'supervivencia'],
    de: ['abenteuer', 'reise', 'episch', 'uberleben', 'flucht'],
    hi: ['sahsik', 'safar', 'साहसिक', 'सफ़र', 'यात्रा'],
  },
  magical: {
    en: ['magic', 'magical', 'fantasy', 'whimsical', 'dream', 'dreamy', 'mythic', 'myth', 'wonder', 'imaginative'],
    es: ['magia', 'magico', 'magica', 'fantasia', 'mito', 'sueno'],
    de: ['magie', 'magisch', 'fantasy', 'marchenhaft', 'traum', 'mythisch'],
    hi: ['jaadu', 'जादू', 'जादुई', 'फैंटेसी', 'कल्पना'],
  },
  thoughtful: {
    en: ['thoughtful', 'literary', 'slow', 'quiet', 'character driven', 'reflective', 'deep', 'beautiful writing', 'prose'],
    es: ['reflexivo', 'literario', 'pausado', 'profundo', 'bien escrito'],
    de: ['nachdenklich', 'literarisch', 'ruhig', 'tiefgrundig', 'schon geschrieben'],
    hi: ['gambhir', 'shant', 'गंभीर', 'शांत', 'साहित्यिक'],
  },
  historical: {
    en: ['historical', 'history', 'period', 'war', 'wartime', 'past', 'vintage'],
    es: ['historico', 'historica', 'historia', 'epoca', 'guerra', 'pasado'],
    de: ['historisch', 'geschichte', 'epoche', 'krieg', 'vergangenheit'],
    hi: ['aitihasik', 'ऐतिहासिक', 'इतिहास', 'युद्ध', 'बीते'],
  },
}

/* Non-English words for a genre, mapped onto the English genre in books.js. */
export const GENRE_ALIASES = {
  Thriller: ['thriller', 'suspenso', 'trepidante', 'थ्रिलर'],
  Mystery: ['misterio', 'krimi', 'rätsel', 'ratsel', 'रहस्य', 'मिस्ट्री'],
  Suspense: ['suspense', 'suspenso', 'spannung', 'सस्पेंस'],
  Adventure: ['aventura', 'abenteuer', 'साहसिक', 'एडवेंचर'],
  Fantasy: ['fantasia', 'fantasy', 'फैंटेसी', 'कल्पना'],
  Epic: ['epico', 'epica', 'episch', 'महाकाव्य'],
  Drama: ['drama', 'ड्रामा'],
  Romance: ['romance', 'romantico', 'romantik', 'रोमांस', 'प्रेम'],
  Historical: ['historico', 'historica', 'historisch', 'ऐतिहासिक'],
  Gothic: ['gotico', 'gotica', 'gothic', 'गॉथिक'],
  Magic: ['magia', 'magie', 'जादू'],
  Literary: ['literario', 'literarisch', 'साहित्यिक'],
  Contemporary: ['contemporaneo', 'zeitgenossisch', 'समकालीन'],
  Cozy: ['acogedor', 'gemutlich', 'हल्की'],
  Mythic: ['mitico', 'mythisch', 'पौराणिक'],
  Survival: ['supervivencia', 'uberleben', 'उत्तरजीविता'],
  Wartime: ['guerra', 'krieg', 'युद्ध'],
}
