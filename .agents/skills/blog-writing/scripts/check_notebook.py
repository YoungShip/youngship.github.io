#!/usr/bin/env python3
"""Dependency-free structural checks; not a YAML parser or research validator.

Use Python >=3.8. --built-site checks actual generated HTML IDs and links.
No fixed commit, document count or issue count is assumed.
"""
import argparse
import datetime as dt
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit

HUB_NAMES = (
    '2026-09-23-micromani-research-overview.md',
    '2026-09-29-micromani-research-status.md',
    '2026-09-29-micromani-experiment-register.md',
)
HOST = 'youngship.github.io'


def post_url(name):
    return '/notes/' + name[:10].replace('-', '/') + '/' + name[11:-3] + '/'


def frontmatter(text):
    match = re.match(r'\A---\s*\n(.*?)\n---\s*(?:\n|$)', text, re.S)
    if not match:
        raise ValueError('missing front-matter delimiters')
    # Structural extraction only. Multiline values need the Jekyll YAML parser.
    fields = dict(re.findall(r'^([A-Za-z_][\w-]*):[ \t]*(.*)$', match.group(1), re.M))
    return fields, text[match.end():]


def plain_value(value):
    return value.strip().strip('\"\'')


def strip_fences(text):
    out, fence = [], None
    for line in text.splitlines():
        mark = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
        if mark and fence is None:
            fence = mark.group(1)
        elif mark and fence and mark.group(1)[0] == fence[0] and len(mark.group(1)) >= len(fence):
            fence = None
        elif fence is None:
            out.append(line)
    return '\n'.join(out), fence is not None


class HTMLInfo(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.duplicates, self.links = set(), [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            ident = attrs['id']
            if ident in self.ids:
                self.duplicates.append(ident)
            self.ids.add(ident)
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])


