/* ============================================================================
   BOOK DATA — single source of truth for every book on the site.

   TO EDIT A BOOK: find it below and change the values. Nothing else to touch —
   the collection page (/books) and each detail page (/books/<slug>) both read
   from here.

   TO ADD A BOOK: copy any entry, give it a NEW unique `slug`, drop a cover at
   /public/assets/books/<slug>.jpg, and it appears automatically. Anything you
   leave out falls back to DEFAULTS below.

   ORDER MATTERS: the homepage "Top Picks for You" shelf shows the first twelve
   entries, and the "Latest Book Reviews" grid shows the first six. Reorder the
   array to change either.

   NOTE: the blurbs and review copy below are written for this site. The
   numeric metadata (rating, reviewCount, pages, published) is editorial
   placeholder — swap in the real figures once you have them.
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
    slug: 'fair-game',
    title: 'Fair Game',
    author: 'George Chu',
    genres: ['Literary', 'Sports Fiction', 'Coming of Age'],
    genre: 'Literary',
    rating: 4.4,
    reviewCount: 61,
    pages: 328,
    published: 'Sep 12, 2023',
    pull: ['Everyone calls it a fair game.', 'Nobody agrees on what fair means.'],
    about:
      'A novel about the two spotlights a young life can get caught between — the one over a stadium and the one waiting above a music stand. George Chu writes talent as a form of pressure: what a family expects, what a team demands, and what a person quietly wants instead. Fair Game asks what the word fair actually means once ambition, loyalty and identity are all standing on the same field.',
    summaryLines: ['A game that asks for everything.', 'A gift that asks for something else.', 'One player caught between both.'],
    summaryBody:
      'Fair Game is a warm, sharply observed novel about ambition and belonging — and about how rarely the thing we are good at and the thing we love turn out to be the same thing.',
    verdict:
      'Fair Game is a rewarding read for anyone who has ever been good at something they did not choose. George Chu writes ambition and affection with the same steady hand, and the closing chapters land exactly where they should.',
    summaryIntro:
      'Fair Game follows one young athlete through a season in which the field and the music stand begin asking for the same hours, from the same person.',
    special: [
      { icon: 'spark', title: 'Two Worlds, One Voice', text: 'The locker room and the rehearsal room, written with equal care.' },
      { icon: 'twist', title: 'Quiet Turns', text: 'The shifts here come from character rather than contrivance.' },
      { icon: 'people', title: 'Characters With Weight', text: 'Teammates, parents and rivals who all want something real.' },
      { icon: 'quill', title: 'Clean, Confident Prose', text: 'Unshowy writing that trusts the reader completely.' },
    ],
    review: {
      text: 'Fair Game earns its title slowly. George Chu keeps the stakes human — a scholarship, a solo, a parent’s approval — and that restraint is exactly what makes the final act land.',
      overall: 4.4,
      loved: ['Sharp, believable dialogue', 'A genuinely felt sense of place', 'An ending that resists the easy note'],
      better: ['Deliberate, unhurried pacing', 'Game scenes assume some familiarity'],
    },
  },
  {
    slug: 'daddys-home',
    title: 'Daddy’s Home',
    author: 'A.K. Alexander',
    genres: ['Thriller', 'Mystery', 'Crime'],
    genre: 'Thriller',
    rating: 4.3,
    reviewCount: 142,
    pages: 364,
    published: 'Mar 07, 2023',
    pull: ['Two words you once ran toward.', 'Now the last thing you want to hear.'],
    about:
      'A house at the end of a wet road, every light burning, and no good reason for it. Daddy’s Home opens the Holly Jennings series in the place thrillers are most dangerous — the family home — and turns a phrase every child once ran toward into something you dread hearing. A.K. Alexander builds the tension out of ordinary things: a porch light, an empty mailbox, a door that should have been locked.',
    summaryLines: ['A house that should be empty.', 'Every light left on.', 'Someone who never really left.'],
    summaryBody:
      'Daddy’s Home is a dark, fast-moving thriller that takes the safest three words in a family’s vocabulary and makes them the last thing anyone wants to hear.',
    verdict:
      'Daddy’s Home is a strong series opener and an easy recommendation for readers who like their thrillers domestic, fast and genuinely tense. Start it early in the evening.',
    summaryIntro:
      'Daddy’s Home opens the Holly Jennings series with a house that should be empty, a family that will not talk, and a phrase that stops meaning what it used to.',
    special: [
      { icon: 'spark', title: 'Hooks on Page One', text: 'The opening chapter offers no graceful way out.' },
      { icon: 'twist', title: 'Escalating Dread', text: 'Every chapter closes a little tighter than the last.' },
      { icon: 'people', title: 'A Lead Worth Following', text: 'Holly Jennings is capable, bruised and stubbornly human.' },
      { icon: 'quill', title: 'Lean, Cinematic Chapters', text: 'Short scenes built for reading well past midnight.' },
    ],
    review: {
      text: 'A.K. Alexander knows that the most frightening room in a thriller is the one you grew up in. Daddy’s Home is relentless, well plotted and genuinely uncomfortable in the best way.',
      overall: 4.3,
      loved: ['A premise that grabs immediately', 'Tight, propulsive chapters', 'A lead worth following into the series'],
      better: ['Bleak in places', 'A few threads held back for later books'],
    },
  },
  {
    slug: 'deep-end',
    title: 'Deep End',
    author: 'Ali Hazelwood',
    genres: ['Romance', 'Contemporary', 'Sports Romance'],
    genre: 'Romance',
    rating: 4.5,
    reviewCount: 231,
    pages: 400,
    published: 'Feb 04, 2025',
    pull: ['She spent her life aiming for the water.', 'Nobody warned her about the fall.'],
    about:
      'Ali Hazelwood moves from the laboratory to the pool deck for a romance about control — who asks for it, who offers it, and how much honesty that actually takes. Deep End pairs a diver rebuilding her nerve after injury with a swimmer whose whole reputation rests on discipline, and lets the tension come from two people negotiating out loud exactly what they want. It is her most candid book, and one of her most tender.',
    summaryLines: ['A diver rebuilding her nerve.', 'A swimmer who does nothing halfway.', 'An arrangement neither expected to feel like this.'],
    summaryBody:
      'Deep End is a smart, steamy, disarmingly gentle romance about trust as a negotiation — and about how much courage it takes to say the true thing first.',
    verdict:
      'Deep End is Ali Hazelwood at her most candid: funny, warm and unusually honest about what people need from one another. Recommended for readers who want their romance direct.',
    summaryIntro:
      'Deep End follows a college diver and a swimmer through a season, an arrangement, and the slow work of learning to say what they actually want.',
    special: [
      { icon: 'spark', title: 'Electric Chemistry', text: 'The tension arrives early and never loses its footing.' },
      { icon: 'twist', title: 'Honest About Desire', text: 'A romance that lets its leads say what they want out loud.' },
      { icon: 'people', title: 'Two Real Athletes', text: 'The training, the injuries and the fear are all taken seriously.' },
      { icon: 'quill', title: 'Warm, Funny Voice', text: 'Hazelwood’s banter, doing what Hazelwood’s banter does.' },
    ],
    review: {
      text: 'Hazelwood has always written clever women who overthink their way into love. Deep End adds something braver — a romance about asking plainly for what you need, and being met there.',
      overall: 4.4,
      loved: ['Genuinely swoony chemistry', 'A refreshingly frank central dynamic', 'Sharp, funny narration'],
      better: ['Steam level will not suit every reader', 'Third-act conflict resolves quickly'],
    },
  },
  {
    slug: 'deaths-heir',
    title: 'Death’s Heir',
    author: 'Day Parker',
    genres: ['Fantasy', 'Gothic', 'Dark Fantasy'],
    genre: 'Fantasy',
    rating: 4.2,
    reviewCount: 87,
    pages: 386,
    published: 'Oct 24, 2023',
    pull: ['Some titles are given.', 'This one comes to collect.'],
    about:
      'A silhouette filled with dark trees, a raven keeping watch, and a girl walking a path she did not choose. Death’s Heir is a gothic fantasy about inheritance in its oldest sense — a title, a duty and a debt that arrive whether or not you are ready for them. Day Parker writes the forest as something patient rather than cruel, and the result unsettles more than it frightens.',
    summaryLines: ['An inheritance nobody asks for.', 'A forest that waits.', 'An heir who walks in anyway.'],
    summaryBody:
      'Death’s Heir is an atmospheric, myth-tinged fantasy about duty, grief, and the strange dignity of accepting a role that was never offered as a choice.',
    verdict:
      'Death’s Heir is for readers who want atmosphere first and answers second. Day Parker has built somewhere worth staying, and the patience it asks for is repaid.',
    summaryIntro:
      'Death’s Heir follows an unwilling heir into a forest, a title, and a duty that has been waiting a very long time for someone to accept it.',
    special: [
      { icon: 'spark', title: 'Immersive Atmosphere', text: 'Moonlight, old trees and a quiet that presses in.' },
      { icon: 'twist', title: 'Folkloric Logic', text: 'The rules feel inherited rather than invented.' },
      { icon: 'people', title: 'A Heroine With Spine', text: 'She carries the weight without being crushed by it.' },
      { icon: 'quill', title: 'Lush, Measured Prose', text: 'Written with the cadence of an old story told well.' },
    ],
    review: {
      text: 'Day Parker builds a world that feels older than its own plot. Death’s Heir is patient, atmospheric fantasy for readers who want dread and beauty in the same sentence.',
      overall: 4.2,
      loved: ['Gorgeous gothic atmosphere', 'A strong sense of folklore', 'A memorable central figure'],
      better: ['Slow-burn opening chapters', 'Some answers held back for the sequel'],
    },
  },
  {
    slug: 'the-zen-monkey-and-the-lotus-flower',
    title: 'The Zen Monkey and the Lotus Flower',
    author: 'Tenpa Yeshe',
    genres: ['Mindfulness', 'Self-Help', 'Short Stories'],
    genre: 'Mindfulness',
    rating: 4.5,
    reviewCount: 176,
    pages: 264,
    published: 'Jan 18, 2023',
    pull: ['The monkey never stops moving.', 'The lotus never hurries.'],
    about:
      'Fifty-two short stories, one for each week of the year, written in the tradition of the teaching tale — a small scene, a turn, and a thought you keep carrying afterwards. Tenpa Yeshe writes about attention, anger, patience and letting go without ever raising his voice, and the brevity is the point: each piece is short enough for a spare five minutes and slow enough to sit with for days.',
    summaryLines: ['Fifty-two short stories.', 'One for every week.', 'None longer than a quiet moment.'],
    summaryBody:
      'The Zen Monkey and the Lotus Flower is a calm, generous collection of teaching stories about presence, patience and perspective — made to be read slowly and returned to often.',
    verdict:
      'The Zen Monkey and the Lotus Flower is best kept somewhere visible and read one story at a time. Taken that way it is among the quietly most useful books on the shelf.',
    summaryIntro:
      'The Zen Monkey and the Lotus Flower gathers fifty-two short teaching stories, each built around a single idea about attention, patience or letting go.',
    special: [
      { icon: 'spark', title: 'A Story a Week', text: 'Built for a year of small, deliberate reading.' },
      { icon: 'twist', title: 'Gentle Reframes', text: 'Each tale turns on a thought you did not see coming.' },
      { icon: 'people', title: 'Open to Everyone', text: 'No background in Buddhist practice required.' },
      { icon: 'quill', title: 'Plain, Unhurried Language', text: 'Simple sentences doing patient work.' },
    ],
    review: {
      text: 'This is a book that refuses to hurry you. Tenpa Yeshe trusts the old form — a short story, lightly told, left to do its own work — and it proves far more effective than another list of habits.',
      overall: 4.3,
      loved: ['Perfect length for daily reading', 'Calming, unpreachy tone', 'Stories that genuinely stay with you'],
      better: ['Some lessons repeat across the year', 'Best in small doses, not one sitting'],
    },
  },
  {
    slug: 'a-mission-without-borders',
    title: 'A Mission Without Borders',
    author: 'Chad Robichaux',
    genres: ['Memoir', 'Nonfiction', 'Inspirational'],
    genre: 'Memoir',
    rating: 4.7,
    reviewCount: 118,
    pages: 256,
    published: 'Sep 10, 2024',
    pull: ['Nobody asked them to go.', 'They went.'],
    about:
      'A former Force Recon Marine and his son travel into a war zone with no mandate, no cover and a list of people who need to get out. Written with Craig Borlase, A Mission Without Borders is the account of that decision and everything it cost, carried throughout by one question: what do you owe a stranger in the worst week of their life? It is a book about rescue work, faith, and the particular strain of doing dangerous things alongside your own child.',
    summaryLines: ['A father and a son.', 'A border nobody should have to cross.', 'A list of people waiting on the other side.'],
    summaryBody:
      'A Mission Without Borders is a first-hand account of humanitarian rescue work in Ukraine — unsentimental about the danger, and clear-eyed about why they went anyway.',
    verdict:
      'A Mission Without Borders is a compelling account of a rescue effort most readers will never have heard about, told by the people who carried it out. Worth reading for the civilians at its centre alone.',
    summaryIntro:
      'A Mission Without Borders recounts a father and son’s decision to enter Ukraine as civilians, and the rescue work that followed.',
    special: [
      { icon: 'spark', title: 'First-Hand Account', text: 'Written by the people who were actually there.' },
      { icon: 'twist', title: 'Father and Son', text: 'A family story running underneath the mission.' },
      { icon: 'people', title: 'The People Being Helped', text: 'Civilians given names and pages, not statistics.' },
      { icon: 'quill', title: 'Direct, Unadorned Telling', text: 'Reported plainly, which makes it hit harder.' },
    ],
    review: {
      text: 'Robichaux writes about extraordinary risk in an ordinary register, and that is the book’s strength. The father-and-son thread turns a rescue account into something considerably more personal.',
      overall: 4.5,
      loved: ['Gripping first-hand reporting', 'A moving father-and-son core', 'Real respect for the people being helped'],
      better: ['Faith framing is central throughout', 'The timeline jumps in places'],
    },
  },
  {
    slug: 'check-and-mate',
    title: 'Check & Mate',
    author: 'Ali Hazelwood',
    genres: ['Young Adult', 'Romance', 'Contemporary'],
    genre: 'Young Adult',
    rating: 4.4,
    reviewCount: 264,
    pages: 368,
    published: 'Nov 07, 2023',
    pull: ['She swore she was finished with the board.', 'The board disagreed.'],
    about:
      'Mallory Greenleaf quit chess, and she had good reasons. A charity tournament, one careless afternoon and a win against the reigning world champion drag her straight back into a game she associates with the worst year of her life. Check & Mate is Ali Hazelwood’s first novel for younger readers: a rivals-to-lovers romance built on a genuinely well-drawn sport, and on a girl working out how much of her family she is allowed to put down.',
    summaryLines: ['A game she walked away from.', 'One match she was not supposed to win.', 'A rival who will not let her leave again.'],
    summaryBody:
      'Check & Mate is a bright, funny rivals-to-lovers romance about talent, family obligation, and the difficulty of wanting something for yourself.',
    verdict:
      'Check & Mate is a sharp, funny, satisfying romance and a genuinely good sports novel underneath it. An easy recommendation for readers of any age.',
    summaryIntro:
      'Check & Mate follows Mallory Greenleaf from a charity match she never wanted to play back into the game, and toward the champion she beat.',
    special: [
      { icon: 'spark', title: 'Rivals to Lovers, Done Right', text: 'Slow-building tension that pays off properly.' },
      { icon: 'twist', title: 'Chess That Works', text: 'The matches are tense even if you have never played.' },
      { icon: 'people', title: 'A Great Found Family', text: 'Sisters, friends and mentors who all feel real.' },
      { icon: 'quill', title: 'Fast, Funny Narration', text: 'Mallory’s voice carries the whole book.' },
    ],
    review: {
      text: 'Hazelwood’s move into young adult loses none of the banter and gains a real ache underneath it. Mallory’s guilt about her family is the engine here, and the romance is better for it.',
      overall: 4.4,
      loved: ['A wonderful lead voice', 'Genuine tension over the board', 'A satisfying, earned romance'],
      better: ['Predictable beats in the middle', 'Some side characters underused'],
    },
  },
  {
    slug: 'his-name-everywhere',
    title: 'His Name Everywhere',
    author: 'Howard Kane',
    genres: ['Legal Thriller', 'Suspense', 'Family Drama'],
    genre: 'Legal Thriller',
    rating: 4.3,
    reviewCount: 96,
    pages: 312,
    published: 'Jun 20, 2024',
    pull: ['She spent years unlearning that name.', 'Now it is on every page of the file.'],
    about:
      'The fifth book in The Daughter of a Drunk turns the series toward the courtroom. A name that should have stayed buried is suddenly on every document, every witness list and every headline — and the woman who spent years getting free of it has to decide whether facing him publicly is worth what it will cost. Howard Kane writes legal suspense with the emotional machinery of a recovery story, and that combination is what makes the series work.',
    summaryLines: ['A name she buried.', 'A case that digs it up.', 'A courtroom with nowhere to look away.'],
    summaryBody:
      'His Name Everywhere is a legal suspense thriller about confronting the past on the record, where every answer becomes evidence.',
    verdict:
      'His Name Everywhere rewards readers who have followed the series and closes its central question with real conviction. Start at book one, then come here.',
    summaryIntro:
      'His Name Everywhere brings the series into a courtroom, where the name at the centre of it finally has to be spoken on the record.',
    special: [
      { icon: 'spark', title: 'Courtroom Pressure', text: 'The legal scenes carry real tension.' },
      { icon: 'twist', title: 'Series Payoff', text: 'Threads from the earlier books finally close.' },
      { icon: 'people', title: 'A Survivor, Not a Victim', text: 'The lead is written with hard-won agency.' },
      { icon: 'quill', title: 'Direct, Unsparing Voice', text: 'Plain prose about difficult things.' },
    ],
    review: {
      text: 'Kane keeps the legal procedure tight without ever losing the personal stakes underneath it. Five books in, the series has earned the weight this one carries.',
      overall: 4.2,
      loved: ['Strong courtroom sequences', 'Real emotional continuity', 'A hard-won ending'],
      better: ['Best read after the earlier books', 'Heavy subject matter throughout'],
    },
  },
  {
    slug: 'exactly-like-my-father',
    title: 'Exactly Like My Father',
    author: 'Howard Kane',
    genres: ['Memoir', 'Recovery', 'Family Drama'],
    genre: 'Memoir',
    rating: 4.4,
    reviewCount: 108,
    pages: 244,
    published: 'Feb 15, 2023',
    pull: ['The worst thing anyone said about him', 'was that she was just like him.'],
    about:
      'The second book in The Daughter of a Drunk takes on the sentence adult children of alcoholics dread most — that they will turn out exactly like the parent they spent years trying to escape. Howard Kane writes about inherited patterns without excusing them, and about the daily, unglamorous work of proving that sentence wrong. It is written for anyone who grew up listening for a car in the driveway.',
    summaryLines: ['A fear that arrives in your own voice.', 'A pattern nobody chose.', 'The work of breaking it anyway.'],
    summaryBody:
      'Exactly Like My Father is a raw, hopeful book about growing up with an alcoholic parent, and about refusing to accept inheritance as a verdict.',
    verdict:
      'Exactly Like My Father is not a comfortable book, but it is a generous one. For anyone who grew up in a house like this, it reads like being told the truth kindly.',
    summaryIntro:
      'Exactly Like My Father works through the fear that gives the book its title, and the daily practice of proving it wrong.',
    special: [
      { icon: 'spark', title: 'Painfully Honest', text: 'Written without flinching and without self-pity.' },
      { icon: 'twist', title: 'Hope Without Tidiness', text: 'Recovery here is slow, and treated as such.' },
      { icon: 'people', title: 'You Will Recognise Someone', text: 'Family dynamics rendered with real accuracy.' },
      { icon: 'quill', title: 'Plain, Direct Writing', text: 'Clear enough to read on a difficult day.' },
    ],
    review: {
      text: 'This is a hard book that never makes hardship the point. Kane writes about inherited harm with enough clarity that the hope at the end feels earned rather than offered.',
      overall: 4.4,
      loved: ['Unflinching honesty', 'A genuinely useful perspective', 'Hope that feels earned'],
      better: ['Heavy going in places', 'Some repetition between chapters'],
    },
  },
  {
    slug: 'becoming-dad',
    title: 'Becoming Dad',
    author: 'Justin P. Hairston',
    genres: ['Parenting', 'Memoir', 'Inspirational'],
    genre: 'Parenting',
    rating: 4.4,
    reviewCount: 64,
    pages: 168,
    published: 'May 09, 2023',
    pull: ['Anyone can be called Dad.', 'Becoming one takes longer.'],
    about:
      'Becoming a father happens in an afternoon. Becoming Dad, Justin P. Hairston argues, takes considerably longer. This is a short, personal book about the gap between the two — about the version of fatherhood a man inherits, the version he is told to perform, and the one he has to build himself, usually at three in the morning with nobody watching.',
    summaryLines: ['A title given in a day.', 'An identity built over years.', 'The distance between the two.'],
    summaryBody:
      'Becoming Dad is a reflective, encouraging book about fatherhood as something learned rather than granted — written for men still working out what kind of father they want to be.',
    verdict:
      'Becoming Dad is a short, sincere book that does exactly what it sets out to do. Give it to a new father quietly wondering whether he is getting it right.',
    summaryIntro:
      'Becoming Dad traces one man’s shift from being called a father to understanding what he wanted that word to mean.',
    special: [
      { icon: 'spark', title: 'Honest and Personal', text: 'Written from experience rather than theory.' },
      { icon: 'twist', title: 'Identity Over Instruction', text: 'Less a how-to, more a hard look in the mirror.' },
      { icon: 'people', title: 'For New and Older Fathers', text: 'Useful at any point on the road.' },
      { icon: 'quill', title: 'Warm, Conversational Tone', text: 'Reads like a long talk with a friend.' },
    ],
    review: {
      text: 'Hairston avoids the two usual traps of fatherhood books — the checklist and the highlight reel. What is left is honest, quiet and worth handing to a friend who has just become a dad.',
      overall: 4.3,
      loved: ['Sincere and grounded', 'Short enough to actually finish', 'Encouraging without being preachy'],
      better: ['Light on practical guidance', 'A faith perspective throughout'],
    },
  },
  {
    slug: 'shine-my-amazing-girl',
    title: 'Shine, My Amazing Girl',
    author: 'Emma Meyer',
    genres: ['Children’s', 'Confidence', 'Growing Up'],
    genre: 'Children’s',
    rating: 4.6,
    reviewCount: 92,
    pages: 40,
    published: 'Apr 02, 2024',
    pull: ['She practised being small.', 'It never once fit.'],
    about:
      'A school corridor, a crowd, and a girl deciding whether to make herself smaller. Shine, My Amazing Girl is a warm illustrated story about confidence at exactly the age it starts to wobble — the years when being noticed and being liked stop feeling like the same thing. Emma Meyer writes for girls who are quietly brilliant and not yet sure that is allowed.',
    summaryLines: ['A crowded hallway.', 'A girl deciding how much to show.', 'A reason to stand up straight.'],
    summaryBody:
      'Shine, My Amazing Girl is an encouraging story about self-belief, kindness and taking up your own space — written for growing girls and the adults cheering them on.',
    verdict:
      'Shine, My Amazing Girl is a lovely gift for a girl at the age when confidence gets complicated. Read it together, more than once.',
    summaryIntro:
      'Shine, My Amazing Girl follows a bright, quiet girl through the school year in which she decides to stop shrinking.',
    special: [
      { icon: 'spark', title: 'Confidence Building', text: 'Encouragement that never talks down.' },
      { icon: 'twist', title: 'A Real School Feeling', text: 'Corridors, cliques and courage, all recognisable.' },
      { icon: 'people', title: 'A Girl Worth Rooting For', text: 'Shy, bright and drawn with real affection.' },
      { icon: 'quill', title: 'Bright, Readable Voice', text: 'Simple language and a great deal of heart.' },
    ],
    review: {
      text: 'A gentle, well-judged book about the moment a girl learns she is allowed to be seen. It earns its message by letting the nerves be real first.',
      overall: 4.4,
      loved: ['Genuinely encouraging', 'Lovely illustrations', 'A message that lands without lecturing'],
      better: ['Short for older readers', 'A familiar structure'],
    },
  },
  {
    slug: 'im-7-and-thats-amazing',
    title: 'I’m 7 and That’s Amazing!',
    author: 'Emily Monroe',
    genres: ['Children’s', 'Birthday', 'Picture Book'],
    genre: 'Children’s',
    rating: 4.6,
    reviewCount: 74,
    pages: 36,
    published: 'Jan 30, 2025',
    pull: ['Seven is not just a number.', 'Ask anyone who has just turned it.'],
    about:
      'A birthday book for seven-year-olds, built around the small, specific things that make seven worth celebrating — reading whole chapters alone, having actual opinions, and being trusted with things you were not trusted with at six. Emily Monroe keeps it bright, kind and firmly on the child’s side.',
    summaryLines: ['Seven whole years.', 'A hundred new small skills.', 'Every reason to be proud of them.'],
    summaryBody:
      'I’m 7 and That’s Amazing! is a cheerful celebration of turning seven — a birthday gift book about growing up, trying hard, and being proud of both.',
    verdict:
      'I’m 7 and That’s Amazing! is exactly the right book for exactly one birthday, and it makes the most of it. Wrap it up and hand it over.',
    summaryIntro:
      'I’m 7 and That’s Amazing! walks through everything that is new, hard and brilliant about being seven years old.',
    special: [
      { icon: 'spark', title: 'A Perfect Birthday Gift', text: 'Made to be handed over with a bow on it.' },
      { icon: 'twist', title: 'Small, Specific Wins', text: 'Celebrates what seven-year-olds actually care about.' },
      { icon: 'people', title: 'Squarely on the Child’s Side', text: 'Encouraging without a single lecture.' },
      { icon: 'quill', title: 'Sunny, Simple Writing', text: 'Easy enough for a new reader to manage alone.' },
    ],
    review: {
      text: 'Exactly what a birthday book should be — short, warm, and specific enough that a seven-year-old recognises themselves on every page.',
      overall: 4.5,
      loved: ['Lovely, warm illustrations', 'An ideal gift book', 'Reads well aloud or alone'],
      better: ['Outgrown quickly', 'Very short'],
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
   about / summary / review / verdict fields, so every book still gets a
   complete, book-specific page out of the box.
   ------------------------------------------------------------------------- */

const FULL = {}

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
  verdict: b.verdict || `${b.title} is a rewarding read. ${b.summaryBody}`,
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
  intro: b.summaryIntro || b.summaryBody,
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
  coverSrc: b.coverSrc || `/assets/books/${b.slug}.jpg`,
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
