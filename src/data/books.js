/* ============================================================================
   BOOK DATA — single source of truth for every book on the site.

   TO EDIT A BOOK: find it below and change the values. Nothing else to touch —
   the collection page (/books) and each detail page (/books/<slug>) both read
   from here.

   TO ADD A BOOK: copy any entry, give it a NEW unique `slug`, and it appears
   automatically. Anything you leave out falls back to DEFAULTS below.

   NOTE: these are fictional titles, so all details (blurbs, ratings, page
   counts, dates) are authored placeholder copy meant to be replaced.
   ========================================================================== */

// Shared bits every book inherits unless it overrides them.
const DEFAULTS = {
  language: 'English',
  verified: true,
  aboutImage: '/assets/model/model-mission.png',
  // Retailers shown in the "Book Availability" card. Set `url` when you have
  // a real product link; '#' just renders a non-navigating button.
  retailers: [
    { name: 'Amazon', mark: 'a', tone: '#ff9900', url: '#', cta: 'View on Amazon' },
    { name: 'Barnes & Noble', mark: 'BN', tone: '#1a7a4c', url: '#', cta: 'View on B&N' },
    { name: 'Book Depository', mark: '📘', tone: '#3aa6e0', url: '#', cta: 'View on Book Depository' },
    { name: 'Apple Books', mark: '📖', tone: '#e8622c', url: '#', cta: 'View on Apple Books' },
    { name: 'Google Play Books', mark: '▶', tone: '#3b7ddd', url: '#', cta: 'View on Google Play' },
  ],
}

// The pull-quote banner at the foot of every book page.
export const PAGE_QUOTE = {
  text: 'A book is a dream that you hold in your hand.',
  author: 'Neil Gaiman',
}

