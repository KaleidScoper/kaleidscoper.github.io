#!/usr/bin/env python3
"""Parse random-sentences.txt and generate poetry-stats/data.json.

Usage:
    python3 tools/poetry-stats.py                           # dry-run, print stats to stdout
    python3 tools/poetry-stats.py --write                   # write data.json
    python3 tools/poetry-stats.py --file path/to/data.json  # write to custom path

The script reads themes/ayeria/source/data/random-sentences.txt and computes:
  - totalWorks:       works with at least one active (non-#) line
  - totalLibraryWorks: all works in the file
  - totalLines:        all active lines (including internet sentences, derivatives)
  - dynasty breakdown
  - poet breakdown
"""

import re
import json
import sys
from collections import defaultdict, OrderedDict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SENTENCES_FILE = "themes/ayeria/source/data/random-sentences.txt"
DEFAULT_OUTPUT = "source/poetry-stats/data.json"

HEADER_LINES = 28  # Skip the file header (lines 0-27)

# Dynasty names in the file → canonical dynasty names
DYNASTY_MAP = {
    '春秋': '先秦', '战国': '先秦', '先秦': '先秦',
    '西汉': '汉',   '东汉': '汉',
    '三国魏': '三国',
    '西晋': '晋',   '东晋': '晋',
    '南朝宋': '南北朝', '南朝梁': '南北朝', '南北朝': '南北朝',
    '唐代': '唐',
    '南唐': '五代十国',
    '宋代': '宋',
    '金代': '金',
    '元代': '元',
    '明代': '明',
    '清代': '清',
    '近代': '近代',
    '现代': '现代',
}

DYNASTY_ORDER = [
    '先秦', '汉', '三国', '晋', '南北朝', '唐',
    '五代十国', '宋', '金', '元', '明', '清', '近代', '现代',
]

# Lines that are metadata notes, not titles and not content
NOTE_PREFIXES = [
    '# 此句为原文', '# 此处我想组合', '# 独立展示此拼凑句',
    '# 拼凑句：', '# 拼凑句',
    '# 排列逻辑', '# 此诗词库', '# 本文件中', '# 仅因',
    '# 不要', '# 全文均', '# 诗文', '# 其他信息',
    '# 针对正', '# 当您被', '# 再次强调', '# 特别地',
    '# 古今诗文', '# 所有选中', '# 不要把',
    '# 同朝代', '# 来自小', '# 有多个',
    '# 程本：',
]

# Matches "# Author〔Dynasty〕"
AUTHOR_RE = re.compile(r'^# (.+?)〔(.+?)〕')


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_note_line(line: str) -> bool:
    """Check if a #-prefixed line is a metadata note (not a title, not content)."""
    for prefix in NOTE_PREFIXES:
        if line.startswith(prefix):
            return True
    # Lines starting with "# 〔..." are metadata (e.g. author disputes)
    if line.startswith('# 〔') and len(line) > 20:
        return True
    return False


def is_title_candidate(line: str) -> bool:
    """A line that could be a work title: starts with '# ', no '〔', not a note."""
    if not line.startswith('# ') or '〔' in line:
        return False
    if line.startswith('# ——————'):
        return False
    if is_note_line(line):
        return False
    return True


def find_author_from(lines: list[str], start_idx: int, lookahead: int = 5):
    """Look ahead from start_idx for an author line ``# Name〔Dynasty〕``.

    Skips note lines (e.g. author-dispute annotations), stops on any other
    ``# `` line (potential sub-header / next title), and stops on non-``#``
    lines (actual content).

    Returns ``(author_idx, author_name, dynasty)`` or ``None``.
    """
    idx = start_idx
    checked = 0
    while idx < len(lines) and checked < lookahead:
        line = lines[idx].strip()
        if not line:
            idx += 1
            continue

        if is_note_line(line):
            idx += 1
            checked += 1
            continue

        m = AUTHOR_RE.match(line)
        if m:
            return idx, m.group(1).strip(), m.group(2).strip()

        # Any other # line or non-# line → stop
        if line.startswith('# ') or not line.startswith('#'):
            return None

    return None


def map_dynasty(raw: str) -> str:
    """Map a raw dynasty string from the file to a canonical dynasty name."""
    if raw in DYNASTY_MAP:
        return DYNASTY_MAP[raw]
    for k, v in DYNASTY_MAP.items():
        if k in raw:
            return v
    print(f"WARNING: unmapped dynasty: {raw}", file=sys.stderr)
    return raw


# ---------------------------------------------------------------------------
# Parse
# ---------------------------------------------------------------------------

