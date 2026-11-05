#!/usr/bin/env python3
"""本地生成头像缩略图并更新 ../index.md 的 srcset。

需要 Python 3 和支持 libwebp 的 FFmpeg（加入 PATH）。
新增或替换原图后手动运行：python source/waifu/img/generate-thumbnails.py
可从任意工作目录运行；不由网站、Hexo 构建或 CI 调用。
"""

import re
import subprocess
from pathlib import Path


def main() -> None:
    image_dir = Path(__file__).resolve().parent
    page_dir = image_dir.parent
    page_path = page_dir / "index.md"
    output_dir = image_dir / "thumbs"
    output_dir.mkdir(exist_ok=True)

    # 100px 的头像框包含左右各 3px 的边框。
    content_size = 94
    densities = (1, 2, 3)
    portraits = 0

    def replace_image(match: re.Match) -> str:
        nonlocal portraits
        tag = match.group(0)
        if tag.startswith("<!--"):
            return tag
        source = re.search(r'\bsrc="(img/[^"]+)"', tag)
        if not source:
            return tag

        name = Path(source.group(1)).stem
        candidates = []
        for density in densities:
            size = content_size * density
            filename = f"{name}-{size}.webp"
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(page_dir / source.group(1)),
                "-vf", rf"crop=min(iw\,ih):min(iw\,ih),scale={size}:{size}:flags=lanczos+accurate_rnd",
                "-frames:v", "1", "-c:v", "libwebp", "-lossless", "1",
                "-compression_level", "6", "-f", "image2", "-update", "1",
                str(output_dir / filename),
            ], check=True)
            candidates.append(f"img/thumbs/{filename} {density}x")

        portraits += 1
        tag = re.sub(r'\s+srcset="[^"]*"', "", tag)
        return tag.replace(source.group(0), f'{source.group(0)} srcset="{", ".join(candidates)}"', 1)

    with page_path.open(encoding="utf-8", newline="") as file:
        page = file.read()
    page = re.sub(r"<!--[\s\S]*?-->|<img\b[^>]*>", replace_image, page)
    with page_path.open("w", encoding="utf-8", newline="") as file:
        file.write(page)
    print(f"Generated {portraits * len(densities)} thumbnails for {portraits} portraits.")


if __name__ == "__main__":
    main()