const RAW_BOOKS = [
  {
    slug: 'the-silent-page',
    cover: 'book-1',
    title: 'The Silent Page',
    author: 'Lucas Elliot',
    genres: ['Thriller', 'Mystery', 'Suspense'],
    genre: 'Thriller',
    rating: 4.6,
    reviewCount: 128,
    pages: 352,
    published: 'Jan 12, 2023',
    pull: ['Some stories are written in ink.', 'Others in silence.'],
    about:
      'When a reclusive author dies under mysterious circumstances, journalist Adam Reed discovers a series of unpublished manuscripts that were never meant to be read. As he delves deeper, the lines between fiction and reality blur, pulling him into a world of secrets, lies, and a truth that could cost him everything.',
    summaryLines: ['A mysterious death.', 'A hidden manuscript.', 'A journalist chasing the truth.'],
    summaryBody:
      'In a world where words can be more dangerous than weapons, The Silent Page is a haunting thriller that will keep you on the edge of your seat till the last page.',
    special: [
      { icon: 'spark', title: 'Gripping Story', text: 'A page-turner that keeps you hooked until the very end.' },
      { icon: 'twist', title: 'Unpredictable Twists', text: 'Every chapter brings a new twist you won’t see coming.' },
      { icon: 'people', title: 'Deep Characters', text: 'Real, flawed, and unforgettable characters.' },
      { icon: 'quill', title: 'Atmospheric Writing', text: 'Hauntingly beautiful prose that stays with you.' },
    ],
    review: {
      text: 'The Silent Page grips you from the very first chapter and never lets go. Lucas Elliot crafts a chilling atmosphere filled with secrets, twists, and a final reveal that will leave you speechless.',
      overall: 4.5,
      loved: ['Gripping storyline', 'Unpredictable twists', 'Strong characters'],
      better: ['Slow start in the beginning', 'Some chapters feel long'],
    },
  },
  {
    slug: 'beyond-the-horizon',
    cover: 'book-2',
    title: 'The Beyond The Horizon',
    author: 'Nora Elston',
    genres: ['Adventure', 'Fantasy', 'Epic'],
    genre: 'Adventure',
    rating: 4.8,
    reviewCount: 214,
    pages: 418,
    published: 'Mar 04, 2023',
    pull: ['Every map ends somewhere.', 'Every story begins there.'],
    about:
      'Cartographer Mira Vale is handed a map of a coastline that no ship has ever charted. Chasing it past the edge of the known world, she finds a horizon that moves when she looks away, and a crew who each carry a reason for never turning back. A sweeping tale about the pull of the unknown and the cost of following it.',
    summaryLines: ['An impossible map.', 'A coastline that moves.', 'A crew with everything to lose.'],
    summaryBody:
      'Beyond The Horizon is an expansive, warm-hearted adventure about curiosity, courage, and the strange comfort of not knowing what comes next.',
    special: [
      { icon: 'spark', title: 'Vivid World', text: 'A world so richly drawn you can smell the sea air.' },
      { icon: 'twist', title: 'Constant Wonder', text: 'Every island brings a discovery you didn’t expect.' },
      { icon: 'people', title: 'A Crew You Love', text: 'Found-family bonds that feel genuinely earned.' },
      { icon: 'quill', title: 'Lyrical Prose', text: 'Writing that reads like light on open water.' },
    ],
    review: {
      text: 'Nora Elston writes horizons the way other authors write characters — alive, restless, and impossible to ignore. This is the rare adventure that earns its scale through heart rather than spectacle.',
      overall: 4.7,
      loved: ['Breathtaking world-building', 'Memorable crew', 'Beautiful ending'],
      better: ['Large cast takes time', 'Middle act meanders'],
    },
  },
  {
    slug: 'the-lost-letters',
    cover: 'book-3',
    title: 'The Lost Letters',
    author: 'Madilyn Hart',
    genres: ['Drama', 'Romance', 'Historical'],
    genre: 'Drama',
    rating: 4.5,
    reviewCount: 96,
    pages: 296,
    published: 'Sep 21, 2022',
    pull: ['Some words wait decades', 'to find the right reader.'],
    about:
      'A bundle of undelivered letters surfaces behind the wall of a shuttered post office, each addressed to the same woman and never signed. As archivist Elena Reyes traces their author across sixty years, she uncovers a quiet love story that history was never meant to keep — and begins rewriting the ending of her own.',
    summaryLines: ['Letters never delivered.', 'A sender with no name.', 'Sixty years of silence.'],
    summaryBody:
      'The Lost Letters is a tender, patient novel about the things we almost say, and what it costs to finally say them.',
    special: [
      { icon: 'spark', title: 'Quiet Power', text: 'A story that moves gently and hits hard.' },
      { icon: 'twist', title: 'Dual Timelines', text: 'Past and present braid together beautifully.' },
      { icon: 'people', title: 'Aching Romance', text: 'Longing written with real restraint.' },
      { icon: 'quill', title: 'Period Detail', text: 'A richly researched, lived-in setting.' },
    ],
    review: {
      text: 'Madilyn Hart understands that the most devastating love stories are the ones held just out of reach. The Lost Letters is unhurried, precise, and quietly heartbreaking.',
      overall: 4.4,
      loved: ['Gorgeous dual timeline', 'Emotional payoff', 'Elegant prose'],
      better: ['Deliberately slow pace', 'Sparse plot momentum'],
    },
  },
  {
    slug: 'whispers-of-the-past',
    cover: 'book-4',
    title: 'The Whispers of the Past',
    author: 'Clara Bennett',
    genres: ['Historical', 'Mystery', 'Gothic'],
    genre: 'Historical',
    rating: 4.4,
    reviewCount: 152,
    pages: 384,
    published: 'Oct 30, 2022',
    pull: ['The house remembered', 'what everyone agreed to forget.'],
    about:
      'Restoring a crumbling manor for its new owners, conservator Ada Wren keeps finding a name scratched beneath the wallpaper — a girl no record admits existed. As the house gives up its layers, so does the village that buried her, and Ada learns that some restorations are really excavations.',
    summaryLines: ['A name beneath the wallpaper.', 'A girl no record admits.', 'A village that agreed to forget.'],
    summaryBody:
      'The Whispers of the Past is an atmospheric gothic mystery about inherited silence, and what surfaces when a house is finally allowed to speak.',
    special: [
      { icon: 'spark', title: 'Rich Atmosphere', text: 'Dread that builds in the walls, room by room.' },
      { icon: 'twist', title: 'Layered Mystery', text: 'Each discovery reframes the one before it.' },
      { icon: 'people', title: 'A Haunting Lead', text: 'Ada is stubborn, exacting, and easy to root for.' },
      { icon: 'quill', title: 'Gothic Texture', text: 'Damp plaster, cold rooms, immaculate detail.' },
    ],
    review: {
      text: 'Clara Bennett builds dread the way her heroine strips wallpaper — one careful layer at a time. It is patient, immersive, and genuinely unsettling by the final act.',
      overall: 4.3,
      loved: ['Superb atmosphere', 'Clever structure', 'Satisfying reveal'],
      better: ['Slow-burn tension', 'Dense period detail'],
    },
  },
  {
    slug: 'the-light-between-worlds',
    cover: 'book-5',
    title: 'The Light Between Worlds',
    author: 'Anna Shah',
    genres: ['Fantasy', 'Adventure', 'Magic'],
    genre: 'Fantasy',
    rating: 4.7,
    reviewCount: 189,
    pages: 402,
    published: 'Feb 14, 2023',
    pull: ['Two worlds, one doorway,', 'and a light that refuses to close it.'],
    about:
      'Every winter solstice a thin seam of light opens between two worlds, and for one hour anything may cross. When Ira crosses to find her missing brother, the seam closes early — leaving her a stranger in a place where her memories are currency and daylight is rationed.',
    summaryLines: ['A seam of light.', 'One hour to cross.', 'A world that trades in memory.'],
    summaryBody:
      'The Light Between Worlds is an inventive portal fantasy about what we surrender to get home, and whether home survives the trade.',
    special: [
      { icon: 'spark', title: 'Original Magic', text: 'A memory-as-currency system with real stakes.' },
      { icon: 'twist', title: 'Relentless Pace', text: 'The clock never stops ticking once she crosses.' },
      { icon: 'people', title: 'Fierce Heroine', text: 'Ira is sharp, flawed, and impossible to forget.' },
      { icon: 'quill', title: 'Luminous Imagery', text: 'Light and dark rendered with real beauty.' },
    ],
    review: {
      text: 'Anna Shah has built one of the most inventive magic systems we have read this year, then had the nerve to make it hurt. Luminous, propulsive, and surprisingly moving.',
      overall: 4.6,
      loved: ['Inventive magic system', 'Relentless pacing', 'Emotional core'],
      better: ['Dense opening chapters', 'Ending leaves threads open'],
    },
  },
  {
    slug: 'golden-hour-pages',
    cover: 'book-2',
    title: 'Golden Hour Pages',
    author: 'Ira Coleman',
    genres: ['Literary', 'Contemporary'],
    genre: 'Literary',
    rating: 4.3,
    reviewCount: 74,
    pages: 268,
    published: 'Jun 08, 2023',
    pull: ['An hour of light,', 'and everything it forgives.'],
    about:
      'Told across a single summer of golden hours, this quiet novel follows three neighbours whose lives overlap only at dusk. A study of proximity, loneliness, and the small mercies strangers hand each other without noticing.',
    summaryLines: ['One summer.', 'Three neighbours.', 'The hour before dark.'],
    summaryBody:
      'Golden Hour Pages is a warm, observational novel about the people we almost know, and the light that makes us generous.',
    special: [
      { icon: 'spark', title: 'Gentle Warmth', text: 'A book that leaves you kinder than it found you.' },
      { icon: 'twist', title: 'Braided Lives', text: 'Three stories that meet in unexpected places.' },
      { icon: 'people', title: 'Ordinary People', text: 'Characters drawn with unusual tenderness.' },
      { icon: 'quill', title: 'Precise Prose', text: 'Not a sentence wasted, not a note forced.' },
    ],
    review: {
      text: 'Ira Coleman writes small moments with the weight of large ones. There is no spectacle here, just extraordinary attention — and it is more than enough.',
      overall: 4.2,
      loved: ['Beautiful observation', 'Warm tone', 'Elegant structure'],
      better: ['Very little plot', 'Understated ending'],
    },
  },
  {
    slug: 'a-door-left-open',
    cover: 'book-4',
    title: 'A Door Left Open',
    author: 'Maya Rhodes',
    genres: ['Suspense', 'Thriller'],
    genre: 'Suspense',
    rating: 4.5,
    reviewCount: 133,
    pages: 340,
    published: 'Apr 18, 2023',
    pull: ['She locked it every night.', 'This morning it was open.'],
    about:
      'A woman returns from a weekend away to find her front door open and nothing taken. No forced entry, no witnesses, nothing disturbed — except the growing certainty that someone has been living in her house while she sleeps.',
    summaryLines: ['An open door.', 'Nothing stolen.', 'Someone still inside.'],
    summaryBody:
      'A Door Left Open is a claustrophobic domestic thriller that turns the safest room in the world into the least safe.',
    special: [
      { icon: 'spark', title: 'Instant Hook', text: 'A premise that grabs you on page one.' },
      { icon: 'twist', title: 'Creeping Dread', text: 'Tension that tightens a notch every chapter.' },
      { icon: 'people', title: 'Unreliable Narrator', text: 'You will second-guess her, then yourself.' },
      { icon: 'quill', title: 'Lean Writing', text: 'Short, sharp chapters built for one sitting.' },
    ],
    review: {
      text: 'Maya Rhodes weaponises the ordinary — a hallway, a latch, a sound at 3am. Read it in daylight, and maybe check the door first.',
      overall: 4.4,
      loved: ['Brilliant premise', 'Unbearable tension', 'Fast chapters'],
      better: ['Ending divides readers', 'Thin side characters'],
    },
  },
  {
    slug: 'the-last-bookmark',
    cover: 'book-1',
    title: 'The Last Bookmark',
    author: 'Noah Venn',
    genres: ['Mystery', 'Cozy'],
    genre: 'Mystery',
    rating: 4.2,
    reviewCount: 88,
    pages: 312,
    published: 'Nov 02, 2022',
    pull: ['Every borrowed book', 'came back with a message.'],
    about:
      'A retiring librarian notices that returned books keep coming back with handwritten bookmarks tucked inside — each quoting a line from a crime that has not happened yet. A charming, bookish mystery for anyone who reads with a pencil in hand.',
    summaryLines: ['Handwritten bookmarks.', 'Quotes from crimes.', 'None of them committed yet.'],
    summaryBody:
      'The Last Bookmark is a cosy, clever mystery that turns a small-town library into the most interesting place in the world.',
    special: [
      { icon: 'spark', title: 'Bookish Charm', text: 'A love letter to libraries and their regulars.' },
      { icon: 'twist', title: 'Fair-Play Clues', text: 'Everything you need is on the page.' },
      { icon: 'people', title: 'Delightful Cast', text: 'A town full of people worth revisiting.' },
      { icon: 'quill', title: 'Light Touch', text: 'Warm and witty without losing the puzzle.' },
    ],
    review: {
      text: 'Noah Venn has written the rare cosy mystery that respects its reader — the clues are all there, hidden in plain sight, and the solution is genuinely satisfying.',
      overall: 4.1,
      loved: ['Clever clueing', 'Charming setting', 'Great cast'],
      better: ['Low stakes throughout', 'Gentle pacing'],
    },
  },
  {
    slug: 'midnight-atlas',
    cover: 'book-5',
    title: 'Midnight Atlas',
    author: 'Elena Noor',
    genres: ['Fantasy', 'Mythic'],
    genre: 'Fantasy',
    rating: 4.6,
    reviewCount: 167,
    pages: 436,
    published: 'Jul 25, 2023',
    pull: ['The atlas only works', 'after everyone is asleep.'],
    about:
      'An atlas that redraws itself at midnight leads a sleepless apprentice to cities that exist for one night only. Each has a rule, and each rule has a price — and the atlas is running out of pages.',
    summaryLines: ['A map that redraws itself.', 'Cities that last one night.', 'An atlas running out of pages.'],
    summaryBody:
      'Midnight Atlas is a dreamlike, myth-soaked fantasy about wandering, insomnia, and the geography of the things we avoid.',
    special: [
      { icon: 'spark', title: 'Dreamlike Tone', text: 'Reads like a beautiful, coherent dream.' },
      { icon: 'twist', title: 'A New City Each Night', text: 'Endlessly inventive set pieces.' },
      { icon: 'people', title: 'Quiet Protagonist', text: 'An observer you come to care about deeply.' },
      { icon: 'quill', title: 'Mythic Voice', text: 'Prose with the cadence of old folktales.' },
    ],
    review: {
      text: 'Elena Noor writes like a cartographer of the subconscious. Midnight Atlas is strange, gorgeous, and lingers far longer than its page count suggests.',
      overall: 4.5,
      loved: ['Stunning imagination', 'Mythic prose', 'Haunting imagery'],
      better: ['Loose central plot', 'Dreamlike logic won’t suit all'],
    },
  },
  {
    slug: 'letters-from-elsewhere',
    cover: 'book-3',
    title: 'Letters From Elsewhere',
    author: 'June Parker',
    genres: ['Romance', 'Contemporary'],
    genre: 'Romance',
    rating: 4.4,
    reviewCount: 121,
    pages: 288,
    published: 'May 12, 2023',
    pull: ['They agreed to write', 'until one of them stopped.'],
    about:
      'Two strangers on opposite ends of a mistaken correspondence agree to keep writing anyway. Over two years of letters they fall in love with a version of each other neither has met — and then one of them books a ticket.',
    summaryLines: ['A wrong address.', 'Two years of letters.', 'One ticket booked.'],
    summaryBody:
      'Letters From Elsewhere is a swooning epistolary romance about the person you become on paper, and whether they survive the arrivals hall.',
    special: [
      { icon: 'spark', title: 'Instant Chemistry', text: 'Their letters crackle from the very first page.' },
      { icon: 'twist', title: 'Epistolary Form', text: 'Told almost entirely in letters, beautifully.' },
      { icon: 'people', title: 'Two Real People', text: 'Both voices are distinct and fully alive.' },
      { icon: 'quill', title: 'Genuinely Funny', text: 'Sharp, warm humour throughout.' },
    ],
    review: {
      text: 'June Parker nails the particular intimacy of writing to someone you have never met. Funny, generous, and completely disarming by the final letter.',
      overall: 4.3,
      loved: ['Wonderful letters', 'Real humour', 'Earned ending'],
      better: ['Slim outside the letters', 'Predictable final act'],
    },
  },
  {
    slug: 'horizon-keepers',
    cover: 'book-2',
    title: 'Horizon Keepers',
    author: 'Sam Arlen',
    genres: ['Adventure', 'Survival'],
    genre: 'Adventure',
    rating: 4.3,
    reviewCount: 102,
    pages: 364,
    published: 'Aug 09, 2023',
    pull: ['Someone has to keep', 'the last light burning.'],
    about:
      'The lighthouse keepers of a disappearing coast refuse the order to abandon their posts. As the sea takes the road, then the village, then the ground beneath them, they keep the lamps lit for ships that may no longer be coming.',
    summaryLines: ['A disappearing coast.', 'An order to abandon.', 'Keepers who refuse.'],
    summaryBody:
      'Horizon Keepers is a windswept survival story about stubbornness as a form of love, and duty long after anyone is watching.',
    special: [
      { icon: 'spark', title: 'Elemental Power', text: 'The sea is the best-drawn character here.' },
      { icon: 'twist', title: 'Rising Stakes', text: 'The ground literally shrinks beneath them.' },
      { icon: 'people', title: 'Hard-Won Bonds', text: 'Camaraderie forged in genuinely bad weather.' },
      { icon: 'quill', title: 'Muscular Prose', text: 'Spare, salt-worn, and quietly moving.' },
    ],
    review: {
      text: 'Sam Arlen writes weather better than most writers write people — and then writes people who are worth the weather. Bracing, sad, and quietly heroic.',
      overall: 4.2,
      loved: ['Vivid setting', 'Strong ensemble', 'Powerful final chapter'],
      better: ['Bleak in the middle', 'Sparse dialogue'],
    },
  },
  {
    slug: 'the-ember-archive',
    cover: 'book-4',
    title: 'The Ember Archive',
    author: 'Claire Moss',
    genres: ['Historical', 'Wartime'],
    genre: 'Historical',
    rating: 4.5,
    reviewCount: 145,
    pages: 396,
    published: 'Dec 01, 2022',
    pull: ['They saved the books', 'by memorising them.'],
    about:
      'As the archive burns, a group of clerks begins committing its holdings to memory — one person, one book. Decades later, an interviewer tracks down the last surviving keeper to record what she still carries, and what she chose to leave out.',
    summaryLines: ['A burning archive.', 'One person, one book.', 'The last keeper left.'],
    summaryBody:
      'The Ember Archive is a devastating historical novel about memory as resistance, and the quiet editorial power of whoever survives to tell it.',
    special: [
      { icon: 'spark', title: 'Unforgettable Premise', text: 'People as libraries — and all it costs them.' },
      { icon: 'twist', title: 'Late Revelations', text: 'What she left out matters most.' },
      { icon: 'people', title: 'Extraordinary Lead', text: 'One of the great recent heroines.' },
      { icon: 'quill', title: 'Restrained Power', text: 'Never sentimental, always devastating.' },
    ],
    review: {
      text: 'Claire Moss asks what a book is actually for, then answers it with a character who becomes one. The final thirty pages are extraordinary.',
      overall: 4.6,
      loved: ['Stunning premise', 'Devastating ending', 'Immaculate research'],
      better: ['Heavy subject matter', 'Non-linear structure'],
    },
  },
]

