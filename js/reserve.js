/* Book a table: times built from the opening hours (Haiti time), closed Mondays, guests stepper,
   and the seven-course option on Friday and Saturday only. */
(function () {
  'use strict';

  var K = window.Kanpech;
  var form = document.querySelector('form[data-form="reserve"]');
  if (!form || !K || !K.forms) return;

  var date = form.elements.date;
  var guests = form.elements.guests;
  var slotsBox = form.querySelector('[data-slots]');
  var tasting = form.querySelector('[data-tasting]');
  var AHEAD = 60;
  var LAST_SEATING = 90; // minutes before closing

  var now = K.haitiNow();
  date.min = now.iso;
  date.max = K.addDays(now.iso, AHEAD);
  date.setAttribute('data-msg', 'Pick a day.');
  form.elements.name.setAttribute('data-msg', 'Enter the name for the booking.');
  form.elements.phone.setAttribute('data-msg', 'Enter a phone number, so the restaurant can reach you.');
  guests.setAttribute('data-msg', 'Choose between 1 and 8 guests.');

  /* Guests stepper ------------------------------------------------------------ */
  var more = document.createElement('p');
  more.className = 'hint';
  more.hidden = true;
  more.innerHTML = 'For 9 or more, see <a class="text-link" href="events.html">private events</a>.';
  form.querySelector('[data-stepper]').insertAdjacentElement('afterend', more);

  form.querySelectorAll('[data-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = Number(guests.value) || 0;
      var step = Number(btn.getAttribute('data-step'));
      more.hidden = !(step > 0 && n >= 8);
      guests.value = Math.max(1, Math.min(8, n + step));
      guests.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  /* Times ----------------------------------------------------------------------- */
  function seed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
    return h;
  }

  function times(iso) {
    var day = K.dayOf(iso);
    var list = [];
    (K.HOURS[day] || []).forEach(function (r) {
      for (var t = r[0]; t <= r[1] - LAST_SEATING; t += 30) list.push(t);
    });
    if (iso === K.haitiNow().iso) {
      var soonest = K.haitiNow().minutes + 60;
      list = list.filter(function (t) {
        return t >= soonest;
      });
    }
    return list;
  }

  function message(text) {
    slotsBox.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'hint';
    p.textContent = text;
    slotsBox.appendChild(p);
  }

  function renderSlots() {
    var iso = date.value;
    var kept = form.elements.time ? form.elements.time.value : '';
    if (!iso) return message('Pick a day first, and the free times will show here.');
    if (iso < date.min || iso > date.max) return message('Pick a day between today and ' + K.longDate(date.max) + '.');
    var day = K.dayOf(iso);
    if (!K.HOURS[day].length) return message('We’re closed on ' + K.DAYS[day] + 's. Pick another day.');
    var list = times(iso);
    if (!list.length) return message('No more tables today. Pick another day.');

    var s = seed(iso);
    slotsBox.innerHTML = '';
    list.forEach(function (t, i) {
      var full = (s + i * 7) % 6 === 0;
      var label = document.createElement('label');
      label.className = 'slot';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'time';
      input.value = String(t);
      input.disabled = full;
      if (!full && String(t) === kept) input.checked = true;
      var span = document.createElement('span');
      span.textContent = K.fmtTime(t);
      if (full) {
        var small = document.createElement('small');
        small.textContent = 'Full';
        span.appendChild(small);
        input.setAttribute('aria-label', K.fmtTime(t) + ', full');
      }
      label.appendChild(input);
      label.appendChild(span);
      slotsBox.appendChild(label);
    });
  }

  function renderTasting() {
    if (!date.value) return;
    var day = K.dayOf(date.value);
    var ok = day === 5 || day === 6;
    tasting.disabled = !ok && !tasting.checked;
  }

  date.addEventListener('change', function () {
    renderSlots();
    renderTasting();
  });
  date.addEventListener('input', renderSlots);

  if (/[?&]menu=tasting\b/.test(location.search)) tasting.checked = true;

  /* Checks and summary ------------------------------------------------------- */
  K.forms.checks.reserve = function () {
    var problems = [];
    var iso = date.value;
    if (iso) {
      var day = K.dayOf(iso);
      if (iso < date.min) problems.push({ field: date.closest('.field'), input: date, msg: 'Pick a day from today on.' });
      else if (iso > date.max) problems.push({ field: date.closest('.field'), input: date, msg: 'Bookings open 60 days ahead. Pick an earlier day.' });
      else if (!K.HOURS[day].length) problems.push({ field: date.closest('.field'), input: date, msg: 'We’re closed on Mondays. Pick another day.' });
      else if (!form.querySelector('input[name="time"]:checked') && times(iso).length) {
        var first = form.querySelector('input[name="time"]:not(:disabled)');
        problems.push({ field: form.querySelector('[data-slots-field]'), input: first, msg: 'Pick a time.' });
      }
      if (tasting.checked && day !== 5 && day !== 6) {
        problems.push({ field: tasting.closest('.field'), input: tasting, msg: 'The seven courses are served on Friday and Saturday only.' });
      }
    }
    return problems;
  };

  K.forms.summaries.reserve = function () {
    var f = form.elements;
    var t = form.querySelector('input[name="time"]:checked');
    var n = Number(f.guests.value);
    return {
      title: 'Table for ' + n + (n === 1 ? ' guest' : ' guests'),
      rows: [
        ['Day', K.longDate(f.date.value)],
        ['Time', t ? K.fmtTime(Number(t.value)) : ''],
        ['Menu', f.tasting.checked ? 'The seven courses' : 'À la carte'],
        ['Occasion', f.occasion.value],
        ['Name', f.name.value.trim()],
        ['Phone', f.phone.value.trim()],
        ['Email', f.email.value.trim()],
        ['Requests', f.notes.value.trim()],
      ],
    };
  };
})();
