// Fallback tile colors for projects without an image. Shared by the UI and the OG images
// so a project keeps the same color everywhere.
const TILES: [string, string][] = [
  ["#336021", "#213f15"], // forest
  ["#e68c3a", "#b8661f"], // ember
  ["#4f7a3a", "#335226"], // moss
  ["#6b7f2a", "#4a5a1a"], // olive
  ["#b4532a", "#7f3519"], // rust
  ["#2f5d62", "#1d3d41"], // pine
];

export const tileColors = (name: string) => TILES[[...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % TILES.length];

export const tileGradient = (name: string) => {
  const [from, to] = tileColors(name);
  return `linear-gradient(135deg, ${from}, ${to})`;
};
