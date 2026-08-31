import { oklchToHex, contrast, maxChroma } from "./color.mjs";

const H = 264;
const ok = (L, C, h = H) => oklchToHex(L, Math.min(C, maxChroma(L, h)), h);

// ---- ramps (chroma already gamut-clamped by ok()) -------------------------
const brand = {
  50: ok(0.973, 0.013), 100: ok(0.941, 0.028), 200: ok(0.892, 0.052),
  300: ok(0.824, 0.087), 400: ok(0.726, 0.142), 500: ok(0.606, 0.204),
  600: ok(0.491, 0.215), 700: ok(0.428, 0.192), 800: ok(0.372, 0.157),
  900: ok(0.322, 0.124), 950: ok(0.232, 0.086),
};
const n = {
  0: ok(1, 0), 50: ok(0.98, 0.003), 100: ok(0.962, 0.005), 200: ok(0.923, 0.008),
  300: ok(0.869, 0.011), 400: ok(0.78, 0.014), 500: ok(0.665, 0.016),
  600: ok(0.530, 0.018), 700: ok(0.452, 0.019), 800: ok(0.352, 0.021),
  900: ok(0.262, 0.022), 950: ok(0.212, 0.022), 975: ok(0.165, 0.021), 1000: ok(0.132, 0.02),
};
const danger  = { 50: ok(0.965,0.017,25.5), 100: ok(0.93,0.035,25.5), 200: ok(0.878,0.065,25.5), 400: ok(0.70,0.17,25.5), 500: ok(0.606,0.213,25.5), 600: ok(0.531,0.207,25.5), 700: ok(0.455,0.176,25.5), 900: ok(0.33,0.115,25.5), 950: ok(0.235,0.078,25.5) };
const success = { 50: ok(0.968,0.018,155), 100: ok(0.936,0.042,155), 200: ok(0.885,0.076,155), 400: ok(0.72,0.14,155), 500: ok(0.635,0.14,155), 600: ok(0.545,0.124,155), 700: ok(0.462,0.104,155), 900: ok(0.338,0.07,155), 950: ok(0.24,0.05,155) };
const warning = { 50: ok(0.975,0.02,75), 100: ok(0.947,0.043,75), 200: ok(0.90,0.084,75), 400: ok(0.79,0.165,75), 500: ok(0.725,0.153,75), 600: ok(0.63,0.133,75), 700: ok(0.52,0.11,75), 900: ok(0.38,0.078,75), 950: ok(0.265,0.055,75) };
const info    = { 50: ok(0.97,0.016,220), 100: ok(0.94,0.036,220), 200: ok(0.892,0.064,220), 400: ok(0.728,0.132,220), 500: ok(0.64,0.117,220), 600: ok(0.55,0.10,220), 700: ok(0.47,0.086,220), 900: ok(0.342,0.063,220), 950: ok(0.243,0.046,220) };

