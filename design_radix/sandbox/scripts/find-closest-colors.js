/**
 * Find closest Radix colors to original design_mahdi palette
 * Run with: node scripts/find-closest-colors.js
 */

// Original design_mahdi "Balanced" palette - Bibliography
const originalColors = {
  // Light mode
  'biblio': '#3A6D90',        // Main accent
  'biblio-strong': '#2A5270', // Darker variant
  'biblio-tint': '#E3EDF4',   // Light background
  'biblio-light': '#D0E0EC',  // Slightly darker tint

  // Dark mode
  'biblio-dark': '#5A9FD4',
  'biblio-strong-dark': '#7FBAE8',
};

// Radix Blue scale (light mode) - from @radix-ui/colors
const radixBlue = {
  'blue-1': '#fbfdff',
  'blue-2': '#f4faff',
  'blue-3': '#e6f4fe',
  'blue-4': '#d5efff',
  'blue-5': '#c2e5ff',
  'blue-6': '#acd8fc',
  'blue-7': '#8ec8f6',
  'blue-8': '#5eb1ef',
  'blue-9': '#0090ff',
  'blue-10': '#0588f0',
  'blue-11': '#0d74ce',
  'blue-12': '#113264',
};

// Radix Blue scale (dark mode)
const radixBlueDark = {
  'blue-1': '#0d1520',
  'blue-2': '#111927',
  'blue-3': '#0d2847',
  'blue-4': '#003362',
  'blue-5': '#004074',
  'blue-6': '#104d87',
  'blue-7': '#205d9e',
  'blue-8': '#2870bd',
  'blue-9': '#0090ff',
  'blue-10': '#3b9eff',
  'blue-11': '#70b8ff',
  'blue-12': '#c2e6ff',
};

// Radix Cyan scale (alternative for steel blue)
const radixCyan = {
  'cyan-1': '#fafdfe',
  'cyan-2': '#f2fafb',
  'cyan-3': '#def7f9',
  'cyan-4': '#caf1f6',
  'cyan-5': '#b5e9f0',
  'cyan-6': '#9ddde7',
  'cyan-7': '#7dcedc',
  'cyan-8': '#3db9cf',
  'cyan-9': '#00a2c7',
  'cyan-10': '#0797b9',
  'cyan-11': '#107d98',
  'cyan-12': '#0d3c48',
};

// Radix Sky scale (another blue alternative)
const radixSky = {
  'sky-1': '#f9feff',
  'sky-2': '#f1fafd',
  'sky-3': '#e1f6fd',
  'sky-4': '#d1f0fa',
  'sky-5': '#bee7f5',
  'sky-6': '#a9daed',
  'sky-7': '#8dcae3',
  'sky-8': '#60b3d7',
  'sky-9': '#7ce2fe',
  'sky-10': '#74daf8',
  'sky-11': '#00749e',
  'sky-12': '#1d3e56',
};

// Radix Slate scale (blue-gray)
const radixSlate = {
  'slate-11': '#60646c',
  'slate-12': '#1c2024',
};

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Calculate color distance (Delta E approximation using RGB)
function colorDistance(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Weighted Euclidean distance (human eye is more sensitive to green)
  const rMean = (rgb1.r + rgb2.r) / 2;
  const dR = rgb1.r - rgb2.r;
  const dG = rgb1.g - rgb2.g;
  const dB = rgb1.b - rgb2.b;

  return Math.sqrt(
    (2 + rMean/256) * dR*dR +
    4 * dG*dG +
    (2 + (255-rMean)/256) * dB*dB
  );
}

// Find closest colors from a scale
function findClosest(targetHex, scale, topN = 3) {
  const distances = Object.entries(scale).map(([name, hex]) => ({
    name,
    hex,
    distance: colorDistance(targetHex, hex),
    hsl: rgbToHsl(...Object.values(hexToRgb(hex)))
  }));

  return distances.sort((a, b) => a.distance - b.distance).slice(0, topN);
}

// Main analysis
console.log('='.repeat(70));
console.log('BIBLIOGRAPHY COLOR ANALYSIS');
console.log('Finding closest Radix colors to original design_mahdi palette');
console.log('='.repeat(70));
console.log();

for (const [name, hex] of Object.entries(originalColors)) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`ORIGINAL: ${name}`);
  console.log(`  Hex: ${hex}`);
  console.log(`  RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  console.log(`  HSL: hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`);
  console.log();

  // Check multiple scales
  const scales = [
    { name: 'Blue', colors: name.includes('dark') ? radixBlueDark : radixBlue },
    { name: 'Cyan', colors: radixCyan },
    { name: 'Sky', colors: radixSky },
  ];

  for (const scale of scales) {
    const closest = findClosest(hex, scale.colors);
    console.log(`  Closest in Radix ${scale.name}:`);
    closest.forEach((match, i) => {
      const matchRgb = hexToRgb(match.hex);
      console.log(`    ${i+1}. ${match.name}: ${match.hex}`);
      console.log(`       HSL: hsl(${match.hsl.h}°, ${match.hsl.s}%, ${match.hsl.l}%)`);
      console.log(`       Distance: ${match.distance.toFixed(2)}`);
    });
    console.log();
  }
}

// Summary recommendations
console.log('\n' + '='.repeat(70));
console.log('RECOMMENDATIONS');
console.log('='.repeat(70));
console.log(`
Original biblio (#3A6D90) is HSL(205°, 42%, 40%) - a DESATURATED steel blue.

Radix Blue scale is more saturated:
- blue-11 (#0d74ce) is HSL(209°, 89%, 43%) - TOO SATURATED
- blue-12 (#113264) is HSL(214°, 72%, 23%) - Too dark

Options:
1. Use color-mix() to desaturate:
   color-mix(in oklch, var(--blue-11) 60%, var(--sand-11))

2. Try Radix Cyan or Sky scales (closer hue to 205°):
   - cyan-11 (#107d98) is HSL(192°, 81%, 33%) - Different hue but similar feel
   - sky-11 (#00749e) is HSL(196°, 100%, 31%) - Closer hue

3. Accept slight difference and use blue-11 with reduced opacity:
   color-mix(in srgb, var(--blue-11) 70%, transparent)

For tints (biblio-tint #E3EDF4):
- blue-3 (#e6f4fe) is very close!
- cyan-3 (#def7f9) is also close

For dark mode biblio (#5A9FD4):
- blue-10 (#3b9eff) in dark mode is closest
- Or use blue-11 dark (#70b8ff)
`);
