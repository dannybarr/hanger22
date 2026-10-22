export type House = {
  slug: string;
  name: string;
  file: string;
  source: string;
};

/**
 * Houses on the Brand Story wall.
 * Piece brands first, then the grail houses named for the edit, then the
 * rest of the wall. Kapital and Chrome Hearts have no official mark on file.
 */
export const HOUSES: House[] = [
  {
    slug: "stone-island",
    name: "Stone Island",
    file: "stone-island.svg",
    source: "https://commons.wikimedia.org/wiki/File:Stone-Island-Logo.svg",
  },
  {
    slug: "moncler",
    name: "Moncler",
    file: "moncler.svg",
    source: "https://commons.wikimedia.org/wiki/File:Logo_Moncler_Group.svg",
  },
  {
    slug: "palm-angels",
    name: "Palm Angels",
    file: "palm-angels.svg",
    source: "https://commons.wikimedia.org/wiki/File:Palm_Angels_logo.svg",
  },
  {
    slug: "supreme",
    name: "Supreme",
    file: "supreme.svg",
    source: "https://commons.wikimedia.org/wiki/File:Supreme_Logo.svg",
  },
  {
    slug: "palace",
    name: "Palace",
    file: "palace.jpg",
    source: "https://commons.wikimedia.org/wiki/File:Palace_Logo.jpg",
  },
  {
    slug: "louis-vuitton",
    name: "Louis Vuitton",
    file: "louis-vuitton.svg",
    source: "https://commons.wikimedia.org/wiki/File:Louis_Vuitton_logo_and_wordmark.svg",
  },
  {
    slug: "oakley",
    name: "Oakley",
    file: "oakley.svg",
    source: "https://commons.wikimedia.org/wiki/File:Oakley_logo.svg",
  },
  {
    slug: "omega",
    name: "Omega",
    file: "omega.svg",
    source: "https://commons.wikimedia.org/wiki/File:Omega_Logo.svg",
  },
  {
    slug: "rolex",
    name: "Rolex",
    file: "rolex.svg",
    source: "https://commons.wikimedia.org/wiki/File:Rolex_wordmark_logo.svg",
  },
  {
    slug: "dior",
    name: "Dior",
    file: "dior.svg",
    source: "https://commons.wikimedia.org/wiki/File:Dior_Logo_2022.svg",
  },
  {
    slug: "bape",
    name: "A Bathing Ape",
    file: "bape.svg",
    source: "https://jp.bape.com/cdn/shop/t/29/assets/iconit.css",
  },
  {
    slug: "audemars-piguet",
    name: "Audemars Piguet",
    file: "audemars-piguet.png",
    source: "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_logo.png",
  },
  {
    slug: "nike",
    name: "Nike",
    file: "nike.svg",
    source: "https://commons.wikimedia.org/wiki/File:Logo_NIKE.svg",
  },
  {
    slug: "prada",
    name: "Prada",
    file: "prada.svg",
    source: "https://commons.wikimedia.org/wiki/File:Prada-Logo.svg",
  },
  {
    slug: "comme-des-garcons",
    name: "Comme des Garçons",
    file: "comme-des-garcons.svg",
    source: "https://commons.wikimedia.org/wiki/File:Comme_des_Garcons_logo.svg",
  },
  {
    slug: "hermes",
    name: "Hermès",
    file: "hermes.svg",
    source: "https://commons.wikimedia.org/wiki/File:Hermes_wordmark.svg",
  },
  {
    slug: "saint-laurent",
    name: "Saint Laurent",
    file: "saint-laurent.svg",
    source: "https://commons.wikimedia.org/wiki/File:Saint_Laurent_Paris_SVG_Logo.svg",
  },
  {
    slug: "loewe",
    name: "Loewe",
    file: "loewe.svg",
    source: "https://commons.wikimedia.org/wiki/File:Loewe_logo.svg",
  },
  {
    slug: "celine",
    name: "Celine",
    file: "celine.svg",
    source: "https://commons.wikimedia.org/wiki/File:Celine_logo.svg",
  },
  {
    slug: "gucci",
    name: "Gucci",
    file: "gucci.svg",
    source: "https://commons.wikimedia.org/wiki/File:Gucci_logo.svg",
  },
  {
    slug: "balenciaga",
    name: "Balenciaga",
    file: "balenciaga.svg",
    source: "https://commons.wikimedia.org/wiki/File:Balenciaga_Logo.svg",
  },
  {
    slug: "chanel",
    name: "Chanel",
    file: "chanel.svg",
    source: "https://commons.wikimedia.org/wiki/File:Chanel_logo.svg",
  },
  {
    slug: "the-north-face",
    name: "The North Face",
    file: "the-north-face.svg",
    source: "https://commons.wikimedia.org/wiki/File:The_North_Face_logo.svg",
  },
  {
    slug: "off-white",
    name: "Off-White",
    file: "off-white.svg",
    source: "https://commons.wikimedia.org/wiki/File:Off-White_Logo.svg",
  },
  {
    slug: "adidas",
    name: "Adidas",
    file: "adidas.svg",
    source: "https://commons.wikimedia.org/wiki/File:Adidas_2022_logo.svg",
  },
  {
    slug: "new-balance",
    name: "New Balance",
    file: "new-balance.svg",
    source: "https://commons.wikimedia.org/wiki/File:New_Balance_logo.svg",
  },
  {
    slug: "salomon",
    name: "Salomon",
    file: "salomon.svg",
    source: "https://commons.wikimedia.org/wiki/File:Salomon_logo_2022.svg",
  },
  {
    slug: "maison-margiela",
    name: "Maison Margiela",
    file: "maison-margiela.svg",
    source: "https://commons.wikimedia.org/wiki/File:Maison_Margiela_logo.svg",
  },
  {
    slug: "stussy",
    name: "Stüssy",
    file: "stussy.svg",
    source: "https://commons.wikimedia.org/wiki/File:Stussy-1.svg",
  },
  {
    slug: "kith",
    name: "Kith",
    file: "kith.svg",
    source: "https://commons.wikimedia.org/wiki/File:Kith_brand_logo.svg",
  },
  {
    slug: "acne-studios",
    name: "Acne Studios",
    file: "acne-studios.svg",
    source: "https://commons.wikimedia.org/wiki/File:Acne_studios_logo,_2021.svg",
  },
  {
    slug: "visvim",
    name: "Visvim",
    file: "visvim.svg",
    source: "https://commons.wikimedia.org/wiki/File:Visvim_logo.svg",
  },
];

export function getHouse(slug: string) {
  return HOUSES.find((house) => house.slug === slug);
}
