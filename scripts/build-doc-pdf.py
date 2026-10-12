#!/usr/bin/env python3
"""
Build a right-to-left Persian PDF from one of the markdown docs in docs/.

    python3 scripts/build-doc-pdf.py docs/BACKEND_REQUIREMENTS_USER_ORG_APP.md

Writes <name>.pdf next to the markdown file. Uses only the standard library and
the local Google Chrome (headless --print-to-pdf); the Vazirmatn fonts come
from assets/fonts so the output does not depend on system fonts.

Supports the markdown subset these docs use: headings, paragraphs, **bold**,
`code`, fenced code blocks, tables (with \\| escapes), ordered/unordered lists
(with indented continuation blocks), blockquotes and horizontal rules.
"""
import html
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'assets', 'fonts')
CHROME_CANDIDATES = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']


def inline(text):
    # code spans are protected first so **bold** may wrap around them
    codes = []

    def stash(match):
        codes.append('<code>%s</code>' % html.escape(match.group(1)))
        return '\x00%d\x00' % (len(codes) - 1)

    protected = re.sub(r'`([^`]*)`', stash, text)
    escaped = html.escape(protected)
    escaped = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', escaped)
    return re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], escaped)


def split_row(line):
    cells = re.split(r'(?<!\\)\|', line.strip().strip('|'))
    return [c.strip().replace('\\|', '|') for c in cells]


LIST_RE = re.compile(r'^(\s*)(\d+\.|-)\s+(.*)$')


def is_block_start(line):
    s = line.lstrip()
    return (
        s.startswith('```') or s.startswith('#') or s.startswith('>') or s.startswith('|')
        or s.strip() == '---' or bool(LIST_RE.match(line))
    )


def parse(lines):
    out = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith('```'):
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith('```'):
                buf.append(lines[i])
                i += 1
            i += 1
            out.append('<pre dir="ltr"><code>%s</code></pre>' % html.escape('\n'.join(buf)))
            continue
        m = re.match(r'^(#{1,4})\s+(.*)$', stripped)
        if m:
            level = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (level, inline(m.group(2)), level))
            i += 1
            continue
        if stripped == '---':
            out.append('<hr>')
            i += 1
            continue
        if stripped.startswith('>'):
            buf = []
            while i < n and lines[i].strip().startswith('>'):
                buf.append(re.sub(r'^\s*>\s?', '', lines[i]))
                i += 1
            out.append('<blockquote>%s</blockquote>' % parse(buf))
            continue
        if stripped.startswith('|'):
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(split_row(lines[i]))
                i += 1
            head, body = rows[0], [r for r in rows[1:] if not all(re.fullmatch(r':?-+:?', c) for c in r)]
            html_rows = ['<tr>%s</tr>' % ''.join('<th>%s</th>' % inline(c) for c in head)]
            html_rows += ['<tr>%s</tr>' % ''.join('<td>%s</td>' % inline(c) for c in r) for r in body]
            out.append('<table>%s</table>' % ''.join(html_rows))
            continue
        m = LIST_RE.match(line)
        if m:
            indent = len(m.group(1))
            ordered = m.group(2) != '-'
            items = []
            while i < n:
                m2 = LIST_RE.match(lines[i])
                if not (m2 and len(m2.group(1)) == indent and (m2.group(2) != '-') == ordered):
                    break
                item = [m2.group(3)]
                i += 1
                while i < n:
                    nxt = lines[i]
                    if not nxt.strip():
                        # blank line: continue only if the next non-blank line is indented
                        j = i
                        while j < n and not lines[j].strip():
                            j += 1
                        if j < n and len(lines[j]) - len(lines[j].lstrip()) > indent:
                            item.extend(lines[i:j])
                            i = j
                            continue
                        break
                    lead = len(nxt) - len(nxt.lstrip())
                    if lead > indent:
                        item.append(nxt[indent + 2 if not ordered else indent + 3:] if lead >= indent + 2 else nxt.lstrip())
                        i += 1
                    else:
                        break
                body = parse(item)
                # a single paragraph item renders inline
                single = re.fullmatch(r'<p>(.*)</p>', body, re.S)
                items.append('<li>%s</li>' % (single.group(1) if single else body))
            tag = 'ol' if ordered else 'ul'
            out.append('<%s>%s</%s>' % (tag, ''.join(items), tag))
            continue
        buf = [stripped]
        i += 1
        while i < n and lines[i].strip() and not is_block_start(lines[i]):
            buf.append(lines[i].strip())
            i += 1
        out.append('<p>%s</p>' % inline(' '.join(buf)))
    return '\n'.join(out)


