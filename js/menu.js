/* Menu page: section tabs, dietary filters and the seven-course stepper.
   Without JavaScript every section, dish and course simply shows in order. */
(function () {
  'use strict';

  var panel = (window.Kanpech && Kanpech.panel) || { show: function () {} };

  /* Tabs (ARIA tabs pattern: arrows, Home and End move between tabs). ------- */
  var tabsBox = document.querySelector('[data-tabs]');
  var tabs = tabsBox ? Array.prototype.slice.call(tabsBox.querySelectorAll('[role="tab"]')) : [];
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-tabpanel]'));

  function select(tab, focus, scroll) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var section = document.getElementById(t.getAttribute('aria-controls'));
      if (section) section.hidden = !on;
    });
    if (focus) tab.focus();
    // Only scroll the tab strip for the visitor's own choices: on load it would force an extra layout.
    if (scroll) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    panel.show(tab.getAttribute('data-key'));
  }

  if (tabsBox && tabs.length) {
    tabsBox.hidden = false;
    sections.forEach(function (s) {
      s.setAttribute('role', 'tabpanel');
      s.setAttribute('aria-labelledby', 'tab-' + s.id);
      s.tabIndex = 0;
    });
    var fromHash = function () {
      return tabs.filter(function (t) {
        return '#' + t.getAttribute('aria-controls') === location.hash;
      })[0];
    };
    select(fromHash() || tabs[0], false);
    window.addEventListener('hashchange', function () {
      var t = fromHash();
      if (t) select(t, false);
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(tab, false, true);
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true, true);
        }
      });
    });
  }

  /* Dietary filters. ---------------------------------------------------------- */
  var filters = document.querySelector('[data-filters]');
  var count = document.querySelector('[data-filter-count]');
  var dishes = Array.prototype.slice.call(document.querySelectorAll('.dish'));

  function applyFilters() {
    var on = Array.prototype.slice
      .call(filters.querySelectorAll('input:checked'))
      .map(function (i) {
        return i.value;
      });
    var shown = 0;
    dishes.forEach(function (dish) {
      var tags = (dish.getAttribute('data-tags') || '').split(' ');
      var ok = on.every(function (f) {
        return f === 'not-s' ? tags.indexOf('s') === -1 : tags.indexOf(f) !== -1;
      });
      dish.hidden = !ok;
      if (ok) shown += 1;
    });
    sections.forEach(function (s) {
      var any = s.querySelector('.dish:not([hidden])');
      s.querySelector('.empty').hidden = !!any;
      var tab = document.getElementById('tab-' + s.id);
      if (tab) tab.classList.toggle('is-empty', !any);
    });
    count.textContent = on.length ? 'Showing ' + shown + ' of ' + dishes.length + ' dishes.' : '';
  }
  if (filters) filters.addEventListener('change', applyFilters);

  /* Seven courses, one at a time. ------------------------------------------- */
  var box = document.querySelector('[data-courses]');
  if (box) {
    var courses = Array.prototype.slice.call(box.querySelectorAll('[data-course]'));
    var nav = box.querySelector('[data-courses-nav]');
    var prev = box.querySelector('[data-prev]');
    var next = box.querySelector('[data-next]');
    var ticks = Array.prototype.slice.call(box.querySelectorAll('.courses__ticks span'));
    var list = box.querySelector('.courses__list');
    var at = 0;

    box.classList.add('is-stepper');
    nav.hidden = false;
    list.setAttribute('aria-live', 'polite');

    function go(n) {
      at = Math.max(0, Math.min(courses.length - 1, n));
      courses.forEach(function (c, i) {
        c.classList.toggle('is-current', i === at);
      });
      ticks.forEach(function (t, i) {
        t.classList.toggle('is-done', i <= at);
      });
      prev.disabled = at === 0;
      next.disabled = at === courses.length - 1;
    }
    prev.addEventListener('click', function () {
      go(at - 1);
      if (prev.disabled) next.focus();
    });
    next.addEventListener('click', function () {
      go(at + 1);
      if (next.disabled) prev.focus();
    });
    go(0);
  }
})();
