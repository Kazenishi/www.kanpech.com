/* Opening hours and "open now", always at Haiti time (America/Port-au-Prince), whatever the visitor's clock.
   Keep HOURS in sync with the hours written in the pages (footer, home, Visit). */
(function () {
  'use strict';

  // Minutes from midnight. 0 = Sunday … 6 = Saturday. 1440 = midnight at the end of the day.
  var HOURS = {
    0: [[720, 960]],
    1: [],
    2: [[1080, 1380]],
    3: [[1080, 1380]],
    4: [[1080, 1380]],
    5: [[1080, 1440]],
    6: [[1080, 1440]],
  };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  /* Haiti time without Intl: Intl's first use costs about 100 ms on a phone, during page load.
     Haiti follows the US summer-time rule: UTC-5, and UTC-4 from the second Sunday of March to the first Sunday
     of November, both at 2 am. The QA checks this against Intl hour by hour. If Haiti changes its rule, change it here. */
  var STD = -300;
  function sunday(y, month, n) {
    var first = new Date(Date.UTC(y, month, 1)).getUTCDay();
    return 1 + ((7 - first) % 7) + (n - 1) * 7;
  }
  function haitiOffset(ms) {
    var y = new Date(ms).getUTCFullYear();
    var start = Date.UTC(y, 2, sunday(y, 2, 2), 2) - STD * 60000;
    var end = Date.UTC(y, 10, sunday(y, 10, 1), 2) - (STD + 60) * 60000;
    return ms >= start && ms < end ? STD + 60 : STD;
  }
  function haitiNow() {
    var now = Date.now();
    var d = new Date(now + haitiOffset(now) * 60000);
    return { iso: d.toISOString().slice(0, 10), day: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }

  /** Day of the week of a YYYY-MM-DD date (0 = Sunday). */
  function dayOf(iso) {
    var p = iso.split('-').map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay();
  }

  /** YYYY-MM-DD plus n days. */
  function addDays(iso, n) {
    var p = iso.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.toISOString().slice(0, 10);
  }

  /** 1080 → "6 pm", 1110 → "6:30 pm", 720 → "noon", 1440 → "midnight". */
  function fmt(min) {
    if (min === 720) return 'noon';
    if (min === 0 || min === 1440) return 'midnight';
    var h = Math.floor(min / 60);
    var m = min % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 || 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + suffix;
  }

  function status() {
    var now = haitiNow();
    var today = HOURS[now.day];
    for (var i = 0; i < today.length; i++) {
      if (now.minutes >= today[i][0] && now.minutes < today[i][1]) {
        return { open: true, text: 'Open now, until ' + fmt(today[i][1]) + '.' };
      }
    }
    for (var k = 0; k < 8; k++) {
      var d = (now.day + k) % 7;
      var ranges = HOURS[d];
      for (var j = 0; j < ranges.length; j++) {
        if (k > 0 || ranges[j][0] > now.minutes) {
          var when = k === 0 ? 'today' : k === 1 ? 'tomorrow' : 'on ' + DAYS[d];
          return { open: false, text: 'Closed now. We open ' + when + ' at ' + fmt(ranges[j][0]) + '.' };
        }
      }
    }
    return { open: false, text: 'Closed now.' };
  }

  window.Kanpech = window.Kanpech || {};
  Kanpech.HOURS = HOURS;
  Kanpech.DAYS = DAYS;
  Kanpech.haitiNow = haitiNow;
  Kanpech.haitiOffset = haitiOffset;
  Kanpech.dayOf = dayOf;
  Kanpech.addDays = addDays;
  Kanpech.fmtTime = fmt;

  function render() {
    var s = status();
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
    });
    var today = DAYS[haitiNow().day];
    document.querySelectorAll('.hours > div').forEach(function (row) {
      var dt = row.querySelector('dt');
      row.classList.toggle('is-today', !!dt && dt.textContent === today);
    });
  }

  render();
  setInterval(render, 60000);
})();
