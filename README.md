# wst plog

生活影像记录站：照片为主，配短文、日期与标签。内容用 Markdown 管理，由 `tools/build.py` 生成数据文件，页面是纯静态 HTML / CSS / JavaScript，托管在 GitHub Pages。

线上地址：https://wst-wst.github.io/plot

## 本地预览

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。

## 写一篇新记录

每篇记录是 `content/posts/` 下的一个文件夹，文件夹名就是这篇的 id（用于分享链接 `#p-<id>`）：

```
content/posts/harbin-first-snow/
├── index.md        # 正文 + 元信息
├── 01.jpg          # 照片，按文件名顺序展示
└── 02.jpg
```

`index.md` 的写法：

```md
---
title: 哈尔滨的第一场雪
date: 2026-11-14
location: 哈尔滨 · 中央大街
city: 哈尔滨
tags: [旅行, 冬日]
excerpt: 雪落下来的时候，整条街忽然安静了。
captions:
  - 17:42，街灯刚亮起来
  - 手里那块红薯，是那天最暖的东西
---

中央大街的石头路面被雪填平了棱角，走起来有点滑。

我在一家旧书店门口站了很久。老板把收音机音量调小。
```

- 空行分隔段落，段落里的手动换行会被自动合并
- `captions` 可选，按照片文件名顺序一一对应；不写就不显示图片说明
- `alts` 可选，用于图片无障碍描述，默认用标题拼接说明
- 想先存草稿不发布：加一行 `draft: true`
- 照片直接丢进同一个文件夹即可，支持 jpg / png / webp；HEIC / HEIF 会在运行 `build.py` 时自动转成 JPG（长边压到 2560px，原图不会提交到仓库）

改完后运行：

```bash
python3 tools/build.py          # 只重新生成 assets/js/data.js
python3 tools/build.py --push   # 生成并自动提交、推送到 GitHub
```

推上去约 1 分钟后线上生效。

**新建**一篇的文件夹和模板：

```bash
python3 tools/build.py --new shirahama-sea
```

会生成 `content/posts/shirahama-sea/index.md`（日期已填今天），填好内容、放进照片后运行 `build.py --push`。

**删除**一篇：删掉整个文件夹，重新运行 `build.py --push`。
**修改**：直接改 `index.md` 或替换文件夹里的图片，再运行一次。

## 照片水印与版权

每次运行 `build.py` 时，会把 `content/posts/` 里的照片重新生成一份带水印的展示图，输出到 `assets/img/watermark/<slug>/`，网页只引用水印图，原图不会被改动：

- 水印内容：斜向交叉线平铺整张画面，交叉处是倾斜的 `wst` 字样
- 图片 EXIF 里同时写入 `Artist: wst` 和 `Copyright`
- 详情浮层底部显示一行版权说明
- 水印图按源文件的修改时间缓存，改了水印样式想重新生成时，删掉 `assets/img/watermark/` 再运行即可

依赖 Pillow：

```bash
python3 -m pip install --user Pillow
```

## 首屏随机照片

进入首页时，会从所有照片里随机抽 5 张，放在首屏的大屏轮播里（16:9，移动端 4:3）。两侧箭头、底部圆点、键盘 ← →、鼠标拖动、触控板横向滑动、手机左右滑动都能切换，顺序每次刷新都不同。

记录列表固定一行三列（窄屏两列、手机一列），每张封面统一按 4:3 裁切，保证行与行对齐。

## 目录结构

```
.
├── index.html            # 首页：随机照片首屏 + 按年份分组的记录图流
├── content/posts/        # 记录：一篇一个文件夹（index.md + 照片）
├── tools/build.py        # 扫描 content/posts 生成 data.js
├── assets/
│   ├── css/style.css     # 全部样式
│   ├── img/watermark/    # 自动生成的水印图
│   └── js/
│       ├── data.js       # 自动生成，不要手改
│       ├── showcase.js   # 首屏随机 5 张照片与左右切换
│       └── app.js        # 年份分组、筛选、详情浮层、滚动动效
├── .nojekyll             # 跳过 Jekyll 处理
└── README.md
```


## 发布

仓库 `main` 分支根目录直接作为 Pages 站点源：

推送到 `main` 后，GitHub Pages 会自动重新构建，通常一分钟内生效。
