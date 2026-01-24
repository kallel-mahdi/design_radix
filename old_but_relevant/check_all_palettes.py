#!/usr/bin/env python3
"""
Check WCAG contrast ratios for all palettes - using ACTUAL HTML values
"""
import colorsys

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_luminance(r, g, b):
    def channel(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

def get_contrast_ratio(hex1, hex2):
    lum1 = get_luminance(*hex_to_rgb(hex1))
    lum2 = get_luminance(*hex_to_rgb(hex2))
    lighter, darker = max(lum1, lum2), min(lum1, lum2)
    return round((lighter + 0.05) / (darker + 0.05), 2)

def is_light_bg(bg_hex):
    lum = get_luminance(*hex_to_rgb(bg_hex))
    return lum > 0.5

def find_fixed_color(bg_hex, current_hex, target_ratio=4.5):
    """Find minimum adjustment to pass contrast while preserving hue."""
    rgb = hex_to_rgb(current_hex)
    h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)

    current_ratio = get_contrast_ratio(current_hex, bg_hex)
    if current_ratio >= target_ratio:
        return current_hex, current_ratio, int(l*100)

    light_bg = is_light_bg(bg_hex)

    if light_bg:
        # Light bg needs darker foreground
        for l_test in range(int(l*100), -1, -1):
            r, g, b = colorsys.hls_to_rgb(h, l_test/100, s)
            test_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
            ratio = get_contrast_ratio(test_hex, bg_hex)
            if ratio >= target_ratio:
                return test_hex, ratio, l_test
    else:
        # Dark bg needs lighter foreground
        for l_test in range(int(l*100), 101):
            r, g, b = colorsys.hls_to_rgb(h, l_test/100, s)
            test_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
            ratio = get_contrast_ratio(test_hex, bg_hex)
            if ratio >= target_ratio:
                return test_hex, ratio, l_test

    return None, 0, 0

# ACTUAL values from citable-color-palettes-v4.html (extracted via grep)
palettes = {
    'violet-brand': {
        'dark': {
            'bg-primary': '#0d0c12',
            'text-muted': '#726c84',
        },
        'light': {
            'bg-primary': '#faf8fd',
            'text-muted': '#8a8298',
        }
    },
    'sapphire-scholar': {
        'dark': {
            'bg-primary': '#100f0d',
            'text-muted': '#7a736a',
        },
        'light': {
            'bg-primary': '#faf8f5',
            'text-muted': '#918a7c',
        }
    },
    'teal-clarity': {
        'dark': {
            'bg-primary': '#0c1416',
            'text-muted': '#688a96',
        },
        'light': {
            'bg-primary': '#f6fcfb',
            'text-muted': '#6a9098',
            'accent-primary': '#0d9488',
        }
    },
    'slate-minimal': {
        'dark': {
            'bg-primary': '#101214',
            'text-muted': '#64646c',
            'accent-primary': '#64748b',
        },
        'light': {
            'bg-primary': '#f8fafb',
            'text-muted': '#8e8e98',
        }
    },
    'sage-academic': {
        'dark': {
            'bg-primary': '#0e100c',
            'text-muted': '#6e8066',
        },
        'light': {
            'bg-primary': '#f9faf6',
            'text-muted': '#849484',
        }
    },
    'amethyst-night': {
        'dark': {
            'bg-primary': '#0c0a10',
            'text-muted': '#6e6480',
        },
        'light': {
            'bg-primary': '#fdf8ff',
            'text-muted': '#888090',
            'accent-primary': '#a855f7',
        }
    },
    'aurora-research': {
        'light': {
            'bg-primary': '#f6f8fc',
            'text-muted': '#7c8898',
            'accent-primary': '#0284c7',
        }
    },
    'coffee-craft': {
        'dark': {
            'bg-primary': '#100e0c',
            'text-muted': '#7c7264',
        },
        'light': {
            'bg-primary': '#fffcf8',
            'text-muted': '#948878',
        }
    },
}

print("=" * 70)
print("WCAG CONTRAST CHECK - All remaining palettes")
print("Target: 4.5:1 minimum (AA level)")
print("=" * 70)
print()

all_fixes = []

for palette_name, modes in palettes.items():
    for mode, colors in modes.items():
        bg = colors['bg-primary']

        for prop in ['text-muted', 'accent-primary']:
            if prop not in colors:
                continue

            current = colors[prop]
            ratio = get_contrast_ratio(current, bg)
            rgb = hex_to_rgb(current)
            h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)

            status = "PASS" if ratio >= 4.5 else "FAIL"
            print(f"{palette_name} ({mode}) - {prop}:")
            print(f"  {current} -> {ratio}:1 [{status}]")

            if ratio < 4.5:
                fixed, new_ratio, new_l = find_fixed_color(bg, current)
                print(f"  FIX: {fixed} -> {new_ratio}:1")

                all_fixes.append({
                    'palette': palette_name,
                    'mode': mode,
                    'prop': prop,
                    'old': current,
                    'new': fixed,
                    'ratio': new_ratio
                })
            print()

print("=" * 70)
print(f"FIXES NEEDED: {len(all_fixes)}")
print("=" * 70)
print()

for fix in all_fixes:
    print(f"// {fix['palette']} ({fix['mode']})")
    print(f"'{fix['prop']}': '{fix['new']}',  // Fixed from {fix['old']} ({fix['ratio']}:1)")
    print()
