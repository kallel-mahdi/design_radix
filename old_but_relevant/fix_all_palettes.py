#!/usr/bin/env python3
"""
Calculate fixes for all failing WCAG contrast ratios
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
    """Determine if background is light (need darker text) or dark (need lighter text)"""
    lum = get_luminance(*hex_to_rgb(bg_hex))
    return lum > 0.5

def find_fixed_color(bg_hex, current_hex, target_ratio=4.5):
    """Find minimum adjustment to pass contrast."""
    rgb = hex_to_rgb(current_hex)
    h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)

    current_ratio = get_contrast_ratio(current_hex, bg_hex)
    if current_ratio >= target_ratio:
        return current_hex, current_ratio

    light_bg = is_light_bg(bg_hex)

    if light_bg:
        # Dark background needs lighter foreground, light bg needs darker
        # For light bg, decrease lightness
        for l_test in range(int(l*100), -1, -1):
            r, g, b = colorsys.hls_to_rgb(h, l_test/100, s)
            test_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
            ratio = get_contrast_ratio(test_hex, bg_hex)
            if ratio >= target_ratio:
                return test_hex, ratio
    else:
        # For dark bg, increase lightness
        for l_test in range(int(l*100), 101):
            r, g, b = colorsys.hls_to_rgb(h, l_test/100, s)
            test_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
            ratio = get_contrast_ratio(test_hex, bg_hex)
            if ratio >= target_ratio:
                return test_hex, ratio

    return None, 0

# All failures from the check
failures = [
    ('indigo-focus', 'dark', 'text-muted', '#6b6d80', '#0f1016'),
    ('indigo-focus', 'dark', 'accent-primary', '#6366f1', '#0f1016'),
    ('indigo-focus', 'light', 'text-muted', '#7c7e90', '#f8f9fc'),
    ('violet-brand', 'dark', 'text-muted', '#7c6d8c', '#100c14'),
    ('violet-brand', 'light', 'text-muted', '#8c7a9c', '#fcf8ff'),
    ('sapphire-scholar', 'dark', 'text-muted', '#6a7088', '#0a0c14'),
    ('sapphire-scholar', 'light', 'text-muted', '#708098', '#f8faff'),
    ('teal-clarity', 'light', 'text-muted', '#5c8480', '#f6fcfb'),
    ('teal-clarity', 'light', 'accent-primary', '#0d9488', '#f6fcfb'),
    ('slate-minimal', 'dark', 'text-muted', '#686c70', '#101214'),
    ('slate-minimal', 'dark', 'accent-primary', '#64748b', '#101214'),
    ('slate-minimal', 'light', 'text-muted', '#6f7984', '#f8fafb'),
    ('sage-academic', 'dark', 'text-muted', '#6c7460', '#0e100c'),
    ('sage-academic', 'light', 'text-muted', '#6c7860', '#f9faf6'),
    ('amethyst-night', 'dark', 'text-muted', '#7a6c90', '#0c0a10'),
    ('amethyst-night', 'light', 'text-muted', '#887098', '#fdf8ff'),
    ('amethyst-night', 'light', 'accent-primary', '#a855f7', '#fdf8ff'),
    ('aurora-research', 'light', 'text-muted', '#7c8898', '#f6f8fc'),
    ('aurora-research', 'light', 'accent-primary', '#0284c7', '#f6f8fc'),
    ('coffee-craft', 'dark', 'text-muted', '#847668', '#100e0c'),
    ('coffee-craft', 'light', 'text-muted', '#8c7c6c', '#fffcf8'),
]

print("FIXES FOR ALL FAILING CONTRASTS")
print("=" * 70)

fixes_by_palette = {}

for palette, mode, prop, current, bg in failures:
    fixed, ratio = find_fixed_color(bg, current)
    key = f"{palette}|{mode}"
    if key not in fixes_by_palette:
        fixes_by_palette[key] = []

    if fixed:
        fixes_by_palette[key].append({
            'property': prop,
            'old': current,
            'new': fixed,
            'ratio': ratio
        })
        print(f"{palette} ({mode}) {prop}:")
        print(f"  OLD: {current} -> NEW: {fixed} ({ratio}:1)")
    else:
        print(f"{palette} ({mode}) {prop}: COULD NOT FIX")

print("\n" + "=" * 70)
print("COPY-PASTE FIXES FOR HTML (grouped by palette)")
print("=" * 70)

for key, fixes in fixes_by_palette.items():
    palette, mode = key.split('|')
    print(f"\n// {palette} ({mode}):")
    for fix in fixes:
        print(f"    '{fix['property']}': '{fix['new']}',  // Fixed from {fix['old']} ({fix['ratio']}:1)")