def parse_works(lines: list[str]) -> list[dict]:
    """Extract works from the sentences file.

    Each work is a dict with keys: title, author, dynasty, active, total.
    """
    works = []
    i = HEADER_LINES

    while i < len(lines):
        line = lines[i].strip()

        if not line or line.startswith('# ——————'):
            i += 1
            continue

        if is_title_candidate(line):
            title = line[2:].strip()
            result = find_author_from(lines, i + 1)
            if result:
                author_idx, author, dynasty = result

                # Find where this work's content ends (start of next work)
                content_start = author_idx + 1
                content_end = len(lines)

                k = content_start
                while k < len(lines):
                    cl = lines[k].strip()
                    if cl and is_title_candidate(cl):
                        next_result = find_author_from(lines, k + 1)
                        if next_result:
                            content_end = k
                            break
                    if cl and cl.startswith('# ——————'):
                        content_end = k
                        break
                    k += 1

                # Count lines
                active = 0
                total = 0
                k = content_start
                while k < content_end:
                    cl = lines[k].strip()
                    if not cl:
                        k += 1
                        continue
                    if is_note_line(cl):
                        k += 1
                        continue
                    if cl.startswith('# '):
                        total += 1
                    else:
                        active += 1
                        total += 1
                    k += 1

                works.append({
                    'title': title,
                    'author': author,
                    'dynasty': dynasty,
                    'active': active,
                    'total': total,
                })

                i = content_start
                continue

        i += 1

    return works


def count_all_active(lines: list[str]) -> int:
    """Count every active (non-#, non-empty) line in the file body."""
    count = 0
    for i in range(HEADER_LINES, len(lines)):
        line = lines[i].strip()
        if not line or line.startswith('# ') or line.startswith('# ——————'):
            continue
        count += 1
    return count


# ---------------------------------------------------------------------------
# Aggregate
# ---------------------------------------------------------------------------

def compute_stats(works: list[dict], all_active: int) -> dict:
    """Aggregate work-level stats into the data.json shape."""
    dynasty_stats = OrderedDict(
        (d, {'works': 0, 'lines': 0, 'libraryWorks': 0}) for d in DYNASTY_ORDER
    )
    poet_stats = defaultdict(lambda: {'works': 0, 'lines': 0, 'libraryWorks': 0})

    for w in works:
        mapped = map_dynasty(w['dynasty'])
        if mapped not in dynasty_stats:
            print(f"WARNING: unmapped dynasty '{w['dynasty']}' for "
                  f"'{w['title']}' by '{w['author']}'", file=sys.stderr)
            continue

        dynasty_stats[mapped]['libraryWorks'] += 1
        poet_stats[w['author']]['libraryWorks'] += 1
        if w['active'] > 0:
            dynasty_stats[mapped]['works'] += 1
            dynasty_stats[mapped]['lines'] += w['active']
            poet_stats[w['author']]['works'] += 1
            poet_stats[w['author']]['lines'] += w['active']

    # Prune dynasties with zero works
    dynasty_stats = OrderedDict(
        (k, v) for k, v in dynasty_stats.items() if v['libraryWorks'] > 0
    )

    # Sort poets: works desc, lines desc, libraryWorks desc
    poets_list = sorted(
        poet_stats.items(),
        key=lambda x: (-x[1]['works'], -x[1]['lines'], -x[1]['libraryWorks']),
    )

    total_works = sum(1 for w in works if w['active'] > 0)

    return {
        'totalWorks': total_works,
        'totalLibraryWorks': len(works),
        'totalLines': all_active,
        'dynasties': [{'dynasty': d, **v} for d, v in dynasty_stats.items()],
        'poets': [{'poet': p, **v} for p, v in poets_list],
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    sentences_path = SENTENCES_FILE
    output_path = None
    print_stats = True

    # Simple arg parsing
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == '--write':
            output_path = DEFAULT_OUTPUT
        elif args[i] == '--file' and i + 1 < len(args):
            output_path = args[i + 1]
            i += 1
        elif args[i] in ('-h', '--help'):
            print(__doc__)
            return
        i += 1

    with open(sentences_path, 'r') as f:
        lines = [l.rstrip('\n').rstrip('\r') for l in f.readlines()]

    works = parse_works(lines)
    all_active = count_all_active(lines)
    stats = compute_stats(works, all_active)

    if print_stats:
        print(f"totalWorks:       {stats['totalWorks']}")
        print(f"totalLibraryWorks: {stats['totalLibraryWorks']}")
        print(f"totalLines:        {stats['totalLines']}")
        print(f"dynasties:         {len(stats['dynasties'])}")
        print(f"poets:             {len(stats['poets'])}")
        print()
        print("=== Dynasties ===")
        for d in stats['dynasties']:
            print(f"  {d['dynasty']}: works={d['works']}, lines={d['lines']}, "
                  f"libraryWorks={d['libraryWorks']}")
        print()
        print("=== Top 20 Poets ===")
        for p in stats['poets'][:20]:
            print(f"  {p['poet']}: works={p['works']}, lines={p['lines']}, "
                  f"libraryWorks={p['libraryWorks']}")

    if output_path:
        with open(output_path, 'w') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        print(f"\nWritten: {output_path}")


if __name__ == '__main__':
    main()
