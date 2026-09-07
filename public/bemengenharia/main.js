(function () {
  'use strict';
  var root = document.documentElement;
  var hero = document.querySelector('[data-hero]');
  var processSection = document.querySelector('[data-process]');
  var field = document.querySelector('.topographic-field');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = 0;

  function clamp(value, min, max) {
    return Math.min(max == null ? 1 : max, Math.max(min == null ? 0 : min, value));
  }

  function updateScroll() {
    raf = 0;
    root.dataset.scrolled = window.scrollY > 28 ? 'true' : 'false';
    if (reduced) return;

    if (hero) {
      var heroRect = hero.getBoundingClientRect();
      var heroRange = Math.max(hero.offsetHeight * 0.72, 1);
      var heroProgress = clamp(-heroRect.top / heroRange);
      root.style.setProperty('--hero-shift', Math.round(heroProgress * -92) + 'px');
      root.style.setProperty('--hero-scale', String(1 + heroProgress * 0.08));
      root.style.setProperty('--hero-contour-opacity', String(1 - heroProgress * 0.72));
      root.style.setProperty('--hero-grid-opacity', String(0.08 + heroProgress * 0.54));
      root.style.setProperty('--hero-grid-shift', Math.round(heroProgress * 16) + 'px');
    }

    if (processSection) {
      var rect = processSection.getBoundingClientRect();
      var viewport = window.innerHeight;
      var progress = clamp((viewport * 0.78 - rect.top) / Math.max(rect.height * 0.78, 1));
      root.style.setProperty('--process-dash', String(1000 - progress * 1000));
    }
  }

  function requestUpdate() {
    if (!raf) raf = window.requestAnimationFrame(updateScroll);
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (item) { item.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (item) { observer.observe(item); });
  }

  if (field && !reduced) {
    field.addEventListener('pointermove', function (event) {
      var rect = field.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      field.style.setProperty('--pointer-x', (x * 18) + 'px');
      field.style.setProperty('--pointer-y', (y * 18) + 'px');
      field.style.setProperty('--pointer-x-inv', (x * -6.3) + 'px');
      field.style.setProperty('--pointer-y-inv', (y * -6.3) + 'px');
      field.style.setProperty('--target-x', (event.clientX - rect.left) + 'px');
      field.style.setProperty('--target-y', (event.clientY - rect.top) + 'px');
    });
    field.addEventListener('pointerleave', function () {
      field.style.setProperty('--pointer-x', '0px');
      field.style.setProperty('--pointer-y', '0px');
      field.style.setProperty('--pointer-x-inv', '0px');
      field.style.setProperty('--pointer-y-inv', '0px');
    });
  }

  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    function setMenu(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      var label = toggle.querySelector('.sr-only');
      if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
    }
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    mobileMenu.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setMenu(false); });
  }

  document.querySelectorAll('.service-row').forEach(function (row) {
    var button = row.querySelector('button');
    var action = row.querySelector('.service-action');
    if (!button) return;
    function activate() {
      document.querySelectorAll('.service-row').forEach(function (other) {
        var isCurrent = other === row;
        other.classList.toggle('is-active', isCurrent);
        var otherButton = other.querySelector('button');
        var otherAction = other.querySelector('.service-action');
        if (otherButton) otherButton.setAttribute('aria-expanded', isCurrent ? 'true' : 'false');
        if (otherAction) otherAction.textContent = isCurrent ? '−' : '+';
      });
    }
    row.addEventListener('mouseenter', activate);
    button.addEventListener('click', function () {
      var isActive = row.classList.contains('is-active');
      if (isActive) {
        row.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
        if (action) action.textContent = '+';
      } else {
        activate();
      }
    });
  });

  var form = document.querySelector('.contact-form');
  var status = document.querySelector('.form-status');
  if (form && status) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      status.textContent = 'Formulário pronto. Configure o e-mail oficial em src/content.ts ou main.js para ativar o envio.';
    });
  }

  var whatsapp = document.querySelector('.js-whatsapp');
  if (whatsapp && status) {
    whatsapp.addEventListener('click', function (event) {
      event.preventDefault();
      status.textContent = 'WhatsApp ainda não informado. Substitua [WHATSAPP] na configuração do projeto.';
      document.querySelector('.contact-form').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }

  updateScroll();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
})();
