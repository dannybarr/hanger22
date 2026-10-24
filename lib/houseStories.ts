/**
 * The long-form story of each house. Every line must trace to a source in the
 * house's `sources` list. A house without an entry shows a short page instead,
 * so nothing is written from memory.
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
  chapters: Chapter[];
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
      "Stone Island began with a lorry tarpaulin. Massimo Osti, already running C.P. Company, studied a heavy canvas that was a different colour on each side and stone-washed it until it softened. The cloth became Tela Stella, and seven outerwear pieces cut from it became the first Stone Island collection.",
    chapters: [
      {
        year: "1982",
        title: "Seven jackets and a badge",
        body: "The first collection was seven pieces of outerwear in Tela Stella. The first jacket carried a compass on a fabric badge, a nod to where the cloth came from and where the house meant to go. The name came from the novels of Joseph Conrad.",
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

  moncler: {
    founded: "1952",
    origin: "Monestier-de-Clermont, France",
    founders: "René Ramillon and André Vincent",
    line: "From the mountain to the city, in down.",
    intro:
      "Moncler takes its name from the village where it began, Monestier-de-Clermont, in the mountains near Grenoble. René Ramillon and André Vincent started out making quilted sleeping bags, tents and padded jackets for people who worked in the cold.",
    chapters: [
      {
        year: "1952",
        title: "A village name",
        body: "Ramillon and Vincent founded the company in Monestier-de-Clermont. The early line was practical: sleeping bags, tents and quilted jackets for mountain workers.",
      },
      {
        year: "1954",
        title: "Terray and K2",
        body: "The mountaineer Lionel Terray saw what the jackets could do and helped shape a specialist line made for him. That same year Moncler equipped the Italian expedition to K2, which Achille Compagnoni and Lino Lacedelli summited.",
      },
      {
        year: "1968",
        title: "Grenoble",
        body: "At the Grenoble Winter Olympics, Moncler was the official supplier to the French downhill ski team.",
      },
      {
        year: "2003",
        title: "Ruffini",
        body: "Remo Ruffini acquired the company and began to reposition it, keeping the down jacket at the centre while taking the house into the city.",
      },
      {
        year: "2018",
        title: "Genius",
        body: "In February 2018 Moncler unveiled Genius in Milan: eight collections by different designers, each reinterpreting the house. Among them were Craig Green, Simone Rocha and Palm Angels.",
      },
    ],
    codes: [
      { name: "Down", body: "Moncler dates its first nylon down jacket to 1954. Everything since has grown from it." },
      { name: "The mountain", body: "Expeditions and an Olympic team before fashion. The technical story is the brand story." },
      { name: "Genius", body: "One house, many voices. Guest designers are invited to remake Moncler in their own image." },
    ],
    sources: [
      { label: "Moncler Group, History", url: "https://www.monclergroup.com/en/moncler/history" },
      { label: "Moncler Annual Report 2020", url: "https://www.monclergroup.com/investor-relations/Moncler-Annual-report-2020-DEF/24-Moncler-Annual-report-2020.html" },
      { label: "Dezeen, Moncler Genius launch", url: "https://www.dezeen.com/2018/02/22/moncler-genius-project-craig-green-simone-rocha-milan-fashion-week/" },
      { label: "Wikipedia, Moncler", url: "https://en.wikipedia.org/wiki/Moncler" },
    ],
  },

  "palm-angels": {
    founded: "2015",
    origin: "Milan, Italy",
    founders: "Francesco Ragazzi",
    line: "A photo book that became a label.",
    intro:
      "Palm Angels started with a camera. Francesco Ragazzi, then art director at Moncler, began photographing skaters on trips to Los Angeles. The pictures became a book, and the book's name became a label.",
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
        body: "When Moncler launched Genius in February 2018, Palm Angels was one of the eight original collections. The Moncler logo was reworked with a palm tree and angel wings.",
      },
    ],
    codes: [
      { name: "Skate photography", body: "The brand's eye comes from Ragazzi's camera and the Los Angeles skate scene." },
      { name: "The palm and the wings", body: "Symbols that turn up across the line, including on its Moncler work." },
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
      "Supreme opened in April 1994 in a former office space on Lafayette Street in Lower Manhattan. James Jebbia, who had worked at Union and Stüssy, built the shop around skateboarders, and the clothes grew out of the shop.",
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
        body: "EssilorLuxottica agreed to buy Supreme from VF for about $1.5 billion. The deal was announced in July 2024.",
      },
    ],
    codes: [
      { name: "The box logo", body: "Red and white in Futura Heavy Oblique. It took its cue from the work of the artist Barbara Kruger, after Jebbia shared a book of her work. The very first shirts used a simpler logo." },
      { name: "Collaboration", body: "Supreme has worked with other houses, Stone Island among them. Pieces that carry both names are the kind we hunt for." },
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
