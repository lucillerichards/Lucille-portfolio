/* Shared navigation, video and interactive gallery behaviours. */
function setupMobileMenu() {
  const menu = document.querySelector('.mobile-menu');
  const open = document.querySelector('.menu-toggle');
  const close = document.querySelector('.mobile-close');
  if (!menu || !open || !close) return;
  const dismiss = () => { menu.classList.remove('is-open'); document.body.classList.remove('menu-open'); open.setAttribute('aria-expanded', 'false'); open.focus(); };
  open.addEventListener('click', () => { menu.classList.add('is-open'); document.body.classList.add('menu-open'); open.setAttribute('aria-expanded', 'true'); close.focus(); });
  close.addEventListener('click', dismiss);
  menu.addEventListener('click', e => { if (e.target.matches('a')) { menu.classList.remove('is-open'); document.body.classList.remove('menu-open'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) dismiss(); });
}
/* Video posters are real YouTube links, so they always work if the page
   is opened as file:// or JavaScript is unavailable. On a hosted site,
   clicking the poster progressively enhances it into an embedded player. */
function setupVideoPlayers() {
  const canEmbed = /^https?:$/.test(window.location.protocol);
  document.querySelectorAll('.video-placeholder[data-youtube-id]').forEach(link => {
    const id = link.dataset.youtubeId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const box = link.closest('.video-box');
    if (!box) return;
    const watchLink = document.createElement('a');
    watchLink.className = 'video-watch-link';
    watchLink.href = `https://www.youtube.com/watch?v=${id}`;
    watchLink.target = '_blank';
    watchLink.rel = 'noopener noreferrer';
    watchLink.textContent = 'WATCH ON YOUTUBE';
    watchLink.setAttribute('aria-label', 'Watch on YouTube (opens in a new tab)');
    box.appendChild(watchLink);

    if (!canEmbed) return; // The poster remains a working external link.
    link.addEventListener('click', event => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.title = link.getAttribute('aria-label') || 'YouTube video';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'eager');
      const params = new URLSearchParams({ autoplay:'1', rel:'0', playsinline:'1', origin:window.location.origin });
      iframe.src = `https://www.youtube.com/embed/${id}?${params.toString()}`;
      link.replaceWith(iframe);
      watchLink.classList.add('is-playing');
    }, { once:true });
  });
}
function setupAssetFallbacks() {
  document.querySelectorAll('img[data-optional-image]').forEach(img => {
    const fail = () => img.classList.add('is-missing');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });
}
function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(item => item.classList.add('is-visible')); return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { rootMargin: '0px 0px -35px 0px', threshold: .02 });
  items.forEach(item => observer.observe(item));
}
function setupPhotoLightbox() {
  const modal = document.querySelector('.photo-lightbox');
  if (!modal) return;
  const links = [...document.querySelectorAll('.headshot-gallery .headshot-photo')];
  const img = modal.querySelector('.photo-lightbox-image');
  const counter = modal.querySelector('.photo-lightbox-count');
  const closeButton = modal.querySelector('.photo-lightbox-close');
  const prev = modal.querySelector('.photo-lightbox-prev');
  const next = modal.querySelector('.photo-lightbox-next');
  let current = 0;
  let lastFocus = null;
  const show = index => {
    current = (index + links.length) % links.length;
    img.src = links[current].getAttribute('href');
    img.alt = links[current].querySelector('img')?.alt || 'Headshot';
    counter.textContent = `${current + 1} / ${links.length}`;
  };
  const open = index => {
    lastFocus = document.activeElement;
    show(index);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('photo-lightbox-open');
    closeButton.focus();
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    img.removeAttribute('src');
    document.body.classList.remove('photo-lightbox-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };
  links.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault();
    open(i);
  }));
  closeButton.addEventListener('click', close);
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    else if (event.key === 'Tab') {
      const controls = [closeButton, prev, next];
      const i = controls.indexOf(document.activeElement);
      if (event.shiftKey && (i <= 0)) { event.preventDefault(); next.focus(); }
      else if (!event.shiftKey && i === controls.length - 1) { event.preventDefault(); closeButton.focus(); }
    }
  });
}
setupMobileMenu(); setupVideoPlayers(); setupAssetFallbacks(); setupReveal(); setupPhotoLightbox();
