#!/usr/bin/env python3
"""从 content/posts/ 生成 assets/js/data.js。

用法：
    python3 tools/build.py           # 只生成数据文件
    python3 tools/build.py --push    # 生成后自动提交并推送

每篇记录一个文件夹：content/posts/<slug>/index.md，照片放在同一文件夹里。
"""

import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    Image = None

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / 'content' / 'posts'
OUT_FILE = ROOT / 'assets' / 'js' / 'data.js'
WATERMARK_DIR = ROOT / 'assets' / 'img' / 'watermark'
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
RAW_EXTS = {'.heic', '.heif'}
WATERMARK_TEXT = 'wst'
FONT_PATHS = (
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
)


def die(msg):
    print(f'错误：{msg}', file=sys.stderr)
    sys.exit(1)


def parse_front_matter(text):
    if not text.startswith('---'):
        die('index.md 开头需要有 --- 包裹的元信息')
    parts = text.split('---', 2)
    if len(parts) < 3:
        die('index.md 的元信息没有正确闭合（需要第二个 ---）')

    meta, body = {}, parts[2].strip('\n')
    key = None
    for raw in parts[1].strip('\n').splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        item = re.match(r'^\s*-\s+(.*)$', line)
        if item and key:
            meta.setdefault(key, [])
            if not isinstance(meta[key], list):
                meta[key] = [meta[key]]
            meta[key].append(item.group(1).strip())
            continue
        kv = re.match(r'^([A-Za-z_][\w-]*):\s*(.*)$', line)
        if not kv:
            continue
        key, value = kv.group(1), kv.group(2).strip()
        if not value:
            meta[key] = []
        elif value.startswith('[') and value.endswith(']'):
            meta[key] = [v.strip() for v in value[1:-1].split(',') if v.strip()]
        else:
            meta[key] = value.strip('"\'')
    return meta, body


def paragraphs(body):
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    result = []
    for block in blocks:
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        joiner = '' if re.search(r'[\u4e00-\u9fff]', block) else ' '
        result.append(joiner.join(lines))
    return result


def convert_heic(folder):
    """把文件夹里的 HEIC / HEIF 转成同名 JPG，浏览器对 HEIC 支持不一致。"""
    raws = sorted(p for p in folder.iterdir() if p.suffix.lower() in RAW_EXTS)
    if not raws:
        return

    sips = shutil.which('sips')
    if not sips:
        die(f'{folder.name} 里有 HEIC，但没找到 macOS 的 sips，请先手动转成 JPG')

    for raw in raws:
        out = raw.with_suffix('.jpg')
        if out.exists():
            print(f'  跳过 {raw.name}：同名的 {out.name} 已存在')
            continue
        subprocess.run(
            [sips, '-s', 'format', 'jpeg', '-s', 'formatOptions', '88',
             '-Z', '2560', str(raw), '--out', str(out)],
            check=True, capture_output=True
        )
        print(f'  已转换 {raw.name} → {out.name}')


def load_font(size):
    for path in FONT_PATHS:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    try:
        return ImageFont.load_default(size)
    except TypeError:
        return ImageFont.load_default()


