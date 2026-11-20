/* 关于页：把 content/about.md 渲染成现有版式。
   支持的语法：# 标题、## 小标题 | 英文、段落、- 列表、**加粗**、*斜体*、`代码`、[链接](地址)、<br> 换行。 */
(() => {
  'use strict';

  const heroEl = document.getElementById('aboutHeroContent');
  const sectionsEl = document.getElementById('aboutSections');

  const escapeHtml = str => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  function inline(text) {
    return escapeHtml(text)
      .replace(/&lt;br\s*\/?&gt;/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  }

  function parse(markdown) {
    const blocks = [];
    let paragraph = [];
    let list = null;

    const flushParagraph = () => {
      if (paragraph.length) {
        blocks.push({ type: 'p', text: paragraph.join(' ') });
        paragraph = [];
      }
    };
    const flushList = () => {
      if (list) {
        blocks.push({ type: 'ul', items: list });
        list = null;
      }
    };

    markdown.split(/\r?\n/).forEach(raw => {
      const line = raw.trim();

      if (!line) {
        flushParagraph();
        flushList();
        return;
      }

      const heading = line.match(/^(#{1,2})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        flushList();
        const [title, sub] = heading[2].split('|').map(s => s.trim());
        blocks.push({ type: heading[1].length === 1 ? 'h1' : 'h2', text: title, sub: sub || '' });
        return;
      }

      const item = line.match(/^[-*]\s+(.*)$/);
      if (item) {
        flushParagraph();
        list = list || [];
        list.push(item[1]);
        return;
      }

      flushList();
      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    return blocks;
  }

  function renderList(items) {
    const isLinks = items.every(item => /^\[[^\]]+\]\([^)]+\)$/.test(item));
    if (isLinks) {
      return `<div class="link-row">${items
        .map(item => {
          const m = item.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          return `<a class="link-btn" href="${escapeHtml(m[2])}">${inline(m[1])}</a>`;
        })
        .join('')}</div>`;
    }
    return `<div class="topic-list">${items
      .map(item => `<span class="topic">${inline(item)}</span>`)
      .join('')}</div>`;
  }

  function render(blocks) {
    const hero = [];
    const sections = [];
    let current = null;

    blocks.forEach(block => {
      if (block.type === 'h1') {
        hero.push(`<h1>${inline(block.text)}</h1>`);
      } else if (block.type === 'p' && !current && sections.length === 0) {
        hero.push(`<p class="lede">${inline(block.text)}</p>`);
      } else if (block.type === 'h2') {
        current = { title: block.text, sub: block.sub, body: [] };
        sections.push(current);
      } else if (current) {
        if (block.type === 'p') current.body.push(`<p>${inline(block.text)}</p>`);
        if (block.type === 'ul') current.body.push(renderList(block.items));
      }
    });

    heroEl.innerHTML = hero.join('');
    sectionsEl.innerHTML = sections.map(s => `
      <section class="about-section">
        <h2>${inline(s.title)}${s.sub ? `<span>${inline(s.sub)}</span>` : ''}</h2>
        <div class="about-content">${s.body.join('')}</div>
      </section>
    `).join('');
  }

  fetch('content/about.md', { cache: 'no-cache' })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(md => render(parse(md)))
    .catch(err => {
      sectionsEl.innerHTML = `<p class="empty">关于页内容加载失败（${err.message}）。请通过本地服务器或线上地址访问。</p>`;
    });
})();