def validate(root, built_site=None, today=None):
    root = Path(root).resolve()
    today = today or (dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).date())
    errors, warnings, pages, micro, docs = [], [], {}, {}, {}
    checks = {'posts': 0, 'research_posts': 0, 'source_links': 0, 'built_html': 0, 'built_links': 0}
    hub_urls = [post_url(n) for n in HUB_NAMES]
    if not (root / '_posts').is_dir():
        errors.append('missing _posts directory')
    for path in sorted((root / '_posts').glob('*.md')):
        checks['posts'] += 1
        rel = path.relative_to(root).as_posix()
        text = path.read_text(encoding='utf-8-sig')
        try:
            fields, body = frontmatter(text)
        except ValueError as exc:
            errors.append(rel + ': ' + str(exc))
            continue
        is_micro = 'MicroMani' in fields.get('tags', '') or 'micromani' in path.name
        for field in ('title', 'description', 'category'):
            if not plain_value(fields.get(field, '')):
                errors.append(rel + ': missing ' + field)
        raw_date = plain_value(fields.get('date', ''))
        if not raw_date:
            (errors if is_micro else warnings).append(rel + ': no explicit publication date')
        else:
            try:
                pub_date = dt.date.fromisoformat(raw_date[:10])
                if raw_date[:10] != path.name[:10] or pub_date > today:
                    errors.append(rel + ': filename/date mismatch or future publication date')
            except ValueError:
                errors.append(rel + ': invalid date')
        cleaned, unclosed = strip_fences(body)
        if unclosed:
            errors.append(rel + ': unclosed code fence')
        route = plain_value(fields.get('permalink', '')) or post_url(path.name)
        if route in pages:
            errors.append(rel + ': duplicate URL ' + route)
        pages[route], docs[route] = path, cleaned
        if is_micro:
            checks['research_posts'] += 1
            micro[path.name] = (body, cleaned)
            for target in hub_urls:
                if target not in cleaned:
                    errors.append(rel + ': missing research hub link ' + target)
            count = cleaned.count('{:toc}')
            if count > 1 or cleaned.count('<details') != cleaned.count('</details>'):
                errors.append(rel + ': duplicate TOC or unbalanced details')
        if re.search(r'(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-proj-[A-Za-z0-9_-]{24,})', text):
            errors.append(rel + ': possible secret, review without printing it')
    # Static HTML pages and redirects also define source routes.
    html_paths = list(root.glob('*.html')) + list((root / 'notes').rglob('*.html'))
    for path in html_paths:
        text = path.read_text(encoding='utf-8-sig')
        route = '/' + path.relative_to(root).as_posix()
        try:
            fields, _ = frontmatter(text)
            route = plain_value(fields.get('permalink', '')) or route
        except ValueError:
            pass
        if route.endswith('/index.html'):
            route = route[:-10]
        pages[route], docs[route] = path, text
    for name in HUB_NAMES:
        if name not in micro:
            errors.append('missing research hub: ' + name)
    overview = micro.get(HUB_NAMES[0], ('', ''))[1]
    for name in micro:
        if name not in HUB_NAMES and post_url(name) not in overview:
            errors.append('timeline missing research record: ' + name)
    status = micro.get(HUB_NAMES[1], ('', ''))[1]
    issue_ids = re.findall(r'<a\s+id=[\"\']([A-E]\d{2,})[\"\']', status)
    if not issue_ids:
        errors.append('status ledger has no stable issue IDs')
    if len(set(issue_ids)) != len(issue_ids):
        errors.append('duplicate issue ID in status ledger')
    # Source links: check existing destinations and explicit issue IDs; generated
    # heading anchors are checked against real HTML, not an invented slug rule.
    for current, text in docs.items():
        links = re.findall(r'!?\[[^\]\n]*\]\(([^)\n]+)\)', text)
        links += re.findall(r'(?:href|src)=[\"\']([^\"\']+)[\"\']', text)
        for target in links:
            if '{{' in target or '{%' in target:
                continue
            parsed = urlsplit(urljoin('https://' + HOST + current, target))
            if parsed.scheme not in ('http', 'https') or parsed.netloc != HOST:
                continue
            route = unquote(parsed.path)
            checks['source_links'] += 1
            local = root / route.lstrip('/')
            if route not in pages and not local.is_file() and not (local / 'index.html').is_file():
                errors.append(current + ': broken local link ' + target)
            frag = unquote(parsed.fragment)
            if route == hub_urls[1] and re.fullmatch(r'[A-E]\d{2,}', frag) and frag not in issue_ids:
                errors.append(current + ': unknown issue anchor ' + frag)
    if built_site is not None:
        built = Path(built_site).resolve()
        if not built.is_dir():
            errors.append('built-site directory does not exist')
        rendered = {}
        for path in sorted(built.rglob('*.html')):
            route = '/' + path.relative_to(built).as_posix()
            if route.endswith('/index.html'):
                route = route[:-10]
            info = HTMLInfo()
            info.feed(path.read_text(encoding='utf-8-sig'))
            rendered[route] = info
            checks['built_html'] += 1
            if info.duplicates:
                errors.append(route + ': duplicate HTML IDs: ' + ', '.join(info.duplicates))
        for route in [post_url(n) for n in micro]:
            if route not in rendered:
                errors.append('missing rendered research page: ' + route)
        for current, info in rendered.items():
            for target in info.links:
                parsed = urlsplit(urljoin('https://' + HOST + current, target))
                if parsed.scheme not in ('http', 'https') or parsed.netloc != HOST:
                    continue
                route, frag = unquote(parsed.path), unquote(parsed.fragment)
                checks['built_links'] += 1
                local = built / route.lstrip('/')
                if route not in rendered and not local.is_file() and not (local / 'index.html').is_file():
                    errors.append(current + ': broken generated link ' + target)
                elif frag and route in rendered and frag not in rendered[route].ids:
                    errors.append(current + ': missing generated anchor ' + target)
        for forbidden in ('AGENTS.md', '.agents', '.local-drafts'):
            if (built / forbidden).exists():
                errors.append('build exposes excluded content: ' + forbidden)
    return {'passed': not errors, 'checks': checks, 'errors': errors, 'warnings': warnings,
            'scope': 'Structural checks only; Jekyll build and evidence review remain required.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[4])
    parser.add_argument('--built-site', type=Path)
    args = parser.parse_args()
    try:
        result = validate(args.root, args.built_site)
    except (OSError, UnicodeError, ValueError) as exc:
        result = {'passed': False, 'errors': [str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
