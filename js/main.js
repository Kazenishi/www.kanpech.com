/* Kanpèch: header, phone navigation and the ink panel. Plain script, no library. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  window.Kanpech = window.Kanpech || {};

  /* Header: hides while scrolling down, comes back on the way up. ------------ */
  var header = document.querySelector('[data-header]');
  var sheet = document.querySelector('[data-sheet]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var lastY = 0;
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var open = toggle && toggle.getAttribute('aria-expanded') === 'true';
      if (header) header.classList.toggle('is-hidden', !open && y > 160 && y > lastY + 2);
      if (y < lastY - 2 || y <= 160) header && header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Phone navigation sheet. -------------------------------------------------- */
  function setSheet(open) {
    if (!sheet || !toggle) return;
    sheet.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) {
      header.classList.remove('is-hidden');
      var first = sheet.querySelector('a');
      if (first) first.focus();
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setSheet(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setSheet(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (sheet.contains(e.target) || toggle.contains(e.target)) return;
      setSheet(false);
    });
    window.matchMedia('(min-width: 980px)').addEventListener('change', function (e) {
      if (e.matches) setSheet(false);
    });
  }

  /* Ink panel: on wide screens, the photo beside the text follows the block being read. */
  var stack = document.querySelector('[data-panel-stack]');
  var wide = window.matchMedia('(min-width: 900px)');
  var top = 3;
  var current = null;
  var timer = null;

  function show(key) {
    if (!stack || key === current) return;
    var item = stack.querySelector('[data-panel="' + key + '"]');
    if (!item) return;
    current = key;
    stack.classList.remove('is-intro');
    top += 1;
    item.style.zIndex = top;
    // Restart the spread when coming back to a photo that is still underneath.
    item.classList.remove('is-on');
    void item.offsetWidth;
    item.classList.add('is-on');
    clearTimeout(timer);
    timer = setTimeout(
      function () {
        stack.querySelectorAll('.panel__item.is-on').forEach(function (el) {
          if (el !== item) el.classList.remove('is-on');
        });
      },
      reduce.matches ? 0 : 1400,
    );
  }
  Kanpech.panel = { show: show };

  if (stack) {
    var first = stack.querySelector('.panel__item.is-on');
    current = first ? first.getAttribute('data-panel') : null;
    if (!reduce.matches) stack.classList.add('is-intro');

    var io = new IntersectionObserver(
      function (entries) {
        if (!wide.matches) return;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) show(entry.target.getAttribute('data-panel-key'));
        });
      },
      // A thin line across the middle of the screen: whatever crosses it owns the photo.
      { rootMargin: '-48% 0px -48% 0px' },
    );
    document.querySelectorAll('[data-panel-key]').forEach(function (el) {
      io.observe(el);
    });
  }
})();
