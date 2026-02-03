import * as colors from "@radix-ui/colors";

const targets = {
  light: {
    primary: "#3A6D90",
    secondary: "#2A5270",
    tint: "#E3EDF4",
    light: "#D0E0EC",
  },
  dark: {
    primary: "#5A9FD4",
    secondary: "#7FBAE8",
    tint: rgbaComposite("#000000", [90, 159, 212, 0.15]),
    light: rgbaComposite("#000000", [90, 159, 212, 0.25]),
  },
};

const roleSteps = {
  primary: [9, 10],
  secondary: [9, 10],
  tint: [3, 4],
  light: [4, 5],
  text: [11, 12],
};

const candidateScales = ["sky", "blue", "cyan", "indigo", "slate"];

function rgbaComposite(bgHex, rgba) {
  const bg = hexToRgb(bgHex);
  const [r, g, b, a] = rgba;
  const comp = {
    r: Math.round(r * a + bg.r * (1 - a)),
    g: Math.round(g * a + bg.g * (1 - a)),
    b: Math.round(b * a + bg.b * (1 - a)),
  };
  return rgbToHex(comp);
}

function hexToRgb(hex) {
  const cleaned = hex.replace("#", "");
  const n = parseInt(cleaned, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function rgbToHex({ r, g, b }) {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  ).toUpperCase();
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToXyz({ r, g, b }) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  return {
    x: rl * 0.4124 + gl * 0.3576 + bl * 0.1805,
    y: rl * 0.2126 + gl * 0.7152 + bl * 0.0722,
    z: rl * 0.0193 + gl * 0.1192 + bl * 0.9505,
  };
}

function xyzToLab({ x, y, z }) {
  const refX = 0.95047;
  const refY = 1.0;
  const refZ = 1.08883;

  let fx = x / refX;
  let fy = y / refY;
  let fz = z / refZ;

  fx = fx > 0.008856 ? Math.cbrt(fx) : 7.787 * fx + 16 / 116;
  fy = fy > 0.008856 ? Math.cbrt(fy) : 7.787 * fy + 16 / 116;
  fz = fz > 0.008856 ? Math.cbrt(fz) : 7.787 * fz + 16 / 116;

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function hexToLab(hex) {
  return xyzToLab(rgbToXyz(hexToRgb(hex)));
}

function deltaE(lab1, lab2) {
  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

function getScaleSteps(scaleName, isDark) {
  const key = isDark ? `${scaleName}Dark` : scaleName;
  const scale = colors[key];
  if (!scale) return null;
  const steps = {};
  for (let i = 1; i <= 12; i += 1) {
    steps[i] = scale[`${scaleName}${i}`];
  }
  return steps;
}

function findClosest(scaleName, isDark, role, targetHex) {
  const steps = getScaleSteps(scaleName, isDark);
  if (!steps) return null;

  const allowed = roleSteps[role];
  const targetLab = hexToLab(targetHex);
  let best = null;

  for (const step of allowed) {
    const hex = steps[step];
    const lab = hexToLab(hex);
    const d = deltaE(targetLab, lab);
    if (!best || d < best.delta) {
      best = { step, hex, delta: d };
    }
  }

  return best;
}

function run(mode) {
  const isDark = mode === "dark";
  const t = targets[mode];
  const roles = ["primary", "secondary", "tint", "light", "text"];

  console.log(`\n${mode.toUpperCase()} TARGETS`);
  console.log(t);

  const scaleTotals = new Map();

  for (const role of roles) {
    const target = t[role] || t.primary;
    console.log(`\nRole: ${role}  (target ${target})`);
    const results = candidateScales
      .map((scale) => {
        const best = findClosest(scale, isDark, role, target);
        if (!best) return null;
        return { scale, ...best };
      })
      .filter(Boolean)
      .sort((a, b) => a.delta - b.delta);

    for (const r of results.slice(0, 5)) {
      console.log(
        `  ${r.scale}-${r.step}  ${r.hex}  ΔE=${r.delta.toFixed(2)}`
      );
      const current = scaleTotals.get(r.scale) ?? 0;
      if (roleSteps[role].includes(r.step)) {
        scaleTotals.set(r.scale, current + r.delta);
      }
    }
  }

  const totals = [...scaleTotals.entries()].sort((a, b) => a[1] - b[1]);
  console.log("\nBest overall scales (lower total ΔE is better):");
  for (const [scale, total] of totals) {
    console.log(`  ${scale}  total ΔE=${total.toFixed(2)}`);
  }
}

run("light");
run("dark");