def watermark_tile(size):
    """一个平铺单元：对角交叉线 + 倾斜的 wst，重复拼接后铺满整张照片。"""
    tile = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tile)
    line_width = max(1, size // 70)
    for offset, color in ((2, (0, 0, 0, 16)), (0, (255, 255, 255, 28))):
        draw.line([(offset, offset), (size + offset, size + offset)], fill=color, width=line_width)
        draw.line([(size + offset, offset), (offset, size + offset)], fill=color, width=line_width)

    font = load_font(max(10, size // 7))
    box = draw.textbbox((0, 0), WATERMARK_TEXT, font=font)
    text_w, text_h = box[2] - box[0], box[3] - box[1]
    pad = 6
    stamp = Image.new('RGBA', (text_w + pad * 2, text_h + pad * 2), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stamp)
    sd.text((pad - box[0] + 2, pad - box[1] + 2), WATERMARK_TEXT, font=font, fill=(0, 0, 0, 55))
    sd.text((pad - box[0], pad - box[1]), WATERMARK_TEXT, font=font, fill=(255, 255, 255, 75))
    stamp = stamp.rotate(45, expand=True, resample=Image.BICUBIC)
    tile.alpha_composite(stamp, ((size - stamp.width) // 2, (size - stamp.height) // 2))
    return tile


def watermark_photo(src, dst):
    """生成带 wst 水印的展示图并写入版权信息，原图保持不动。"""
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as opened:
        exif = opened.getexif()
        img = ImageOps.exif_transpose(opened)
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGBA')
            flat = Image.new('RGB', img.size, (255, 255, 255))
            flat.paste(img, mask=img.getchannel('A'))
            img = flat
        else:
            img = img.convert('RGB')

    tile_size = max(120, min(img.size) // 6)
    tile = watermark_tile(tile_size)
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    for y in range(0, img.height, tile_size):
        for x in range(0, img.width, tile_size):
            overlay.paste(tile, (x, y), tile)
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')

    exif[0x013B] = 'wst'                # Artist
    exif[0x8298] = 'Copyright (c) wst - All rights reserved'    # Copyright
    suffix = dst.suffix.lower()
    if suffix == '.webp':
        img.save(dst, 'WEBP', quality=88, method=4)
    elif suffix == '.png':
        img.save(dst, 'PNG', optimize=True)
    else:
        img.save(dst, 'JPEG', quality=88, optimize=True, progressive=True, exif=exif.tobytes())
    print(f'  已加水印 {dst.relative_to(ROOT)}')


def load_post(folder):
    md_file = folder / 'index.md'
    if not md_file.exists():
        die(f'{folder.name} 缺少 index.md')

    convert_heic(folder)
    meta, body = parse_front_matter(md_file.read_text(encoding='utf-8'))

    if meta.get('draft') in ('true', 'yes', 1):
        return None

    title = meta.get('title')
    date = meta.get('date')
    if not title:
        die(f'{folder.name}/index.md 缺少 title')
    if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', str(date)):
        die(f'{folder.name}/index.md 的 date 需要写成 YYYY-MM-DD')

    images = sorted(
        [p for p in folder.iterdir() if p.suffix.lower() in IMAGE_EXTS],
        key=lambda p: p.name.lower()
    )
    if not images:
        die(f'{folder.name} 里没有照片，至少放一张 .jpg / .png（HEIC 会自动转成 JPG）')

    captions = meta.get('captions') or []
    alts = meta.get('alts') or []
    photos = []
    for i, img in enumerate(images):
        dst = WATERMARK_DIR / folder.name / img.name
        watermark_photo(img, dst)
        caption = captions[i] if i < len(captions) else ''
        alt = alts[i] if i < len(alts) and alts[i] else (f'{title}，{caption}' if caption else title)
        photos.append({
            'src': dst.relative_to(ROOT).as_posix(),
            'alt': alt,
            'caption': caption,
        })

    post = {
        'id': folder.name,
        'title': str(title),
        'date': str(date),
        'location': str(meta.get('location') or ''),
        'city': str(meta.get('city') or ''),
        'tags': meta.get('tags') or [],
        'excerpt': str(meta.get('excerpt') or ''),
        'body': paragraphs(body),
        'photos': photos,
    }
    return post


def build():
    if Image is None:
        die('缺少 Pillow，无法给照片加水印：先运行 python3 -m pip install --user Pillow')
    if not POSTS_DIR.exists():
        die('找不到 content/posts 目录')

    posts = [p for p in (load_post(d) for d in sorted(POSTS_DIR.iterdir()) if d.is_dir()) if p]
    if not posts:
        die('content/posts 下还没有任何记录')

    posts.sort(key=lambda p: (p['date'], p['id']), reverse=True)

    header = (
        '/* 由 tools/build.py 从 content/posts/ 自动生成，请不要直接修改这个文件。\n'
        '   增删改记录：在 content/posts/<slug>/ 里编辑 index.md 与照片，然后运行 python3 tools/build.py --push */\n\n'
    )
    OUT_FILE.write_text(
        header + 'const PLOG_POSTS = ' + json.dumps(posts, ensure_ascii=False, indent=2) + ';\n',
        encoding='utf-8'
    )

    photos = sum(len(p['photos']) for p in posts)
    print(f'已生成 {OUT_FILE.relative_to(ROOT)}：{len(posts)} 篇记录，{photos} 张照片')
    for p in posts:
        print(f"  {p['date']}  {p['title']}  ({len(p['photos'])} 张)")


def push():
    def run(*args):
        print('$ git', ' '.join(args))
        subprocess.run(['git', *args], cwd=ROOT, check=True)

    run('add', '-A')
    diff = subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=ROOT)
    if diff.returncode == 0:
        print('没有变化，跳过提交')
        return
    stamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    run('commit', '-m', f'content: 更新记录 {stamp}')
    run('push', 'origin', 'main')
    print('已推送到 GitHub，约 1 分钟后线上生效')


def new_post(slug):
    """新建一篇记录的文件夹与 index.md 模板。"""
    slug = re.sub(r'[^\w\u4e00-\u9fff-]+', '-', slug.strip()).strip('-')
    if not slug:
        die('用法：python3 tools/build.py --new <文件夹名>')

    folder = POSTS_DIR / slug
    if folder.exists():
        die(f'content/posts/{slug} 已存在')

    folder.mkdir(parents=True)
    today = datetime.now().strftime('%Y-%m-%d')
    (folder / 'index.md').write_text(f'''---
title: 
date: {today}
location: 
city: 
tags: []
excerpt: 
captions:
alts:
---


''', encoding='utf-8')

    print(f'已创建 content/posts/{slug}/index.md')
    print('接下来：')
    print('  1. 填写 index.md 的 title / location / tags / 正文')
    print('  2. 把照片放进同一个文件夹（HEIC 会自动转 JPG）')
    print('  3. python3 tools/build.py --push')


if __name__ == '__main__':
    if '--new' in sys.argv:
        index = sys.argv.index('--new')
        if index + 1 >= len(sys.argv):
            die('用法：python3 tools/build.py --new <文件夹名>')
        new_post(sys.argv[index + 1])
        sys.exit(0)

    build()
    if '--push' in sys.argv:
        push()
