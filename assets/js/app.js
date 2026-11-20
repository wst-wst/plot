(() => {
  'use strict';

  const posts = [...PLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
  const emptyEl = document.getElementById('empty');
  const lightbox = document.getElementById('lightbox');
  const lbMedia = document.getElementById('lbMedia');
  const lbMeta = document.getElementById('lbMeta');
  const lbTitle = document.getElementById('lbTitle');
  const lbText = document.getElementById('lbText');
  const lbTags = document.getElementById('lbTags');

  const state = {
    tag: '全部',
    visible: posts,
    index: -1,
    lastFocus: null
  };

  const pad = n => String(n).padStart(2, '0');
  const formatDate = iso => {
    const [y, m, d] = iso.split('-');
    return `${y}.${m}.${d}`;
  };
  const shortDate = iso => {
    const [, m, d] = iso.split('-');
    return `${m}.${d}`;
  };

  /* ---------- 统计数字 ---------- */
  const statPosts = document.getElementById('statPosts');
  const statCities = document.getElementById('statCities');
  const statPhotos = document.getElementById('statPhotos');
  if (statPosts) statPosts.textContent = posts.length;
  if (statCities) statCities.textContent = new Set(posts.map(p => p.city)).size;
  if (statPhotos) statPhotos.textContent = posts.reduce((sum, p) => sum + p.photos.length, 0);

  /* ---------- 标签筛选 ---------- */
  function renderFilters() {
    const counts = new Map();
    posts.forEach(p => p.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'));

    const items = [['全部', posts.length], ...tags];
    filtersEl.innerHTML = '';
    items.forEach(([tag, count]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (tag === state.tag ? ' is-active' : '');
      btn.dataset.tag = tag;
      btn.setAttribute('aria-pressed', String(tag === state.tag));
      btn.innerHTML = `${tag}<span class="chip-count">${count}</span>`;
      btn.addEventListener('click', () => {
        if (state.tag === tag) return;
        state.tag = tag;
        filtersEl.querySelectorAll('.chip').forEach(el => {
          const active = el.dataset.tag === tag;
          el.classList.toggle('is-active', active);
          el.setAttribute('aria-pressed', String(active));
        });
        renderGrid();
      });
      filtersEl.appendChild(btn);
    });
  }

  /* ---------- 卡片列表 ---------- */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;

  function renderGrid() {
    state.visible = state.tag === '全部'
      ? posts
      : posts.filter(p => p.tags.includes(state.tag));

    grid.innerHTML = '';
    emptyEl.hidden = state.visible.length > 0;

    state.visible.forEach((post, i) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.style.setProperty('--ratio', post.ratio);
      card.style.transitionDelay = `${Math.min(i, 5) * 60}ms`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-btn';
      btn.setAttribute('aria-label', `打开记录：${post.title}`);

      const figure = document.createElement('figure');
      figure.className = 'card-figure';
      const img = document.createElement('img');
      img.src = post.photos[0].src;
      img.alt = post.photos[0].alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      figure.appendChild(img);

      const arrow = document.createElement('span');
      arrow.className = 'card-arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      figure.appendChild(arrow);

      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `
        <p class="card-meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span class="sep">·</span><span>${post.city}</span></p>
        <h3 class="card-title">${post.title}</h3>
        <p class="card-excerpt">${post.excerpt}</p>
      `;

      btn.appendChild(figure);
      btn.appendChild(body);
      btn.addEventListener('click', () => openLightbox(i));
      card.appendChild(btn);
      grid.appendChild(card);

      if (revealObserver) revealObserver.observe(card);
      else card.classList.add('is-in');
    });
  }

  /* ---------- 详情浮层 ---------- */
  function renderLightbox(post) {
    lbMedia.innerHTML = '';
    post.photos.forEach(photo => {
      const fig = document.createElement('figure');
      fig.className = 'lb-photo';
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'eager';
      img.decoding = 'async';
      fig.appendChild(img);
      if (photo.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = photo.caption;
        fig.appendChild(cap);
      }
      lbMedia.appendChild(fig);
    });

    lbMeta.textContent = `${formatDate(post.date)} · ${post.location}`;
    lbTitle.textContent = post.title;
    lbText.innerHTML = post.body.map(p => `<p>${p}</p>`).join('');
    lbTags.innerHTML = post.tags.map(t => `<span class="tag">#${t}</span>`).join('');
    lbMedia.scrollTop = 0;
    lightbox.querySelector('.lightbox-panel').scrollTop = 0;
  }

  function openLightbox(index) {
    if (index < 0 || index >= state.visible.length) return;
    state.index = index;
    state.lastFocus = document.activeElement;
    renderLightbox(state.visible[index]);
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lightbox.querySelector('.lb-close').focus({ preventScroll: true });
    history.replaceState(null, '', `#p-${state.visible[index].id}`);
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    state.index = -1;
    history.replaceState(null, '', location.pathname + location.search);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
    setTimeout(() => { lightbox.hidden = true; }, delay);
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus({ preventScroll: true });
  }

  function step(delta) {
    if (state.index < 0) return;
    const next = (state.index + delta + state.visible.length) % state.visible.length;
    state.index = next;
    renderLightbox(state.visible[next]);
    history.replaceState(null, '', `#p-${state.visible[next].id}`);
  }

  lightbox.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeLightbox();
  });
  document.getElementById('lbPrev').addEventListener('click', () => step(-1));
  document.getElementById('lbNext').addEventListener('click', () => step(1));

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 页头滚动状态 ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 初始化 ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  renderFilters();
  renderGrid();

  const hash = decodeURIComponent(location.hash.replace(/^#p-/, ''));
  if (location.hash.startsWith('#p-') && hash) {
    const idx = state.visible.findIndex(p => p.id === hash);
    if (idx >= 0) openLightbox(idx);
  }
})();
