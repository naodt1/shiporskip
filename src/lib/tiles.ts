// Fallback tile colors for projects without an image. Shared by the UI and the OG images
// so a project keeps the same color everywhere.
const TILES: [string, string][] = [
  ["#f8f9fa", "#eaecf0"], // paper
  ["#eaf3ff", "#d5e3fb"], // pale blue
  ["#eaecf0", "#dde1e6"], // grey
  ["#eef1f6", "#dfe4ec"], // slate
];

/** Letter color on a tile. */
export const TILE_TEXT = "#54595d";

export const tileColors = (name: string) => TILES[[...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % TILES.length];

export const tileGradient = (name: string) => {
  const [from, to] = tileColors(name);
  return `linear-gradient(135deg, ${from}, ${to})`;
};
