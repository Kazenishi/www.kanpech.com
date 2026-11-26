/* Forms: validation with clear messages, then a summary card. Nothing is ever sent: this is a concept site.
   Page scripts can add checks and summaries: Kanpech.forms.checks[name] and Kanpech.forms.summaries[name]. */
(function () {
  'use strict';

  window.Kanpech = window.Kanpech || {};
  var forms = (Kanpech.forms = Kanpech.forms || { checks: {}, summaries: {} });
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function today() {
    return Kanpech.haitiNow ? Kanpech.haitiNow().iso : new Date().toISOString().slice(0, 10);
  }

  function holder(el) {
    return el.closest('.field') || el.parentElement;
  }

  function clear(form) {
    form.querySelectorAll('.error').forEach(function (e) {
      e.remove();
    });
    form.querySelectorAll('.is-invalid').forEach(function (e) {
      e.classList.remove('is-invalid');
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (e) {
      e.removeAttribute('aria-invalid');
      var ids = (e.getAttribute('aria-describedby') || '').split(' ').filter(function (id) {
        return id && !/-error$/.test(id);
      });
      if (ids.length) e.setAttribute('aria-describedby', ids.join(' '));
      else e.removeAttribute('aria-describedby');
    });
  }

  function mark(field, msg, input) {
    var box = field;
    if (!box || box.classList.contains('is-invalid')) return;
    box.classList.add('is-invalid');
    var p = document.createElement('p');
    p.className = 'error';
    p.id = (input && input.id ? input.id : 'f' + Math.random().toString(36).slice(2, 7)) + '-error';
    p.textContent = msg;
    box.appendChild(p);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      var d = input.getAttribute('aria-describedby');
      input.setAttribute('aria-describedby', (d ? d + ' ' : '') + p.id);
    }
  }

  /** Built-in checks for each field, then the page's own checks. Returns [{field, msg, input}]. */
  function check(form) {
    var problems = [];
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.disabled || el.type === 'checkbox' || el.type === 'radio') return;
      var v = el.value.trim();
      var msg = el.getAttribute('data-msg');
      if (el.required && !v) {
        problems.push({ field: holder(el), input: el, msg: msg || 'Fill in this field.' });
      } else if (v && el.type === 'email' && !EMAIL.test(v)) {
        problems.push({ field: holder(el), input: el, msg: 'Enter an email address like name@example.com.' });
      } else if (v && el.type === 'number') {
        var n = Number(v);
        var min = el.min !== '' ? Number(el.min) : -Infinity;
        var max = el.max !== '' ? Number(el.max) : Infinity;
        if (!Number.isInteger(n) || n < min || n > max) problems.push({ field: holder(el), input: el, msg: msg || 'Enter a whole number.' });
      } else if (v && el.hasAttribute('data-future') && v < today()) {
        problems.push({ field: holder(el), input: el, msg: 'Pick a date from today on.' });
      }
    });
    var extra = forms.checks[form.getAttribute('data-form')];
    if (extra) problems = problems.concat(extra(form) || []);
    return problems;
  }

  function show(form, problems) {
    clear(form);
    problems.forEach(function (p) {
      mark(p.field, p.msg, p.input);
    });
    return problems;
  }

  function summary(form) {
    var build = forms.summaries[form.getAttribute('data-form')];
    var s = build ? build(form) : { title: 'Your request is ready', rows: [] };
    var card = document.createElement('div');
    card.className = 'confirm';
    card.tabIndex = -1;
    var h = document.createElement('h2');
    h.textContent = s.title;
    card.appendChild(h);
    var dl = document.createElement('dl');
    s.rows
      .filter(function (r) {
        return r[1];
      })
      .forEach(function (r) {
        var row = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = r[0];
        dd.textContent = r[1];
        row.appendChild(dt);
        row.appendChild(dd);
        dl.appendChild(row);
      });
    card.appendChild(dl);
    var note = document.createElement('p');
    note.className = 'confirm__note';
    note.textContent =
      'Nothing was sent: Kanpèch is a concept site. On a real launch, this request would reach the restaurant by email or WhatsApp, and they would confirm it.';
    card.appendChild(note);
    var again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn btn--ghost';
    again.textContent = 'Change the request';
    again.addEventListener('click', function () {
      card.remove();
      form.hidden = false;
      var first = form.querySelector('input, select, textarea');
      if (first) first.focus();
    });
    card.appendChild(again);
    form.hidden = true;
    form.parentNode.insertBefore(card, form.nextSibling);
    card.focus();
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var tried = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var problems = show(form, check(form));
      if (problems.length) {
        var target = problems[0].input || problems[0].field.querySelector('input, select, textarea, button');
        if (target) target.focus();
        return;
      }
      summary(form);
    });
    // Once the visitor has tried to send, fix messages as they type.
    form.addEventListener('input', function () {
      if (tried) show(form, check(form));
    });
    form.addEventListener('change', function () {
      if (tried) show(form, check(form));
    });
  });

  forms.mark = mark;

  /* The event request summary. */
  forms.summaries.event = function (form) {
    var f = form.elements;
    return {
      title: 'Your event request is ready',
      rows: [
        ['Name', f.name.value.trim()],
        ['Contact', f.contact.value.trim()],
        ['Date', Kanpech.longDate ? Kanpech.longDate(f.date.value) : f.date.value],
        ['Guests', f.guests.value],
        ['Space', f.room.value],
        ['Occasion', f.kind.value.trim()],
        ['Notes', f.notes.value.trim()],
      ],
    };
  };

  /** "2026-11-28" → "Saturday 28 November 2026". */
  Kanpech.longDate = function (iso) {
    if (!iso) return '';
    var p = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(Date.UTC(p[0], p[1] - 1, p[2])))
      .replace(',', '');
  };
})();