// Videos are identical in shape for every book; captions are per-book so the
// cards never read as generic filler.
const videoSet = (book) => [
  {
    label: 'Book Trailer',
    caption: 'Watch the official trailer',
    duration: '2:18',
    thumb: '/assets/trailer-right.jpg',
  },
  {
    label: 'Video Book Review',
    caption: 'Honest review & analysis',
    duration: '8:45',
    thumb: '/assets/model/model-mission.png',
  },
  {
    label: 'Video Book Summary',
    caption: 'Key takeaways in minutes',
    duration: '5:12',
    thumb: '/assets/model/model-news.png',
  },
]

/* ---------------------------------------------------------------------------
   LONG-FORM PAGES: /books/<slug>/review and /books/<slug>/summary

   Add a `fullReview` / `fullSummary` key to any book above to hand-write its
   page. Anything without one is composed automatically from that book's own
   about / summary / review fields, so every book still gets a complete,
   book-specific page out of the box.
   ------------------------------------------------------------------------- */

const FULL = {
  'the-silent-page': {
    fullReview: {
      intro: [
        'The Silent Page is a slow-burning, atmospheric thriller that pulls you in with mystery and holds you captive with secrets layered deep.',
        'From the very first chapter, Lucas Elliot crafts a world that feels hauntingly real. When journalist Adam Reed stumbles upon a series of unpublished manuscripts, he thinks he’s found a story that could change his career. But as he reads deeper, he realizes these pages hold more than just fiction — they hold the key to a truth someone desperately wants to keep buried.',
      ],
      sections: [
        {
          title: 'A Story Wrapped in Secrets',
          body: 'Elliot masterfully weaves past and present, truth and lies, as Adam delves into the life of the manuscript’s reclusive author. Each discovery pulls him further into a dangerous web of hidden motives, forgotten tragedies, and a silence that speaks louder than words.',
        },
        {
          title: 'Atmosphere & Writing',
          body: 'The writing is crisp, immersive, and beautifully paced. The atmosphere feels alive — dimly lit streets, empty libraries, old diaries, and the constant feeling that someone is watching. Elliot’s attention to detail makes every scene vivid and suspenseful.',
        },
        {
          title: 'Characters That Stay With You',
          body: 'Adam Reed is a relatable, flawed protagonist. His curiosity, guilt, and determination make him feel real. The supporting characters are layered and complex, each carrying their own secrets that slowly unravel in unexpected ways.',
        },
      ],
      worked: [
        'Unpredictable twists that keep you guessing',
        'A gripping revelation in the final act',
        'Strong emotional depth beneath the suspense',
        'A chilling yet satisfying ending',
      ],
      better: [
        'The middle section feels slightly slow for some readers',
        'A few secondary characters could have been explored more',
      ],
      verdict:
        'The Silent Page is a must-read for fans of mystery and psychological thrillers. It’s more than just a story — it’s an experience that lingers long after the last page. Lucas Elliot proves once again that silence can be the most terrifying truth of all.',
      quote: 'Sometimes the most dangerous stories are the ones that were never meant to be read.',
      bars: [
        { label: 'Storyline', value: 4.5 },
        { label: 'Characters', value: 4.5 },
        { label: 'Writing Style', value: 4.0 },
        { label: 'Pacing', value: 4.0 },
        { label: 'Overall Enjoyment', value: 4.5 },
      ],
    },
    fullSummary: {
      intro:
        'The Silent Page by Lucas Elliot is a gripping mystery thriller that unfolds through secrets, lies, and the relentless pursuit of truth.',
      sections: [
        {
          title: 'The Beginning',
          body: 'The story begins with journalist Adam Reed, who receives an anonymous package containing a single, unsigned manuscript. What he reads shocks him — a detailed account of crimes that have never been reported. As he digs deeper, Adam realizes the manuscript is not fiction but a confession from someone in his life.',
        },
        {
          title: 'The Investigation',
          body: 'Adam’s curiosity turns into obsession. With every page, he uncovers connections between the manuscript and unsolved cases from years ago. The deeper he goes, the more he puts his career, relationships, and even his life at risk.',
        },
        {
          title: 'The Secrets Unfold',
          body: 'The manuscript reveals long-buried truths — corruption, betrayal, and a powerful network that silenced voices to stay hidden. Adam discovers that the author of the manuscript is closer to him than he ever imagined.',
        },
        {
          title: 'The Turning Point',
          body: 'When Adam pieces together the final clues, he confronts the person behind the manuscript. In a tense showdown, the truth comes out, but at a cost that changes everything.',
        },
        {
          title: 'The Conclusion',
          body: 'The truth is finally exposed, the guilty are held accountable, and Adam chooses a new path — one where he writes not just stories, but the truth that others are afraid to tell.',
        },
      ],
      quote: 'Sometimes the most dangerous stories are the ones that were never meant to be read.',
      takeaways: [
        { icon: 'shield', title: 'Truth Always Surfaces', text: 'No matter how deep it’s buried, the truth always finds its way out.' },
        { icon: 'people', title: 'Curiosity Has a Price', text: 'Seeking the truth can cost you more than you ever expected.' },
        { icon: 'eye', title: 'Nothing Is as It Seems', text: 'Behind every quiet story lies a secret waiting to be revealed.' },
        { icon: 'book', title: 'Words Have Power', text: 'The right words can expose lies, create change, and change lives.' },
      ],
    },
  },
}

