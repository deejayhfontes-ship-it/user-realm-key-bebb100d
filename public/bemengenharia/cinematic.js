/* =====================================================================
   BEM Topografia e Engenharia — engine de scroll cinematográfico (v2)
   ---------------------------------------------------------------------
   Sem dependência obrigatória. Se GSAP + ScrollTrigger + Lenis estiverem
   carregados (CDN no index.html), usa os três. Se não, cai em scroll
   nativo com requestAnimationFrame. O site funciona nos dois casos.

   ASSETS POR CENA (substitua os arquivos, não precisa editar código):
     assets/cinematic/scene-NN-start.webp   frame inicial
     assets/cinematic/scene-NN-end.webp     frame final
     assets/cinematic/scene-NN.mp4          vídeo (opcional; só desktop)
     assets/cinematic/scene-NN-mobile.webp  poster mobile (opcional)
   Enquanto um arquivo não existir, o engine usa
     assets/cinematic/placeholders/scene-NN-{start,end}.svg

   CONTRATO COM O HTML:
     [data-scene-root]            seção que define o progresso (0..1)
     .scene[data-scene="NN"]      contêiner onde os frames/vídeo são injetados
       data-mode="pin"            root alto (ex. 220svh) com .scene-stage sticky
       data-mode="bg"             progresso = 0 ao entrar pela base, 1 com o topo a 10% da tela
     [data-scene-reveal][data-at] recebe .is-on quando progresso >= data-at
     [data-draw] (path SVG, pathLength=1000) desenhado por stroke-dashoffset
       data-draw-from / data-draw-to  janela de progresso (0..1)
     CSS var --scene-p no root     progresso bruto para uso em CSS
   ===================================================================== */
