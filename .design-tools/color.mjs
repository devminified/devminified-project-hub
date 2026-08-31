// oklch <-> sRGB + WCAG contrast helpers (no deps).
const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function oklchToLinearSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const gamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const degamma = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

export function oklchToHex(L, C, h) {
  const [r, g, b] = oklchToLinearSrgb(L, C, h).map((v) => clamp01(gamma(v)));
  return "#" + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}
export function inGamut(L, C, h) {
  return oklchToLinearSrgb(L, C, h).every((v) => v >= -0.0005 && v <= 1.0005);
}
export function hexToRgb(hex) {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
}
export function linearSrgbToOklch([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.hypot(A, B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, C, h];
}
export function hexToOklch(hex) {
  return linearSrgbToOklch(hexToRgb(hex).map(degamma));
}
export function relLum(hex) {
  const [r, g, b] = hexToRgb(hex).map(degamma);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const l1 = relLum(a), l2 = relLum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
// Largest chroma that stays in sRGB gamut for a given L,h.
export function maxChroma(L, h) {
  let lo = 0, hi = 0.42;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, h)) lo = mid; else hi = mid;
  }
  return lo;
}
