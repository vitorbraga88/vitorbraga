/* ═══════════════════════════════════════════════════════════
   main.js — Vitor Braga Landing Page
   Responsabilidades:
     - Partículas do hero
     - Reveal on scroll (IntersectionObserver)
     - Carrossel de memórias (lazy, drag, swipe, teclado)
     - Lightbox
     - Footer ano dinâmico
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── CONFIG ───────────────────────────────────────────── */
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pad = n => String(n).padStart(3, '0');

  // Lista real de arquivos de memória (excluindo perfil), ordenada numericamente
  const arquivos = Array.from({ length: 69 }, (_, i) => `memoria_${pad(i + 1)}.jpg`);

  // Coloca memoria_050 como capa (primeira posição)
  const CAPA = 'memoria_050.jpg';
  const ordenadas = [CAPA, ...arquivos.filter(n => n !== CAPA)];

  const fotos = ordenadas.map((nome, i) => ({
    full:  `assets/memorias/${nome}`,
    thumb: `assets/memorias/thumbnails/${nome}`,
    alt:   i === 0 ? 'Capa — Memória 50' : `Memória ${nome.match(/\d+/)[0]}`
  }));

  const TOTAL_FOTOS = fotos.length; // 69

  /* ─── FOOTER ANO ────────────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── PARTÍCULAS HERO ───────────────────────────────────── */
  function initParticles() {
    if (REDUCED_MOTION) return;
    const container = document.getElementById('particles');
    if (!container) return;

    const count = 28;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.cssText = [
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `--dur:${3 + Math.random() * 5}s`,
        `--delay:${Math.random() * 6}s`,
        `opacity:0`
      ].join(';');
      container.appendChild(el);
    }
  }

  /* ─── REVEAL ON SCROLL ──────────────────────────────────── */
  function initReveal() {
    if (REDUCED_MOTION) return;
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => io.observe(el));
  }

  /* ─── CARROSSEL ─────────────────────────────────────────── */
  function initCarousel() {
    const track   = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const counter = document.getElementById('carouselCounter');
    const dotsWrap = document.getElementById('carouselDots');

    if (!track) return;

    let current = 0;
    let isDragging = false;
    let startX = 0;
    let dragDelta = 0;
    const loadedIndexes = new Set();

    // ── Constrói slides ──
    fotos.forEach((foto, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel__slide';
      slide.setAttribute('role', 'tabpanel');
      slide.setAttribute('aria-label', `Foto ${i + 1} de ${fotos.length}`);
      slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
      slide.dataset.index = i;

      const inner = document.createElement('div');
      inner.className = 'carousel__slide-inner';

      // Placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'carousel__placeholder';
      placeholder.innerHTML = `
        <span class="carousel__placeholder-num">${i + 1}</span>
        <span>📷 Foto ${i + 1}</span>
      `;
      inner.appendChild(placeholder);

      // Imagem (lazy)
      const img = document.createElement('img');
      img.className = 'carousel__img is-loading';
      img.alt = foto.alt;
      img.dataset.thumb = foto.thumb;
      img.dataset.full  = foto.full;

      img.addEventListener('load', () => {
        img.classList.remove('is-loading');
        img.classList.add('is-loaded');
        placeholder.style.display = 'none';
      });

      img.addEventListener('error', () => {
        // thumb falhou — mantém placeholder
        img.style.display = 'none';
      });

      inner.appendChild(img);
      slide.appendChild(inner);

      // Clique → lightbox
      slide.addEventListener('click', () => {
        if (Math.abs(dragDelta) < 5) openLightbox(i);
      });

      track.appendChild(slide);
    });

    // ── Dots ──
    fotos.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para foto ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    // ── Lazy load — carrega full diretamente (sem desfoque) ──
    function loadSlide(index) {
      if (loadedIndexes.has(index)) return;
      loadedIndexes.add(index);
      const slide = track.children[index];
      if (!slide) return;
      const img = slide.querySelector('.carousel__img');
      if (!img) return;
      img.src = img.dataset.full;
    }

    // Pré-carrega slides vizinhos
    function preload(index) {
      [index - 1, index, index + 1].forEach(i => {
        if (i >= 0 && i < TOTAL_FOTOS) loadSlide(i);
      });
    }

    // ── Renderiza posição ──
    function render() {
      if (!REDUCED_MOTION) {
        track.style.transition = `transform ${300}ms cubic-bezier(0.22,1,0.36,1)`;
      }
      track.style.transform = `translateX(-${current * 100}%)`;

      // Atualiza aria
      Array.from(track.children).forEach((slide, i) => {
        slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      });

      // Counter
      counter.textContent = `${current + 1} / ${TOTAL_FOTOS}`;

      // Dots
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });

      // Botões
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === TOTAL_FOTOS - 1;

      preload(current);
    }

    function goTo(index) {
      current = Math.max(0, Math.min(TOTAL_FOTOS - 1, index));
      render();
    }

    function prev() { goTo(current - 1); }
    function next() { goTo(current + 1); }

    // ── Controles setas ──
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // ── Teclado (quando foco no carrossel) ──
    const carouselEl = track.closest('.carousel');
    carouselEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    });

    // ── Drag / Swipe ──
    function onPointerDown(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      dragDelta = 0;
      track.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      dragDelta = x - startX;
      const offset = -(current * 100) + (dragDelta / track.parentElement.offsetWidth) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      const threshold = track.parentElement.offsetWidth * 0.2;
      if (dragDelta < -threshold) next();
      else if (dragDelta > threshold) prev();
      else render();
    }

    track.addEventListener('mousedown', onPointerDown);
    track.addEventListener('mousemove', onPointerMove);
    track.addEventListener('mouseup', onPointerUp);
    track.addEventListener('mouseleave', onPointerUp);

    track.addEventListener('touchstart', onPointerDown, { passive: true });
    track.addEventListener('touchmove', onPointerMove, { passive: true });
    track.addEventListener('touchend', onPointerUp);

    // ── Init ──
    render();
  }

  /* ─── LIGHTBOX ──────────────────────────────────────────── */
  function initLightbox() {
    const lb         = document.getElementById('lightbox');
    const backdrop   = document.getElementById('lightboxBackdrop');
    const lbImg      = document.getElementById('lightboxImg');
    const lbClose    = document.getElementById('lightboxClose');
    const lbPrev     = document.getElementById('lightboxPrev');
    const lbNext     = document.getElementById('lightboxNext');
    const lbCounter  = document.getElementById('lightboxCounter');
    const spinner    = lb ? lb.querySelector('.lightbox__spinner') : null;

    if (!lb) return;

    let currentLb = 0;
    let prevFocus = null;

    function loadLbImage(index) {
      const foto = fotos[index];
      lbImg.style.opacity = '0';
      if (spinner) spinner.classList.add('is-loading');

      // Tenta full, fallback para thumb
      const tryLoad = (src, fallback) => {
        const tmp = new Image();
        tmp.onload = () => {
          lbImg.src = src;
          lbImg.alt = foto.alt;
          lbImg.style.opacity = '1';
          if (spinner) spinner.classList.remove('is-loading');
        };
        tmp.onerror = () => {
          if (fallback) tryLoad(fallback, null);
          else {
            if (spinner) spinner.classList.remove('is-loading');
          }
        };
        tmp.src = src;
      };

      tryLoad(foto.full, foto.thumb);
      lbCounter.textContent = `${index + 1} / ${TOTAL_FOTOS}`;
      lbPrev.disabled = index === 0;
      lbNext.disabled = index === TOTAL_FOTOS - 1;
    }

    window.openLightbox = function (index) {
      currentLb = index;
      prevFocus = document.activeElement;
      lb.removeAttribute('hidden');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      loadLbImage(currentLb);
      lbClose.focus();
    };

    function closeLightbox() {
      lb.setAttribute('hidden', '');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      if (prevFocus) prevFocus.focus();
    }

    function lbPrevFn() {
      if (currentLb > 0) { currentLb--; loadLbImage(currentLb); }
    }

    function lbNextFn() {
      if (currentLb < TOTAL_FOTOS - 1) { currentLb++; loadLbImage(currentLb); }
    }

    lbClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', lbPrevFn);
    lbNext.addEventListener('click', lbNextFn);

    document.addEventListener('keydown', e => {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { lbPrevFn(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { lbNextFn(); e.preventDefault(); }
    });

    // Trap focus dentro do lightbox
    lb.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(lb.querySelectorAll('button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
    });
  }

  /* ─── TECLADO GLOBAL (fora do carrossel / lightbox) ─────── */
  // As setas já funcionam via handlers específicos acima

  /* ─── INIT ──────────────────────────────────────────────── */
  function init() {
    initParticles();
    initReveal();
    initCarousel();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