const light = {
  background: n[0], foreground: n[900],
  card: n[0], "card-foreground": n[900],
  popover: n[0], "popover-foreground": n[900],
  "surface-subtle": n[50], "surface-muted": n[100],
  primary: brand[600], "primary-foreground": n[0], "primary-hover": brand[700],
  secondary: brand[50], "secondary-foreground": brand[800],
  muted: n[100], "muted-foreground": n[600],
  accent: brand[100], "accent-foreground": brand[700],
  destructive: danger[600], "destructive-foreground": n[0], "destructive-subtle": danger[50], "destructive-subtle-foreground": danger[700],
  success: success[600], "success-foreground": n[0], "success-subtle": success[50], "success-subtle-foreground": success[700],
  warning: warning[500], "warning-foreground": warning[950], "warning-subtle": warning[50], "warning-subtle-foreground": warning[700],
  info: info[600], "info-foreground": n[0], "info-subtle": info[50], "info-subtle-foreground": info[700],
  border: n[200], "border-strong": n[500], input: n[500], ring: brand[600],
  sidebar: n[50], "sidebar-foreground": n[700], "sidebar-accent": brand[100],
  "sidebar-accent-foreground": brand[700], "sidebar-border": n[200],
};
const dark = {
  background: n[975], foreground: ok(0.968, 0.004),
  card: n[950], "card-foreground": ok(0.968, 0.004),
  popover: ok(0.242, 0.022), "popover-foreground": ok(0.968, 0.004),
  "surface-subtle": n[1000], "surface-muted": ok(0.272, 0.021),
  primary: brand[400], "primary-foreground": brand[950], "primary-hover": brand[300],
  secondary: ok(0.272, 0.021), "secondary-foreground": ok(0.968, 0.004),
  muted: ok(0.272, 0.021), "muted-foreground": ok(0.74, 0.017),
  accent: ok(0.30, 0.045), "accent-foreground": brand[300],
  destructive: danger[400], "destructive-foreground": danger[950], "destructive-subtle": ok(0.30,0.06,25.5), "destructive-subtle-foreground": danger[200],
  success: success[500], "success-foreground": success[950], "success-subtle": ok(0.30,0.05,155), "success-subtle-foreground": success[200],
  warning: warning[400], "warning-foreground": warning[950], "warning-subtle": ok(0.30,0.055,75), "warning-subtle-foreground": warning[200],
  info: info[400], "info-foreground": info[950], "info-subtle": ok(0.30,0.045,220), "info-subtle-foreground": info[200],
  border: ok(0.32, 0.02), "border-strong": ok(0.535, 0.02), input: ok(0.535, 0.02), ring: brand[400],
  sidebar: n[950], "sidebar-foreground": ok(0.78, 0.016),
  "sidebar-accent": ok(0.32, 0.055), "sidebar-accent-foreground": brand[300], "sidebar-border": ok(0.31, 0.02),
};

// fg-on-bg pairs that must meet AA (4.5 body text / 3.0 large text & UI boundaries)
const textPairs = [
  ["foreground", "background", 4.5], ["muted-foreground", "background", 4.5],
  ["card-foreground", "card", 4.5], ["popover-foreground", "popover", 4.5],
  ["muted-foreground", "muted", 4.5], ["muted-foreground", "surface-subtle", 4.5],
  ["primary-foreground", "primary", 4.5], ["primary-foreground", "primary-hover", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["primary", "background", 4.5], ["primary", "card", 4.5],
  ["destructive-foreground", "destructive", 4.5], ["destructive", "background", 4.5],
  ["destructive-subtle-foreground", "destructive-subtle", 4.5],
  ["success-foreground", "success", 4.5], ["success-subtle-foreground", "success-subtle", 4.5],
  ["warning-foreground", "warning", 4.5], ["warning-subtle-foreground", "warning-subtle", 4.5],
  ["info-foreground", "info", 4.5], ["info-subtle-foreground", "info-subtle", 4.5],
  ["sidebar-foreground", "sidebar", 4.5],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5],
  // non-text / UI boundary (WCAG 1.4.11 -> 3:1)
  ["input", "background", 3.0], ["input", "card", 3.0],
  ["border-strong", "background", 3.0],
  ["ring", "background", 3.0], ["ring", "card", 3.0],
  ["primary", "primary-foreground", 3.0],
];

let fails = 0;
for (const [name, T] of [["LIGHT", light], ["DARK", dark]]) {
  console.log(`\n================ ${name} ================`);
  for (const [fg, bg, min] of textPairs) {
    const c = contrast(T[fg], T[bg]);
    const pass = c >= min;
    if (!pass) fails++;
    console.log(
      (pass ? "  ok  " : "  FAIL") +
      ` ${fg} on ${bg}`.padEnd(52) +
      `${T[fg]} / ${T[bg]}  ${c.toFixed(2)} (need ${min})`
    );
  }
}
console.log(`\n${fails} failing pair(s).`);

// emit the CSS-ready oklch values
const dump = (label, spec) => { console.log(`\n/* ${label} */`); for (const [k,v] of Object.entries(spec)) console.log(`  --${k}: ${v};`); };
if (process.argv.includes("--hex")) { dump("light", light); dump("dark", dark); }
