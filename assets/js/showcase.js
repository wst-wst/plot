/* 首屏：从全部照片中随机抽 5 张，左右切换。 */
(() => {
  'use strict';

  const stage = document.getElementById('showcaseStage');
  if (!stage) return;

  const indexEl = document.getElementById('scIndex');
  const totalEl = document.getElementById('scTotal');
  const prevBtn = document.getElementById('scPrev');
  const nextBtn = document.getElementById('scNext');
  const lightbox = document.getElementById('lightbox');

  const pad = n => String(n).padStart(2, '0');
  const shuffle = list => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  const allPhotos = PLOG_POSTS.flatMap(post => post.photos.map(photo => ({ post, photo })));
  const picked = shuffle([...allPhotos]).slice(0, Math.min(5, allPhotos.length));

  const formatDate = iso => iso.split('-').join('.');

  const slides = picked.map(({ post, photo }, i) => {
    const fig = document.createElement('figure');
    fig.className = 'showcase-slide' + (i === 0 ? ' is-active' : '');

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    fig.appendChild(img);

    const caption = document.createElement('figcaption');
    caption.className = 'showcase-caption';
    const date = document.createElement('time');
    date.dateTime = post.date;
    date.textContent = formatDate(post.date);
    caption.appendChild(date);
    if (post.city) {
      const city = document.createElement('span');
      city.textContent = post.city;
      caption.appendChild(city);
    }
    fig.appendChild(caption);

    stage.appendChild(fig);
    return fig;
  });

  totalEl.textContent = pad(slides.length);

  const dotsWrap = document.getElementById('scDots');
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `第 ${i + 1} 张`);
    dot.className = i === 0 ? 'is-active' : '';
    dot.addEventListener('click', () => show(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  let current = 0;
  function show(next) {
    if (slides.length < 2) return;
    const target = (next + slides.length) % slides.length;
    if (target === current) return;
    slides[current].classList.remove('is-active');
    slides[target].classList.add('is-active');
    dots[current].classList.remove('is-active');
    dots[target].classList.add('is-active');
    current = target;
    indexEl.textContent = pad(current + 1);
  }

  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  document.addEventListener('keydown', e => {
    if (lightbox && !lightbox.hidden) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  let dragStartX = null;
  let wheelLock = 0;
  const SWIPE_THRESHOLD = 42;

  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartX = e.clientX;
    stage.setPointerCapture?.(e.pointerId);
  });

  stage.addEventListener('pointerup', e => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) show(current + (dx < 0 ? 1 : -1));
  });

  stage.addEventListener('pointercancel', () => {
    dragStartX = null;
  });

  // 触控板 / 鼠标横向滑动
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    const now = Date.now();
    if (now < wheelLock) return;
    wheelLock = now + 400;
    show(current + (e.deltaX > 0 ? 1 : -1));
  }, { passive: true });

  if (slides.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
  }
})();
