import { HOUSES } from "@/lib/brands";

export type Cubby = {
  id: string;
  /** Percent of the photograph, origin top-left. */
  x: number;
  y: number;
  w: number;
  h: number;
  slug?: string;
};

/**
 * Openings measured on the Stüssy Milan photograph (800×534).
 * Shelf lights sit on y 71, 147, 223, 298 and 376. Two frontal columns
 * each side, pitch about 80px. The curved returns and the oak jambs are
 * not openings, so they stay off this list. The top row is the cropped
 * cubbies above the first light. The bottom row ends where the floor rises.
 */
const COLUMNS = [
  { x: 6, w: 6.5 },
  { x: 16, w: 6.5 },
  { x: 77, w: 6.5 },
  { x: 87, w: 6.5 },
];

const ROWS = [
  { y: 0.75, h: 11.99 },
  { y: 13.3, h: 11.8 },
  { y: 27.53, h: 11.42 },
  { y: 41.76, h: 10.67 },
  { y: 55.81, h: 12.73 },
  { y: 70.41, h: 12.73 },
];

function build(): Cubby[] {
  const cubbies: Cubby[] = [];
  let n = 0;
  const place = (columns: typeof COLUMNS) => {
    for (const row of ROWS) {
      for (const column of columns) {
        const house = HOUSES[n];
        cubbies.push({
          id: `cubby-${n + 1}`,
          x: column.x,
          y: row.y,
          w: column.w,
          h: row.h,
          slug: house?.slug,
        });
        n += 1;
      }
    }
  };
  place(COLUMNS.slice(0, 2));
  place(COLUMNS.slice(2));
  return cubbies;
}

export const CUBBIES: Cubby[] = build();