(function () {
  'use strict';

  var ASSET_DIR = 'assets/cinematic/';
  var PH_DIR = ASSET_DIR + 'placeholders/';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 760px)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var root = document.documentElement;

  root.dataset.cinematic = reduced ? 'reduced' : (mobile ? 'mobile' : 'full');
  root.dataset.cinematicEngine = (hasGsap && !reduced) ? 'gsap' : 'native';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }

  /* Carrega uma imagem tentando uma cadeia de caminhos; marca placeholder no fim. */
  function loadImg(className, chain) {
    var img = new Image();
    img.className = className;
    img.alt = '';
    img.decoding = 'async';
    var i = 0;
    function next() {
      if (i >= chain.length) return;
      var src = chain[i++];
      img.dataset.placeholder = (i === chain.length) ? 'true' : 'false';
      img.src = src;
    }
    img.addEventListener('error', next);
    next();
    return img;
  }

  /* ---------- montar cenas ---------- */
  var scenes = [];
  var sceneEls = document.querySelectorAll('.scene[data-scene]');
  Array.prototype.forEach.call(sceneEls, function (el) {
    var id = el.dataset.scene;
    var mode = el.dataset.mode || 'bg';
    var rootEl = el.closest('[data-scene-root]') || el.parentElement;

    var start = loadImg('scene-frame scene-frame--start', [
      ASSET_DIR + 'scene-' + id + '-start.webp',
      PH_DIR + 'scene-' + id + '-start.svg'
    ]);
    var endChain = mobile
      ? [ASSET_DIR + 'scene-' + id + '-mobile.webp', ASSET_DIR + 'scene-' + id + '-end.webp', PH_DIR + 'scene-' + id + '-end.svg']
      : [ASSET_DIR + 'scene-' + id + '-end.webp', PH_DIR + 'scene-' + id + '-end.svg'];
    var end = loadImg('scene-frame scene-frame--end', endChain);
    el.appendChild(start);
    el.appendChild(end);

    var scene = {
      id: id,
      mode: mode,
      el: el,
      root: rootEl,
      start: start,
      end: end,
      video: null,
      seeking: false,
      pendingT: -1,
      reveals: rootEl.querySelectorAll('[data-scene-reveal]'),
      draws: rootEl.querySelectorAll('[data-draw]'),
      p: -1,
      lastT: -1
    };
    scenes.push(scene);
  });

  /* Cria o <video> de uma cena. Chamado na hora para a primeira cena e,
     para as demais, so quando a secao se aproxima do viewport (economiza banda). */
  function attachVideo(s) {
    if (s.video || s.videoTried || reduced || mobile) return;
    s.videoTried = true;
    var video = document.createElement('video');
    video.className = 'scene-video';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    var source = document.createElement('source');
    source.src = ASSET_DIR + 'scene-' + s.id + '.mp4';
    source.type = 'video/mp4';
    source.addEventListener('error', function () {
      video.remove();
      s.video = null;
      s.el.classList.remove('has-video');
    });
    video.addEventListener('loadeddata', function () {
      s.el.classList.add('has-video');
      try { video.pause(); } catch (e) {}
      // sincroniza com o progresso atual
      s.lastT = -1;
      seekTo(s, clamp01(s.p < 0 ? 0 : s.p) * (video.duration || 0));
    });
    // fila de seek: um por vez; o ultimo pedido vence
    video.addEventListener('seeked', function () {
      s.seeking = false;
      if (s.pendingT >= 0) { var t = s.pendingT; s.pendingT = -1; seekTo(s, t); }
    });
    video.appendChild(source);
    s.el.appendChild(video);
    s.video = video;
  }

  function seekTo(s, t) {
    var v = s.video;
    if (!v || !v.duration) return;
    if (t > v.duration - 0.04) t = v.duration - 0.04;
    if (t < 0) t = 0;
    if (s.seeking) { s.pendingT = t; return; }
    if (Math.abs(t - s.lastT) < 0.02) return;
    s.lastT = t;
    s.seeking = true;
    try { v.currentTime = t; } catch (err) { s.seeking = false; }
  }

  if (scenes.length) attachVideo(scenes[0]);
  if (!reduced && !mobile && scenes.length > 1 && 'IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var s = scenes.filter(function (x) { return x.root === entry.target; })[0];
        if (s) { attachVideo(s); near.unobserve(entry.target); }
      });
    }, { rootMargin: '250% 0px 250% 0px' });
    scenes.slice(1).forEach(function (s) { near.observe(s.root); });
  } else if (!reduced && !mobile) {
    scenes.slice(1).forEach(attachVideo);
  }

  /* ---------- aplicar progresso ---------- */
  function apply(s, p) {
    p = clamp01(p);
    if (reduced) p = 1;
    if (Math.abs(p - s.p) < 0.0015 && s.p !== -1) return;
    s.p = p;

    s.root.style.setProperty('--scene-p', p.toFixed(4));

    var e = smooth(p);
    s.end.style.opacity = e.toFixed(4);
    // frame inicial cresce levemente; frame final assenta em escala 1 (quadro estável)
    s.start.style.transform = 'scale(' + (1 + 0.06 * p).toFixed(4) + ')';
    s.end.style.transform = 'scale(' + (1.06 - 0.06 * p).toFixed(4) + ')';

    if (s.video && s.el.classList.contains('has-video')) {
      seekTo(s, p * s.video.duration);
    }

    for (var i = 0; i < s.reveals.length; i++) {
      var r = s.reveals[i];
      var at = parseFloat(r.dataset.at || '0.3');
      r.classList.toggle('is-on', p >= at);
    }
    for (var j = 0; j < s.draws.length; j++) {
      var d = s.draws[j];
      var from = parseFloat(d.dataset.drawFrom || '0');
      var to = parseFloat(d.dataset.drawTo || '1');
      var lp = clamp01((p - from) / Math.max(to - from, 0.0001));
      d.style.strokeDashoffset = (1000 * (1 - lp)).toFixed(1);
    }
  }

  function progressOf(s) {
    var r = s.root.getBoundingClientRect();
    var vh = window.innerHeight;
    if (s.mode === 'pin') {
      var total = r.height - vh;
      if (total > 2) return clamp01(-r.top / total);
      return clamp01(-r.top / Math.max(r.height, 1));
    }
    // bg: 0 ao entrar pela base do viewport, 1 quando o topo da secao chega a 10% da tela
    return clamp01((vh - r.top) / (vh * 0.9));
  }

  /* ---------- Lenis (scroll suave) ---------- */
  var lenis = null;
  if (hasLenis && !reduced && !mobile) {
    try {
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      if (hasGsap) {
        window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
        lenis.on('scroll', function () { window.ScrollTrigger.update(); });
      } else {
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
      }
      var anchors = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
      Array.prototype.forEach.call(anchors, function (a) {
        a.addEventListener('click', function (ev) {
          var href = a.getAttribute('href');
          if (!href || href === '#') return;
          var target = document.querySelector(href);
          if (!target) return;
          ev.preventDefault();
          lenis.scrollTo(target, { offset: 0, duration: 1.1 });
          if (history.replaceState) history.replaceState(null, '', href);
        });
      });
      root.dataset.lenis = 'on';
    } catch (err) {
      lenis = null;
      root.dataset.lenis = 'off';
    }
  } else {
    root.dataset.lenis = 'off';
  }

  /* ---------- driver de progresso ---------- */
  var refresh;
  if (reduced) {
    scenes.forEach(function (s) { apply(s, 1); });
    refresh = function () {};
  } else if (hasGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    scenes.forEach(function (s) {
      window.ScrollTrigger.create({
        trigger: s.root,
        start: function () { return s.mode === 'pin' ? 'top top' : 'top bottom'; },
        end: function () {
          if (s.mode !== 'pin') return 'top 10%';
          return (s.root.offsetHeight > window.innerHeight + 2) ? 'bottom bottom' : 'bottom top';
        },
        onUpdate: function (self) { apply(s, self.progress); },
        onRefresh: function (self) { apply(s, self.progress); }
      });
    });
    refresh = function () { window.ScrollTrigger.refresh(); };
    window.addEventListener('load', refresh);
  } else {
    var ticking = false;
    var update = function () {
      ticking = false;
      for (var i = 0; i < scenes.length; i++) apply(scenes[i], progressOf(scenes[i]));
    };
    var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    window.addEventListener('load', request);
    update();
    refresh = update;
  }

  window.BEMCinematic = {
    scenes: scenes,
    lenis: lenis,
    engine: root.dataset.cinematicEngine,
    mode: root.dataset.cinematic,
    refresh: refresh
  };
})();
