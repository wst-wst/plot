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

  const allPhotos = PLOG_POSTS.flatMap(post => post.photos);
  const picked = shuffle([...allPhotos]).slice(0, Math.min(5, allPhotos.length));

  const slides = picked.map((photo, i) => {
    const fig = document.createElement('figure');
    fig.className = 'showcase-slide' + (i === 0 ? ' is-active' : '');

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    fig.appendChild(img);

    stage.appendChild(fig);
    return fig;
  });

  totalEl.textContent = pad(slides.length);

  let current = 0;
  function show(next) {
    if (slides.length < 2) return;
    const target = (next + slides.length) % slides.length;
    if (target === current) return;
    slides[current].classList.remove('is-active');
    slides[target].classList.add('is-active');
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

  let startX = null;
  stage.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  stage.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
  });

  if (slides.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
  }
})();
