#!/usr/bin/env python3
"""Ayeria 落地页字体子集工具。

  python tools/subset_font.py            # 生成子集（需要 fonttools + brotli）
  python tools/subset_font.py --check    # 校验子集是否与当前文案一致（只用标准库）

CI 先运行 --check；字体缺失或字符集变化时，下载固定版本的源字体并重新生成，
生成结果随本站部署，无需开发者手动更新或由 CI 回写仓库。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "source" / "ayeria" / "index.html"
OUT_DIR = ROOT / "source" / "ayeria" / "fonts"
MANIFEST = OUT_DIR / "manifest.json"
FAMILY = "Ayeria Serif"
WEIGHTS = (400, 700)

# 页面里可能出现的符号，不依赖字体本身的 cmap 覆盖顺序
EXTRA = set(chr(c) for c in range(0x20, 0x7F)) | set(
    "，。、；：？！“”‘’（）《》〈〉【】…—·「」『』％"
)


def char_set() -> set[str]:
    html = HTML.read_text(encoding="utf-8")
    html = re.sub(r"<style\b.*?</style>|<script\b.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", html)
    chars = {c for c in text if c == " " or not c.isspace()}
    chars |= EXTRA
    chars.discard("\ufeff")
    return chars


def fingerprint(chars: set[str]) -> str:
    payload = "".join(sorted(chars)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def find_source(explicit: str | None) -> Path:
    if explicit:
        path = Path(explicit)
        if not path.exists():
            sys.exit(f"找不到源字体：{path}")
        return path
    candidates = [
        Path(r"C:\Windows\Fonts\NotoSerifSC-VF.ttf"),
        Path("/System/Library/Fonts/NotoSerifSC-VF.ttf"),
        Path("/usr/share/fonts/opentype/noto/NotoSerifCJKsc-Regular.otf"),
    ]
    for path in candidates:
        if path.exists():
            return path
    sys.exit("未找到源字体，请用 --src 指定 Noto Serif SC 的可变字体或静态字体。")


def build(src: Path) -> None:
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
        from fontTools.varLib.instancer import instantiateVariableFont
    except ImportError:
        sys.exit("需要 fonttools 与 brotli：python -m pip install fonttools brotli")

    chars = char_set()
    payload = "".join(sorted(chars))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for weight in WEIGHTS:
        font = TTFont(src)
        if "fvar" in font:
            instantiateVariableFont(font, {"wght": weight}, inplace=True, optimize=True)

        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        options.hinting = False
        options.notdef_outline = True
        options.recalc_bounds = True

        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=payload)
        subsetter.subset(font)

        out = OUT_DIR / f"ayeria-serif-{weight}.woff2"
        font.flavor = "woff2"
        font.save(out)
        print(f"  wght {weight}: {out.name}  {out.stat().st_size / 1024:.1f} KB")

    manifest = {
        "family": FAMILY,
        "source": src.name,
        "weights": list(WEIGHTS),
        "chars": len(chars),
        "cjk": len([c for c in chars if "\u4e00" <= c <= "\u9fff"]),
        "hash": fingerprint(chars),
        "generated": date.today().isoformat(),
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  字符 {len(chars)}（汉字 {manifest['cjk']}）→ manifest 已更新")


def check() -> int:
    if not MANIFEST.exists():
        print("✗ 缺少 fonts/manifest.json，需要生成字体子集。", file=sys.stderr)
        return 1
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    chars = char_set()
    current = fingerprint(chars)
    missing = [f"fonts/ayeria-serif-{w}.woff2" for w in WEIGHTS if not (OUT_DIR / f"ayeria-serif-{w}.woff2").exists()]
    if missing:
        print("✗ 缺少字体文件：" + "、".join(missing), file=sys.stderr)
        return 1
    if manifest.get("hash") != current:
        print("✗ 落地页文案已变更，字体子集过期。", file=sys.stderr)
        print(f"  manifest: {manifest.get('chars')} 字符 / {manifest.get('hash')[:12]}", file=sys.stderr)
        print(f"  当前页面: {len(chars)} 字符 / {current[:12]}", file=sys.stderr)
        print("  CI 会自动重建；本地可运行 npm run subset。", file=sys.stderr)
        return 1
    print(f"✓ 字体子集与文案一致（{len(chars)} 字符，{manifest.get('cjk')} 汉字）")
    return 0


def main() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    parser = argparse.ArgumentParser(description="Ayeria 落地页字体子集")
    parser.add_argument("--check", action="store_true", help="只校验，不生成")
    parser.add_argument("--src", help="源字体路径（Noto Serif SC 可变字体或静态字体）")
    args = parser.parse_args()

    if args.check:
        raise SystemExit(check())

    if not HTML.exists():
        sys.exit(f"找不到页面：{HTML}")
    src = find_source(args.src)
    print(f"源字体：{src}")
    build(src)


if __name__ == "__main__":
    main()
