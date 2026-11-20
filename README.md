# wst plog

生活影像记录站：照片为主，配短文、日期与标签。纯静态 HTML / CSS / JavaScript，零依赖、零构建，直接托管在 GitHub Pages。

线上地址：https://wst-wst.github.io/plot

## 本地预览

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。

## 新增一篇记录

所有内容集中在 `assets/js/data.js` 的 `PLOG_POSTS` 数组里，追加一个对象即可：

```js
{
  id: 'unique-slug',            // 唯一标识，用于分享链接 #p-unique-slug
  title: '标题',
  date: '2026-12-01',
  location: '城市 · 具体地点',
  city: '城市',                 // 用于统计「座城市」
  tags: ['旅行', '冬日'],        // 首页筛选标签
  ratio: '4 / 3',               // 封面比例：4 / 3、3 / 4 或 1 / 1
  excerpt: '一句话摘要，显示在卡片上',
  body: ['正文第一段', '正文第二段'],
  photos: [
    {
      src: '图片地址',
      alt: '图片描述（无障碍与 SEO）',
      caption: '图片下方的小字说明'
    }
  ]
}
```

换成自己的照片时，把图片放进新建的 `assets/img/` 目录，`src` 写成相对路径即可，例如 `assets/img/2026-12-01-01.jpg`。

## 修改关于页

关于页正文在 `content/about.md`，改完保存即可，页面会自动渲染成现有版式。支持的写法：

```md
# 大标题<br>需要换行时用 br

首段文字会显示成大号导语。

## 小标题 | English Subtitle

普通段落。支持 **加粗**、*斜体*、`行内代码` 和 [链接](https://example.com)。

- 普通列表会渲染成标签胶囊
- 再写一条

## 联系 | Contact

- [GitHub ↗](https://github.com/wst-wst)
- [看看最近的记录 →](index.html)
```

列表里的每一项都是链接时，会自动渲染成一排按钮；否则渲染成标签。人像图片仍在 `about.html` 中固定。

## 目录结构

```
.
├── index.html            # 首页：首屏 + 记录图流
├── about.html            # 关于页（正文由 Markdown 渲染）
├── content/
│   └── about.md          # 关于页正文
├── assets/
│   ├── css/style.css     # 全部样式
│   └── js/
│       ├── data.js       # 记录数据（新增内容只改这里）
│       ├── app.js        # 筛选、详情浮层、滚动动效
│       └── about.js      # 把 about.md 渲染成页面
├── .nojekyll             # 跳过 Jekyll 处理
└── README.md
```


## 发布

仓库 `main` 分支根目录直接作为 Pages 站点源：

推送到 `main` 后，GitHub Pages 会自动重新构建，通常一分钟内生效。