// Fallbacks: composed from the book's own fields so each page is specific to
// that title even before anyone hand-writes it.
const deriveReview = (b) => ({
  intro: [b.review.text, b.about],
  sections: [
    { title: 'A Story Worth Following', body: b.summaryBody },
    { title: 'Atmosphere & Writing', body: `${b.special[3]?.text || ''} ${b.author} writes with a control of tone that keeps ${b.title} vivid from first page to last.`.trim() },
    { title: 'Characters That Stay With You', body: `${b.special[2]?.text || ''} They carry the story’s weight without ever feeling like devices.`.trim() },
  ],
  worked: b.review.loved,
  better: b.review.better,
  verdict: `${b.title} is a rewarding read for anyone drawn to ${b.genres.slice(0, 2).join(' and ').toLowerCase()}. ${b.summaryBody}`,
  quote: b.pull.join(' '),
  bars: [
    { label: 'Storyline', value: b.review.overall },
    { label: 'Characters', value: Math.min(5, b.review.overall + 0.1) },
    { label: 'Writing Style', value: Math.max(3.5, b.review.overall - 0.2) },
    { label: 'Pacing', value: Math.max(3.5, b.review.overall - 0.4) },
    { label: 'Overall Enjoyment', value: b.review.overall },
  ],
})

const deriveSummary = (b) => ({
  intro: `${b.title} by ${b.author} is a ${b.genre.toLowerCase()} that ${b.summaryBody.charAt(0).toLowerCase()}${b.summaryBody.slice(1)}`,
  sections: [
    { title: 'The Beginning', body: b.about },
    { title: 'What Drives It', body: `${b.summaryLines.join(' ')} These threads set the story in motion and rarely let it settle.` },
    { title: 'The Heart of the Book', body: b.special[0]?.text ? `${b.special[0].text} ${b.special[1]?.text || ''}`.trim() : b.summaryBody },
    { title: 'The Conclusion', body: b.review.text },
  ],
  quote: b.pull.join(' '),
  takeaways: (b.special || []).map((s, i) => ({
    icon: ['shield', 'people', 'eye', 'book'][i] || 'book',
    title: s.title,
    text: s.text,
  })),
})

export const BOOKS = RAW_BOOKS.map((b) => ({
  ...DEFAULTS,
  ...b,
  coverSrc: `/assets/${b.cover}.png`,
  videos: b.videos || videoSet(b),
}))

// Attach the long-form pages once the base book objects exist, so the derived
// versions can read the finished fields.
BOOKS.forEach((b) => {
  const hand = FULL[b.slug] || {}
  b.fullReview = hand.fullReview || deriveReview(b)
  b.fullSummary = hand.fullSummary || deriveSummary(b)
})

export const getBook = (slug) => BOOKS.find((b) => b.slug === slug)

// Three other titles for the "More Books You'll Love" rail.
export const relatedBooks = (slug, count = 3) =>
  BOOKS.filter((b) => b.slug !== slug).slice(0, count)

// Small helper so link markup stays consistent everywhere.
export const bookHref = (book) => `/books/${book.slug}`
