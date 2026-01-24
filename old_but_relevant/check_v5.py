#!/usr/bin/env python3
"""Check WCAG contrast for v5 palettes"""
import colorsys

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_luminance(r, g, b):
    def channel(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

def get_contrast(fg, bg):
    lum1 = get_luminance(*hex_to_rgb(fg))
    lum2 = get_luminance(*hex_to_rgb(bg))
    lighter, darker = max(lum1, lum2), min(lum1, lum2)
    return round((lighter + 0.05) / (darker + 0.05), 2)

def is_light_bg(bg):
    return get_luminance(*hex_to_rgb(bg)) > 0.5

def fix_color(bg, fg, target=4.5):
    ratio = get_contrast(fg, bg)
    if ratio >= target:
        return fg, ratio

    rgb = hex_to_rgb(fg)
    h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)

    light_bg = is_light_bg(bg)
    step = -1 if light_bg else 1

    for l_test in range(int(l*100), 101 if step > 0 else -1, step):
        r, g, b = colorsys.hls_to_rgb(h, l_test/100, s)
        test_hex = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"
        if get_contrast(test_hex, bg) >= target:
            return test_hex, get_contrast(test_hex, bg)
    return None, 0

# V5 actual values
checks = [
    # (palette, mode, prop, fg, bg)
    ('indigo-focus', 'dark', 'text-muted', '#6b6d80', '#0f1016'),
    ('indigo-focus', 'dark', 'accent-primary', '#6366f1', '#0f1016'),
    ('indigo-focus', 'light', 'text-muted', '#8486a0', '#f7f8fc'),
    ('violet-brand', 'dark', 'text-muted', '#726c84', '#0d0c12'),
    ('violet-brand', 'light', 'text-muted', '#8a8298', '#faf8fd'),
    ('sapphire-scholar', 'dark', 'text-muted', '#7a736a', '#100f0d'),
    ('sapphire-scholar', 'light', 'text-muted', '#918a7c', '#faf8f5'),
    ('teal-clarity', 'dark', 'text-muted', '#688a96', '#0a1012'),
    ('teal-clarity', 'light', 'text-muted', '#6a9098', '#f5fafb'),
    ('teal-clarity', 'light', 'accent-primary', '#0d9488', '#f5fafb'),
    ('slate-minimal', 'dark', 'text-muted', '#64646c', '#0e0e10'),
    ('slate-minimal', 'light', 'text-muted', '#8e8e98', '#f8f8fa'),
    ('sage-academic', 'dark', 'text-muted', '#6e8066', '#0c0e0c'),
    ('sage-academic', 'light', 'text-muted', '#849484', '#f7faf6'),
    ('amethyst-night', 'dark', 'text-muted', '#6e6480', '#08080e'),
    ('amethyst-night', 'light', 'text-muted', '#888090', '#faf8fd'),
    ('amethyst-night', 'light', 'accent-primary', '#9333ea', '#faf8fd'),
    ('aurora-research', 'dark', 'text-muted', '#647080', '#080a10'),
    ('aurora-research', 'light', 'text-muted', '#7c8898', '#f6f8fc'),
    ('aurora-research', 'light', 'accent-primary', '#0284c7', '#f6f8fc'),
    ('coffee-craft', 'dark', 'text-muted', '#7c7264', '#100e0c'),
    ('coffee-craft', 'light', 'text-muted', '#948878', '#faf7f4'),
]

print("V5 WCAG CONTRAST CHECK")
print("=" * 70)

fixes = []
for palette, mode, prop, fg, bg in checks:
    ratio = get_contrast(fg, bg)
    status = "PASS" if ratio >= 4.5 else "FAIL"

    if ratio < 4.5:
        fixed, new_ratio = fix_color(bg, fg)
        fixes.append((palette, mode, prop, fg, fixed, new_ratio))
        print(f"{palette} ({mode}) {prop}: {fg} -> {ratio}:1 FAIL")
        print(f"  FIX: {fixed} -> {new_ratio}:1")
    else:
        print(f"{palette} ({mode}) {prop}: {fg} -> {ratio}:1 PASS")

print("\n" + "=" * 70)
print(f"TOTAL FIXES NEEDED: {len(fixes)}")
print("=" * 70 + "\n")

for p, m, prop, old, new, r in fixes:
    print(f"// {p} ({m})")
    print(f"'{prop}': '{new}',  // Fixed from {old} ({r}:1)")
