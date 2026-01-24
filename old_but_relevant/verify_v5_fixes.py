#!/usr/bin/env python3
"""Verify all v5 contrast fixes pass WCAG AA"""

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

# FIXED v5 values
checks = [
    # (palette, mode, prop, fg, bg)
    ('indigo-focus', 'dark', 'text-muted', '#797b8f', '#0f1016'),
    ('indigo-focus', 'dark', 'accent-primary', '#696cf1', '#0f1016'),
    ('indigo-focus', 'light', 'text-muted', '#6c6f8c', '#f7f8fc'),
    ('violet-brand', 'dark', 'text-muted', '#7e7890', '#0d0c12'),
    ('violet-brand', 'light', 'text-muted', '#776e86', '#faf8fd'),
    ('sapphire-scholar', 'dark', 'text-muted', '#827b71', '#100f0d'),
    ('sapphire-scholar', 'light', 'text-muted', '#777064', '#faf8f5'),
    ('teal-clarity', 'dark', 'text-muted', '#688a96', '#0a1012'),
    ('teal-clarity', 'light', 'text-muted', '#57777e', '#f5fafb'),
    ('teal-clarity', 'light', 'accent-primary', '#0b7e74', '#f5fafb'),
    ('slate-minimal', 'dark', 'text-muted', '#7a7a84', '#0e0e10'),
    ('slate-minimal', 'light', 'text-muted', '#6f6f7a', '#f8f8fa'),
    ('sage-academic', 'dark', 'text-muted', '#6e8066', '#0c0e0c'),
    ('sage-academic', 'light', 'text-muted', '#667566', '#f7faf6'),
    ('amethyst-night', 'dark', 'text-muted', '#807593', '#08080e'),
    ('amethyst-night', 'light', 'text-muted', '#776f7f', '#faf8fd'),
    ('amethyst-night', 'light', 'accent-primary', '#9333ea', '#faf8fd'),
    ('aurora-research', 'dark', 'text-muted', '#6d7a8c', '#080a10'),
    ('aurora-research', 'light', 'text-muted', '#677383', '#f6f8fc'),
    ('aurora-research', 'light', 'accent-primary', '#0178b5', '#f6f8fc'),
    ('coffee-craft', 'dark', 'text-muted', '#84796b', '#100e0c'),
    ('coffee-craft', 'light', 'text-muted', '#7a6f60', '#faf7f4'),
]

print("V5 WCAG CONTRAST VERIFICATION")
print("=" * 60)

passed = 0
failed = 0

for palette, mode, prop, fg, bg in checks:
    ratio = get_contrast(fg, bg)
    status = "PASS" if ratio >= 4.5 else "FAIL"

    if ratio >= 4.5:
        passed += 1
        print(f"{palette} ({mode}) {prop}: {ratio}:1 PASS")
    else:
        failed += 1
        print(f"{palette} ({mode}) {prop}: {ratio}:1 FAIL ***")

print("=" * 60)
print(f"PASSED: {passed}, FAILED: {failed}")
if failed == 0:
    print("ALL WCAG AA CONTRAST REQUIREMENTS MET!")
