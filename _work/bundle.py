#!/usr/bin/env python3
"""Fold the whole app into ONE .html file.

One file you can AirDrop or email to a student. They double-click it. No folder
to keep together, nothing alongside it, no server, no wifi.

Everything goes inside: Three.js r128 and its loaders, the stylesheet, the
webfont as a data URI, all four modules, and the three meshes as base64. The
loader already prefers an in-page global over fetching a file, so nothing has to
be patched at bundle time — see `embedded()` and `ensureModule()` in app.js.

Run:  python3 _work/bundle.py
Out:  dogtra-1900x-trainer.html
"""
import base64, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
APP  = os.path.dirname(HERE)
read = lambda *p: open(os.path.join(APP, *p), encoding='utf-8').read()

html = read('index.html')

# ── the webfont, so the serif survives with no vendor/ folder beside it ──────
font_b64 = base64.b64encode(open(os.path.join(APP, 'vendor', 'playfair.woff2'), 'rb').read()).decode()
css = read('style.css')
css_before = css
css = re.sub(r"url\(\s*['\"]?(?:\./)?(?:vendor/)?playfair\.woff2['\"]?\s*\)",
             "url(data:font/woff2;base64,%s)" % font_b64, css)
if css == css_before:
    print('  ! the @font-face url did not match — the serif would fall back', file=sys.stderr)

# ── stylesheet ──────────────────────────────────────────────────────────────
html, n = re.subn(r'<link rel="stylesheet" href="style\.css">',
                  lambda m: '<style>\n' + css + '\n</style>', html, count=1)
assert n == 1, 'stylesheet link not found'

# ── scripts ─────────────────────────────────────────────────────────────────
# ORDER MATTERS, and getting it wrong fails SILENTLY. The meshes are plain
# string globals and can go anywhere, so they go first. The modules are not:
# each one registers itself against window.EC, which app.js creates. Run them
# before app.js and they find no EC, return quietly, register nothing, and you
# get a page with no console error and three dead tabs. So they go last.
# EC_INLINED tells ensureModule() not to fetch files that are not there.
PRELUDE  = ['models-receiver.js', 'models-transmitter.js', 'models-dog.js']
POSTLUDE = ['nomen.js', 'fitting.js', 'level.js']

def inline(path):
    body = read(path)
    # </script> anywhere inside a string would close the tag early.
    body = body.replace('</script>', '<\\/script>')
    return '<script>\n/* ' + path + ' */\n' + body + '\n</script>'

bits = ['<script>window.EC_INLINED = true;</script>']
bits += [inline(p) for p in PRELUDE]

def swap(m):
    return inline(m.group(1))

html, n = re.subn(r'<script src="([^"]+)"></script>', swap, html)
assert n == 6, 'expected 6 script tags, found %d' % n

# the prelude goes immediately before the first inlined script block
first = html.index('<script>\n/* vendor/three.min.js */')
html = html[:first] + '\n'.join(bits) + '\n' + html[first:]

# the modules go immediately AFTER app.js, once window.EC exists
tail = html.index('</script>', html.index('<script>\n/* app.js */')) + len('</script>')
html = html[:tail] + '\n' + '\n'.join(inline(p) for p in POSTLUDE) + html[tail:]

html = html.replace('<title>', '<!-- Single-file build. Everything is inside this one file. -->\n<title>', 1)

out = os.path.join(APP, 'dogtra-1900x-trainer.html')
open(out, 'w', encoding='utf-8').write(html)

mb = os.path.getsize(out) / 1024 / 1024
print('wrote %s  (%.1f MB)' % (out, mb))
for bad in ('src="vendor/', 'src="app.js"', 'href="style.css"', "src: url(vendor/"):
    if bad in html:
        print('  ! still references %s' % bad, file=sys.stderr)
