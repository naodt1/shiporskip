// Fallback tile colors for projects without an image. Shared by the UI and the OG images
// so a project keeps the same color everywhere.
const TILES: [string, string][] = [
  ["#2f7a4a", "#1d5233"],
  ["#3b5bdb", "#2541a8"],
  ["#b0561f", "#7f3a12"],
  ["#7048e8", "#4c2bb3"],
  ["#c2255c", "#8a1640"],
  ["#0c8599", "#08606f"],
];

export const tileColors = (name: string) => TILES[[...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % TILES.length];

export const tileGradient = (name: string) => {
  const [from, to] = tileColors(name);
  return `linear-gradient(135deg, ${from}, ${to})`;
};