CSS = """
@font-face { font-family: 'Vazirmatn'; src: url('file://%(fonts)s/Vazirmatn-Light.ttf'); font-weight: 400; }
@font-face { font-family: 'Vazirmatn'; src: url('file://%(fonts)s/Vazirmatn-Bold.ttf'); font-weight: 700; }
/* Latin from the monospace font, Persian falls through to Vazirmatn (shaped). */
@font-face { font-family: 'CodeLatin'; src: local('DejaVu Sans Mono'), local('Liberation Mono'); unicode-range: U+0000-024F; }
@page { size: A4; margin: 16mm 14mm 16mm 14mm; }
html { direction: rtl; }
body { font-family: 'Vazirmatn', sans-serif; font-size: 10.5pt; line-height: 1.85; color: #1c1c1e; }
h1 { font-size: 19pt; color: #0b3b6f; border-bottom: 3px solid #d4a017; padding-bottom: 6px; margin: 0 0 10px; }
h2 { font-size: 14pt; color: #0b3b6f; margin: 22px 0 8px; padding: 6px 10px; background: #eef4fb; border-right: 4px solid #0b3b6f; page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #1d5a99; margin: 16px 0 6px; page-break-after: avoid; }
p { margin: 6px 0; text-align: justify; }
b { font-weight: 700; }
code { direction: ltr; unicode-bidi: isolate; font-family: 'CodeLatin', 'Vazirmatn', monospace; font-size: 8.8pt;
       background: #f2f2f4; border: 1px solid #e2e2e6; border-radius: 4px; padding: 0 4px; }
pre { direction: ltr; text-align: left; background: #0f1b2b; color: #e6edf3; border-radius: 6px; padding: 10px 12px;
      font-size: 8.6pt; line-height: 1.5; white-space: pre-wrap; page-break-inside: avoid; }
pre code { background: none; border: none; color: inherit; padding: 0; font-size: inherit; }
table { width: 100%%; border-collapse: collapse; margin: 8px 0 12px; font-size: 9.4pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th { background: #0b3b6f; color: #fff; font-weight: 700; padding: 5px 7px; text-align: right; }
td { border-bottom: 1px solid #dfe3ea; padding: 5px 7px; vertical-align: top; }
tr:nth-child(even) td { background: #f8fafc; }
blockquote { margin: 8px 0; padding: 6px 12px; background: #fff8e6; border-right: 4px solid #d4a017; border-radius: 4px; }
blockquote p { margin: 3px 0; }
ul, ol { margin: 6px 0; padding-right: 22px; }
li { margin: 3px 0; }
hr { border: none; border-top: 1px dashed #c9ced6; margin: 18px 0; }
.meta { color: #555; font-size: 9.5pt; margin-bottom: 14px; }
"""


def build(md_path):
    with open(md_path, encoding='utf-8') as fh:
        text = fh.read()
    body = parse(text.split('\n'))
    title_match = re.search(r'^#\s+(.*)$', text, re.M)
    title = title_match.group(1) if title_match else os.path.basename(md_path)
    doc = """<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<title>%s</title><style>%s</style></head><body>%s</body></html>""" % (
        html.escape(title), CSS % {'fonts': FONTS}, body)

    pdf_path = os.path.splitext(md_path)[0] + '.pdf'
    chrome = next((c for c in CHROME_CANDIDATES if subprocess.call(['which', c], stdout=subprocess.DEVNULL) == 0), None)
    if not chrome:
        sys.exit('Google Chrome / Chromium not found')
    with tempfile.TemporaryDirectory() as tmp:
        html_path = os.path.join(tmp, 'doc.html')
        with open(html_path, 'w', encoding='utf-8') as fh:
            fh.write(doc)
        subprocess.check_call([
            chrome, '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
            '--no-pdf-header-footer', '--print-to-pdf=%s' % os.path.abspath(pdf_path), 'file://' + html_path,
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(pdf_path)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    build(sys.argv[1])
