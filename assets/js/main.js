/* ============ Стиль Собачки — main.js ============ */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Preloader ---------- */
  const finishLoad = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  };
  window.addEventListener('load', () => setTimeout(finishLoad, reduce ? 0 : 500));
  setTimeout(finishLoad, 2600); // страховка

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Split headings into words ---------- */
  $$('.split').forEach(el => {
    const nodes = [...el.childNodes];
    el.innerHTML = '';
    let i = 0;
    const addWord = (word, wrapTag) => {
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.style.transitionDelay = (i++ * 0.06) + 's';
      if (wrapTag) {
        const t = document.createElement(wrapTag);
        t.textContent = word;
        inner.appendChild(t);
      } else inner.textContent = word;
      w.appendChild(inner);
      el.appendChild(w);
      el.appendChild(document.createTextNode(' '));
    };
    nodes.forEach(n => {
      const text = n.textContent;
      const tag = n.nodeType === 1 ? n.tagName.toLowerCase() : null;
      if (tag === 'br') { el.appendChild(document.createElement('br')); return; }
      text.split(/\s+/).filter(Boolean).forEach(word => addWord(word, tag));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal-up, .reveal-clip, .split, .furmeter__bar').forEach((el, idx) => {
    if (el.classList.contains('reveal-up')) {
      const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal-up')) : [];
      const pos = sib.indexOf(el);
      if (pos > 0) el.style.transitionDelay = Math.min(pos * 0.08, 0.4) + 's';
    }
    io.observe(el);
  });

  /* ---------- Header: scroll state, hide on scroll down, progress ---------- */
  const header = $('#header');
  const progress = $('.progress span');
  const mobileBar = $('.mobile-bar');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    header.classList.toggle('is-scrolled', y > 20);
    if (!header.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 500);
    }
    if (mobileBar) mobileBar.classList.toggle('is-show', y > innerHeight * 0.6);
    lastY = y;
    updateSteps();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__link');
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(l => { const s = $(l.getAttribute('href')); if (s) sectionIO.observe(s); });

  /* ---------- Burger ---------- */
  const burger = $('#burger'), nav = $('#nav');
  const closeMenu = () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open');
    header.classList.remove('menu-open'); document.body.classList.remove('is-locked');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Открыть меню');
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    if (!open) return closeMenu();
    burger.classList.add('is-open'); nav.classList.add('is-open');
    header.classList.add('menu-open'); header.classList.remove('is-hidden');
    document.body.classList.add('is-locked');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Закрыть меню');
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 980 && nav.classList.contains('is-open')) closeMenu(); });

  /* ---------- Custom cursor ---------- */
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor__label');
  if (finePointer && !reduce && cursor) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    const loop = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target;
      if (t.closest('.g-item')) { cursor.className = 'cursor is-view'; cursorLabel.textContent = 'смотреть'; }
      else if (t.closest('.ba__compare')) { cursor.className = 'cursor is-view'; cursorLabel.textContent = 'тянуть'; }
      else if (t.closest('a, button, label, summary, input')) { cursor.className = 'cursor is-hover'; cursorLabel.textContent = ''; }
      else { cursor.className = 'cursor'; cursorLabel.textContent = ''; }
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Hero parallax ---------- */
  const heroVisual = $('#heroVisual');
  if (heroVisual && finePointer && !reduce) {
    const cards = $$('[data-depth]', heroVisual);
    $('.hero').addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      cards.forEach(c => {
        const d = parseFloat(c.dataset.depth);
        c.style.transform = `translate(${x * d * -30}px, ${y * d * -24}px)`;
      });
    });
  }

  /* ---------- Hero soap bubbles (canvas) ---------- */
  const canvas = $('#bubbles');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr, bubbles = [], mouse = { x: -999, y: -999 }, running = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = (initial) => ({
      x: Math.random() * W,
      y: initial ? Math.random() * H : H + 40,
      r: 6 + Math.random() * (W < 640 ? 18 : 30),
      s: 0.25 + Math.random() * 0.6,
      w: Math.random() * Math.PI * 2,
      hue: [265, 25, 330][Math.floor(Math.random() * 3)],
      pop: 0
    });
    resize();
    const count = W < 640 ? 14 : 26;
    for (let i = 0; i < count; i++) bubbles.push(make(true));
    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) draw(); }).observe(canvas);
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach((b, i) => {
        b.y -= b.s; b.w += 0.02; b.x += Math.sin(b.w) * 0.4;
        const dx = b.x - mouse.x, dy = b.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < b.r + 6 && !b.pop) b.pop = 1;
        if (b.pop) { b.pop += 0.08; if (b.pop > 1.8) { bubbles[i] = make(false); return; } }
        if (b.y < -60) { bubbles[i] = make(false); return; }
        const r = b.r * (b.pop ? b.pop : 1);
        const alpha = b.pop ? Math.max(0, 1.8 - b.pop) : 1;
        ctx.globalAlpha = alpha;
        const g = ctx.createRadialGradient(b.x - r * .35, b.y - r * .35, r * .1, b.x, b.y, r);
        g.addColorStop(0, 'rgba(255,255,255,.55)');
        g.addColorStop(.7, `hsla(${b.hue},70%,80%,.10)`);
        g.addColorStop(1, `hsla(${b.hue},70%,60%,.35)`);
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = `hsla(${b.hue},60%,60%,.35)`; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x - r * .4, b.y - r * .4, r * .18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; countIO.unobserve(el);
      const isFloat = el.hasAttribute('data-count-float');
      const end = parseFloat(el.dataset.count || el.dataset.countFloat);
      if (reduce) return;
      const t0 = performance.now(), dur = 1600;
      const step = t => {
        const p = Math.min((t - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = isFloat ? v.toFixed(1) : Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count], [data-count-float]').forEach(el => countIO.observe(el));

  /* ---------- Services accordion + floating preview ---------- */
  const svcItems = $$('.svc__item');
  svcItems.forEach(item => {
    const row = $('.svc__row', item);
    row.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      svcItems.forEach(i => { i.classList.remove('is-open'); $('.svc__row', i).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); row.setAttribute('aria-expanded', 'true'); }
    });
  });
  const preview = $('#svcPreview');
  if (preview && finePointer && !reduce) {
    const pImg = $('img', preview);
    let px = 0, py = 0, tx = 0, ty = 0, active = false;
    svcItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (item.classList.contains('is-open')) return;
        pImg.src = item.dataset.img; preview.classList.add('is-on'); active = true;
      });
      item.addEventListener('mouseleave', () => { preview.classList.remove('is-on'); active = false; });
      item.addEventListener('click', () => preview.classList.remove('is-on'));
    });
    window.addEventListener('mousemove', e => { tx = e.clientX + 30; ty = e.clientY - 160; });
    const loop = () => {
      px += (tx - px) * 0.14; py += (ty - py) * 0.14;
      preview.style.transform = `translate(${px}px, ${py}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Before / After ---------- */
  const compare = $('#compare'), range = $('#baRange');
  if (compare && range) {
    const setPos = v => compare.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => setPos(range.value));
    // подсказка-анимация при первом показе
    const hintIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || reduce) return;
      hintIO.disconnect();
      const t0 = performance.now();
      const anim = t => {
        const p = Math.min((t - t0) / 1800, 1);
        const v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
        setPos(v); range.value = v;
        if (p < 1) requestAnimationFrame(anim);
      };
      setTimeout(() => requestAnimationFrame(anim), 700);
    }, { threshold: 0.5 });
    hintIO.observe(compare);

    const tabs = $$('.ba__tab'), info = $('.ba__info');
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      $('#baBefore').src = tab.dataset.before;
      $('#baAfter').src = tab.dataset.after;
      $('#baName').textContent = tab.dataset.name;
      $('#baDesc').textContent = tab.dataset.desc;
      info.classList.remove('is-swap'); void info.offsetWidth; info.classList.add('is-swap');
      range.value = 50; setPos(50);
    }));
  }

  /* ---------- Process steps ---------- */
  const steps = $$('.step'), stepsEl = $('#steps'), stepsLine = $('.steps__line span');
  function updateSteps() {
    if (!stepsEl) return;
    const r = stepsEl.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
    stepsLine.style.transform = `scaleY(${p})`;
    steps.forEach(s => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('is-active', sr.top < mid);
    });
  }
  updateSteps();

  /* ---------- Tilt card ---------- */
  if (finePointer && !reduce) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Gallery filter ---------- */
  const filters = $$('.filter'), gItems = $$('.g-item');
  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('is-active'));
    f.classList.add('is-active');
    const cat = f.dataset.filter;
    gItems.forEach((it, i) => {
      const show = cat === 'all' || it.dataset.cat === cat;
      it.classList.toggle('is-hidden', !show);
      it.classList.remove('is-pop');
      if (show) { void it.offsetWidth; it.style.animationDelay = (i % 8) * 0.04 + 's'; it.classList.add('is-pop'); }
    });
  }));

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbIndex = 0;
  const visibleItems = () => gItems.filter(i => !i.classList.contains('is-hidden'));
  const showLb = idx => {
    const list = visibleItems();
    lbIndex = (idx + list.length) % list.length;
    const it = list[lbIndex], img = $('img', it);
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = $('figcaption', it)?.textContent || '';
  };
  gItems.forEach(it => it.addEventListener('click', () => {
    showLb(visibleItems().indexOf(it));
    lb.classList.add('is-open'); document.body.classList.add('is-locked');
  }));
  const closeLb = () => { lb.classList.remove('is-open'); document.body.classList.remove('is-locked'); };
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex - 1); });
  $('#lbNext').addEventListener('click', e => { e.stopPropagation(); showLb(lbIndex + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Reviews slider ---------- */
  const track = $('#reviewsTrack');
  if (track) {
    const by = dir => {
      const card = $('.review', track);
      track.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: reduce ? 'auto' : 'smooth' });
    };
    $('#revPrev').addEventListener('click', () => by(-1));
    $('#revNext').addEventListener('click', () => by(1));
  }

  /* ---------- Quiz ---------- */
  const quiz = $('#quiz');
  if (quiz) {
    const stepsQ = $$('.quiz__step', quiz), next = $('#quizNext'), back = $('#quizBack'), bar = $('#quizBar');
    let cur = 1;
    const valid = () => {
      if (cur === 1) return !!$('input[name="pet"]:checked', quiz);
      if (cur === 2) return !!$('input[name="size"]:checked', quiz);
      if (cur === 3) return $$('input[name="svc"]:checked', quiz).length > 0;
      return true;
    };
    const buildMsg = () => {
      const pet = $('input[name="pet"]:checked', quiz)?.value || '';
      const size = $('input[name="size"]:checked', quiz)?.value || '';
      const svc = $$('input[name="svc"]:checked', quiz).map(i => i.value).join(', ');
      return `Здравствуйте! Хочу записаться в «Стиль Собачки».\nПитомец: ${pet}, ${size}.\nУслуги: ${svc}.\nПодскажите, пожалуйста, стоимость и свободное время.`;
    };
    const go = n => {
      cur = n;
      stepsQ.forEach(s => s.classList.toggle('is-active', +s.dataset.step === cur));
      bar.style.width = (cur / 4 * 100) + '%';
      back.disabled = cur === 1;
      next.disabled = !valid();
      quiz.classList.toggle('is-done', cur === 4);
      if (cur === 4) {
        const msg = buildMsg();
        $('#quizMsg').textContent = msg;
        $('#sendWa').href = 'https://wa.me/79179690712?text=' + encodeURIComponent(msg);
      }
    };
    quiz.addEventListener('change', e => {
      next.disabled = !valid();
      if (e.target.type === 'radio' && cur < 3) setTimeout(() => go(cur + 1), 350);
    });
    next.addEventListener('click', () => { if (valid() && cur < 4) go(cur + 1); });
    back.addEventListener('click', () => { if (cur > 1) go(cur - 1); });
    quiz.addEventListener('submit', e => e.preventDefault());
    const copyBtn = $('#copyMsg');
    copyBtn.addEventListener('click', async () => {
      const text = $('#quizMsg').textContent;
      try { await navigator.clipboard.writeText(text); copyBtn.textContent = 'Скопировано ✓'; }
      catch (err) {
        const r = document.createRange(); r.selectNodeContents($('#quizMsg'));
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        copyBtn.textContent = 'Текст выделен, нажмите Ctrl+C';
      }
      setTimeout(() => { copyBtn.textContent = 'Скопировать текст'; }, 2500);
    });
    go(1);
  }

  /* ---------- Yandex map (на реальном хостинге) ---------- */
  const map = $('#map');
  if (map && !/claude|anthropic/.test(location.hostname)) {
    const mapIO = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      mapIO.disconnect();
      const f = document.createElement('iframe');
      f.src = 'https://yandex.ru/map-widget/v1/?oid=79488590921&z=16';
      f.title = 'Стиль Собачки на Яндекс Картах';
      f.loading = 'lazy';
      f.setAttribute('allowfullscreen', '');
      map.appendChild(f);
    }, { rootMargin: '300px' });
    mapIO.observe(map);
  }

  /* ---------- Cookie banner ---------- */
  const cookie = $('#cookie');
  if (cookie && !store.get('ds_cookie')) {
    setTimeout(() => cookie.classList.add('is-show'), 2200);
    const hide = val => { store.set('ds_cookie', val); cookie.classList.remove('is-show'); };
    $('#cookieOk').addEventListener('click', () => hide('all'));
    $('#cookieMin').addEventListener('click', () => hide('necessary'));
  }

  onScroll();
})();
