/**
 * The long-form story of each house. Each fact is checked against the house's
 * `sources` list before it goes in, and anything a source does not support is
 * left out. A house without an entry shows a short page instead.
 */

export type Chapter = { year: string; title: string; body: string };
export type Code = { name: string; body: string };

export type HouseStory = {
  founded: string;
  origin: string;
  founders: string;
  /** One line, our words, set under the name. */
  line: string;
  intro: string;
  /** The person or people behind the house, told as a story. */
  founder?: { name: string; body: string };
  chapters: Chapter[];
  /** Who the house was made for, then and now. */
  audience?: string;
  /** What the house stands for. This is Hanger 22's point of view. */
  meaning?: string;
  codes: Code[];
  sources: { label: string; url: string }[];
};

export const HOUSE_STORIES: Record<string, HouseStory> = {
  "stone-island": {
    founded: "1982",
    origin: "Ravarino, Italy",
    founders: "Massimo Osti",
    line: "A house that starts with the cloth.",
    intro:
      "Stone Island began with a lorry tarpaulin. Massimo Osti, already running C.P. Company, studied a heavy tarpaulin canvas and stone-washed it until it softened. The cloth became Tela Stella, and seven outerwear pieces cut from it became the first Stone Island collection.",
    chapters: [
      {
        year: "1982",
        title: "Seven jackets and a badge",
        body: "The first collection was seven pieces of outerwear in Tela Stella. The first jacket carried a compass on a fabric badge, and the name came from the novels of Joseph Conrad.",
      },
      {
        year: "1983",
        title: "A partner",
        body: "Carlo Rivetti joined as Osti's business partner, and his family's GFT group took half of the company. It was the start of a relationship that would shape Stone Island for nearly four decades.",
      },
      {
        year: "1993",
        title: "The Rivetti years",
        body: "The Rivetti family took full control of the company.",
      },
      {
        year: "2008",
        title: "Rivetti takes the pen",
        body: "Carlo Rivetti became creative director, leading the house's design and research himself.",
      },
      {
        year: "2020",
        title: "Into Moncler",
        body: "In December 2020 Moncler agreed to acquire Stone Island for €1.15 billion, bringing two houses built on outerwear under one roof.",
      },
    ],
    codes: [
      { name: "The badge", body: "The compass rose on a fabric badge, worn on the left sleeve. It is the most recognised detail in the house." },
      { name: "Garment dyeing", body: "Pieces are dyed after they are made. The house describes a library of more than 60,000 dye recipes." },
      { name: "Ghost", body: "Ghost pieces dye the badge into the garment's own colour, so the mark only shows up close." },
    ],
    sources: [
      { label: "Stone Island, About us", url: "https://www.stoneisland.com/en-ca/about-us.html" },
      { label: "Moncler Group, Stone Island history", url: "https://www.monclergroup.com/en/brands/stone-island/history" },
      { label: "Wikipedia, Stone Island", url: "https://en.wikipedia.org/wiki/Stone_Island" },
      { label: "Retail Insight Network, Moncler acquisition", url: "https://www.retail-insight-network.com/news/moncler-stone-island-acquisition/" },
    ],
  },

  rolex: {
    "founded": "1905",
    "origin": "London, then Geneva",
    "founders": "Hans Wilsdorf and Alfred Davis",
    "line": "Built to prove a point, worn as proof of one.",
    "intro": "Rolex began in London in 1905, when Hans Wilsdorf and Alfred Davis set up Wilsdorf and Davis to bring Swiss movements to Britain and fit them in cases of their own choosing. At the time a wristwatch was seen as a delicate novelty. Wilsdorf believed it could be precise enough and tough enough to replace the pocket watch, and he spent the rest of his life proving it.",
    "founder": {
      "name": "Hans Wilsdorf",
      "body": "Wilsdorf was born in Kulmbach, Bavaria, in 1881 and lost both parents by the age of twelve. His uncles sold the family business and sent the children to boarding school, so he learned early to make his own way. He trained with a pearl exporter, then in 1900 moved to La Chaux de Fonds in Switzerland to work for a watch firm, where he wound and checked pocket watches and learned the trade from the inside. In 1908 he registered the name Rolex. He wanted a word short enough to fit on a dial and easy to say in any language."
    },
    "chapters": [
      {
        "year": "1910",
        "title": "Proof of precision",
        "body": "Rolex became the first watchmaker to win official chronometer certification for a wristwatch, a small ladies' model. It was the first answer to anyone who doubted a watch could be both small and exact."
      },
      {
        "year": "1919",
        "title": "Geneva",
        "body": "Heavy taxes on luxury imports and duties on silver and gold made Britain expensive after the war. Wilsdorf moved the company to Switzerland and settled it in Geneva, where Rolex has stayed ever since."
      },
      {
        "year": "1926",
        "title": "The Oyster",
        "body": "Rolex sealed the movement inside a case it called the Oyster, built to keep out water and dust. The next year the swimmer Mercedes Gleitze crossed the English Channel with an Oyster, and the waterproof wristwatch had its proof."
      },
      {
        "year": "1931",
        "title": "Perpetual",
        "body": "A rotor that winds the watch with every movement of the wrist meant an Oyster no longer had to be wound by hand. Perpetual still appears on Rolex dials today."
      },
      {
        "year": "1953",
        "title": "Everest and the deep",
        "body": "In the year Everest was first climbed, Rolex launched the Explorer to celebrate the ascent, and the Submariner, water resistant to 100 metres. The professional watch became the language of the house."
      },
      {
        "year": "1960",
        "title": "The foundation",
        "body": "In the mid 1940s Wilsdorf set up the Hans Wilsdorf Foundation and left it his Rolex shares. When he died in Geneva in 1960, the foundation took over, and it still owns and runs the company today."
      }
    ],
    "audience": "Rolex was built around people who do difficult things: explorers, divers, aviators and racing drivers. Its partnerships, from the Le Mans 24 Hours to the US Open, keep it in that company. Rolex is estimated to make around 1.2 million watches a year, and it has kept its reputation as a status symbol for generations of buyers who want a watch that means something.",
    "meaning": "A Rolex means something before you look at the time. It stands for proof: a watch tested in the sea, on mountains and in the air before it was ever a symbol. Owned by a foundation rather than shareholders, it has never needed to chase a trend, and it has barely needed to change. That is the point. You are buying the idea Hans Wilsdorf had in 1905, refined for more than a century.",
    "codes": [
      {
        "name": "The Oyster",
        "body": "The sealed case of 1926 that made the waterproof wristwatch real. The name lives on across the collection."
      },
      {
        "name": "Perpetual",
        "body": "The self winding rotor of 1931. The watch powers itself as long as it is worn."
      },
      {
        "name": "Chronometer",
        "body": "Precision certified from the very start. Rolex built its name on proving accuracy on the wrist."
      }
    ],
    "sources": [
      {
        "label": "Wikipedia, Rolex",
        "url": "https://en.wikipedia.org/wiki/Rolex"
      },
      {
        "label": "Wikipedia, Hans Wilsdorf",
        "url": "https://en.wikipedia.org/wiki/Hans_Wilsdorf"
      }
    ]
  },

  moncler: {
    "founded": "1952",
    "origin": "Monestier-de-Clermont, France",
    "founders": "René Ramillon and André Vincent",
    "line": "From mountain workwear to luxury, always in down.",
    "intro": "Moncler began in 1952 in Monestier-de-Clermont, a mountain village near Grenoble that gave the brand its name. René Ramillon and André Vincent started by making what people in the mountains needed: padded sleeping bags, a hooded cape and tents that folded away.",
    "founder": {
      "name": "Ramillon and Vincent, then Remo Ruffini",
      "body": "The founders built Moncler for function. In 1954 they made their first down jackets for the workers in their own factory, and the jackets were good enough to catch the eye of the mountaineer Lionel Terray, whose input shaped a specialist range, Moncler pour Lionel Terray. Half a century later the house found its second founder. In 2003 Remo Ruffini bought Moncler, moved it to Milan and relaunched it as a luxury brand, with the down jacket still at its heart."
    },
    "chapters": [
      {
        "year": "1954",
        "title": "K2",
        "body": "Moncler jackets went with the Italian expedition to K2, whose climbers reached the summit. A year later Moncler equipped the French team that conquered Makalu."
      },
      {
        "year": "1968",
        "title": "Grenoble",
        "body": "At the Winter Olympics in Grenoble, Moncler was the official supplier to the French downhill ski team, and the jacket moved from survival kit to sporting style."
      },
      {
        "year": "1980s",
        "title": "Into the city",
        "body": "The glossy quilted jacket came down from the mountains onto the streets of Italian cities, where it became the uniform of the Paninari youth movement. The designer Chantal Thomass worked with the house until 1989."
      },
      {
        "year": "1992",
        "title": "An Italian house",
        "body": "Pepper Industries acquired the company, and Moncler became an Italian brand."
      },
      {
        "year": "2003",
        "title": "Ruffini",
        "body": "Remo Ruffini bought Moncler, moved it to Milan and set out to make it a luxury house."
      },
      {
        "year": "2013",
        "title": "Milan Stock Exchange",
        "body": "Moncler listed in Milan in December 2013. Its shares rose 47 per cent on the first day of trading."
      },
      {
        "year": "2018",
        "title": "Genius",
        "body": "Moncler Genius launched in Milan in February, pairing the house with eight designers at once, among them Pierpaolo Piccioli, Craig Green, Simone Rocha and Palm Angels."
      },
      {
        "year": "2020",
        "title": "Stone Island",
        "body": "Moncler bought Stone Island for €1.15 billion, bringing two houses built on outerwear together."
      }
    ],
    "audience": "Moncler's first customers were factory workers and alpinists who needed to stay warm. In the 1980s Italian teenagers made it a badge of belonging. Today it is a global luxury house with revenue of more than €3 billion in 2025, yet the people who wear it still want what those first workers wanted: to be warm, and to look right doing it.",
    "meaning": "Moncler means warmth with a record behind it. Every jacket carries the memory of K2 and the Grenoble slopes, even on a city street. Its signature product began as real equipment for real conditions, and that honesty is why a Moncler down jacket still feels like the genuine article.",
    "codes": [
      {
        "name": "Down",
        "body": "The first jackets of 1954 were made for the factory floor. Everything since has grown from them."
      },
      {
        "name": "The felt badge",
        "body": "The cockerel, the M and the felt appliqué badge on the sleeve, recognised the world over."
      },
      {
        "name": "Genius",
        "body": "One house, many voices. Guest designers are invited to remake Moncler in their own image."
      }
    ],
    "sources": [
      {
        "label": "Wikipedia, Moncler",
        "url": "https://en.wikipedia.org/wiki/Moncler"
      },
      {
        "label": "Dezeen, Moncler Genius launch",
        "url": "https://www.dezeen.com/2018/02/22/moncler-genius-project-craig-green-simone-rocha-milan-fashion-week/"
      }
    ]
  },

  kith: {
    "founded": "2011",
    "origin": "New York, United States",
    "founders": "Ronnie Fieg",
    "line": "A sneaker kid from Queens who built a world around the shop.",
    "intro": "Kith opened on 11 November 2011 in New York, first in Brooklyn and then in Manhattan, as a small boutique for footwear and clothing. Its founder, Ronnie Fieg, had already spent most of his life on the shop floor, and he built Kith around everything he had learned there.",
    "founder": {
      "name": "Ronnie Fieg",
      "body": "Fieg was born in Queens in 1982 and started work at thirteen as a stock boy at David Z, his uncle's footwear chain. He rose to salesman, manager and finally head buyer. In 2007 he reworked the Asics Gel Lyte III in three colourways of 252 pairs each, The 252 Pack. They sold out within a day and made the cover of The Wall Street Journal. Four years later he opened Kith, starting with small shops at the back of Atrium stores in Brooklyn and SoHo."
    },
    "chapters": [
      {
        "year": "2011",
        "title": "Kith opens",
        "body": "The first Kith stores opened in Brooklyn and Manhattan in November, built for footwear first."
      },
      {
        "year": "2012",
        "title": "Its own clothes",
        "body": "Kith launched its own apparel line, the start of a brand in its own right rather than a shop that stocked other people's."
      },
      {
        "year": "2015",
        "title": "Kith Treats",
        "body": "The Brooklyn store was rebuilt with a cereal bar called Kith Treats and 750 white Air Jordan 2s hanging from the ceiling, turning a shop into somewhere to spend an afternoon."
      },
      {
        "year": "2016",
        "title": "The runway",
        "body": "Kith held its first show at New York Fashion Week."
      },
      {
        "year": "2020",
        "title": "Beyond fashion",
        "body": "Collaborations reached far past clothing, including a BMW M4 Competition made in just 150 examples."
      },
      {
        "year": "2022",
        "title": "The Knicks",
        "body": "Fieg became the first ever creative director of the New York Knicks."
      },
      {
        "year": "2025",
        "title": "Institution",
        "body": "Kith staged its first runway show in six years outside its rebuilt Manhattan flagship on Lafayette Street. It now runs more than 20 stores across three continents, including a London flagship with its own restaurant."
      }
    ],
    "audience": "Kith started with New York's sneaker community, the collectors who queued for Fieg's Asics releases. It grew with them into clothing, then food and hospitality, and its collaborations now reach well beyond fashion. The people who shop Kith care about the details, and they treat a release as an occasion.",
    "meaning": "Kith means taste you can trust. Fieg built it from inside the sneaker trade, and every collaboration, every store and every bowl of cereal at Kith Treats comes from the same instinct for what feels right. The name is an old English word for friends and neighbours, the kith in kith and kin, and the brand has always treated its community that way.",
    "codes": [
      {
        "name": "The collaboration",
        "body": "From The 252 Pack to cars, Kith made the partnership its signature."
      },
      {
        "name": "The shop as a destination",
        "body": "Cereal bars, restaurants and clubs. A Kith store is a place to go, not only a place to buy."
      },
      {
        "name": "New York",
        "body": "Born in Queens, raised in Brooklyn and Manhattan. The city runs through everything Kith makes."
      }
    ],
    "sources": [
      {
        "label": "Wikipedia, Ronnie Fieg",
        "url": "https://en.wikipedia.org/wiki/Ronnie_Fieg"
      },
      {
        "label": "Business of Fashion, Ronnie Fieg",
        "url": "https://www.businessoffashion.com/community/people/ronnie-fieg"
      },
      {
        "label": "Boardroom, Kith and Ronnie Fieg",
        "url": "https://boardroom.tv/?p=43403"
      }
    ]
  },

  "palm-angels": {
    founded: "2015",
    origin: "Milan, Italy",
    founders: "Francesco Ragazzi",
    line: "A photo book that became a label.",
    intro:
      "Palm Angels started with a camera. Francesco Ragazzi, then creative director at Moncler, began photographing skaters on trips to Los Angeles. The pictures became a book, and the book's name became a label.",
    chapters: [
      {
        year: "2011",
        title: "Los Angeles",
        body: "On his first trips to Los Angeles, Ragazzi began photographing the skaters of Venice and Manhattan Beach.",
      },
      {
        year: "2014",
        title: "The book",
        body: "Rizzoli published Palm Angels, 208 pages of Ragazzi's skate photography, with an introduction by Pharrell Williams.",
      },
      {
        year: "2015",
        title: "The label",
        body: "Ragazzi turned the book's name into a clothing line. The first main collection arrived for autumn/winter 2015.",
      },
      {
        year: "2018",
        title: "8 Moncler Palm Angels",
        body: "When Moncler announced Genius in Milan in February 2018, 8 Moncler Palm Angels was one of the eight original collections.",
      },
    ],
    codes: [
      { name: "Skate photography", body: "The brand's eye comes from Ragazzi's camera and the Los Angeles skate scene." },
    ],
    sources: [
      { label: "Dazed, Francesco Ragazzi and Palm Angels", url: "https://www.dazeddigital.com/fashion/article/44745/1/palm-angels-francesco-ragazzi-moncler-8-collaboration" },
      { label: "Hypebeast, Palm Angels by Francesco Ragazzi", url: "https://hypebeast.com/2014/9/palm-angels-by-francesco-ragazzi-foreword-by-pharrell-williams" },
      { label: "Dezeen, Moncler Genius launch", url: "https://www.dezeen.com/2018/02/22/moncler-genius-project-craig-green-simone-rocha-milan-fashion-week/" },
      { label: "END., 8 Moncler Palm Angels", url: "https://www.endclothing.com/it/features/8-moncler-palm-angels-the-genius-of-francesco-ragazzi" },
    ],
  },

  supreme: {
    founded: "1994",
    origin: "New York, United States",
    founders: "James Jebbia",
    line: "A skate shop on Lafayette Street.",
    intro:
      "Supreme opened in April 1994 in a former office space on Lafayette Street in Lower Manhattan. James Jebbia built the shop around skateboarders, and the clothes grew out of the shop.",
    chapters: [
      {
        year: "1994",
        title: "Lafayette Street",
        body: "The first store opened in April 1994, designed around the skaters who would use it.",
      },
      {
        year: "2020",
        title: "VF Corporation",
        body: "In December 2020 VF Corporation, owner of The North Face and Vans, bought Supreme for about $2.1 billion.",
      },
      {
        year: "2024",
        title: "EssilorLuxottica",
        body: "EssilorLuxottica bought Supreme from VF for about $1.5 billion. The deal was announced in July 2024.",
      },
    ],
    codes: [
      { name: "The box logo", body: "Red and white in Futura Heavy Oblique. It took its cue from the work of the artist Barbara Kruger, after Jebbia shared a book of her work. The very first shirts used a simpler logo." },
      { name: "Collaboration", body: "Supreme has worked with many houses over the years, Stone Island among them, across several seasons." },
    ],
    sources: [
      { label: "Wikipedia, Supreme (brand)", url: "https://en.wikipedia.org/wiki/Supreme_(brand)" },
      { label: "Highsnobiety, James Jebbia", url: "https://www.highsnobiety.com/tag/james-jebbia/" },
      { label: "Collater.al, Supreme and VF Corporation", url: "https://www.collater.al/en/supreme-vf-corporation-style/" },
      { label: "Il Post, EssilorLuxottica buys Supreme", url: "https://www.ilpost.it/2024/07/17/essilorluxottica-compra-supreme/" },
    ],
  },
};

export function storyFor(slug: string): HouseStory | undefined {
  return HOUSE_STORIES[slug];
}
