/**
 * Middle East Engagement Calendar — application logic.
 * Vanilla JS, no build step. Load order (see index.html): config.js,
 * taxonomy.js, i18n.js, icons.js, loader.js, app.js.
 */
(function () {
  "use strict";

  var ICONS = window.CAL_ICONS;
  var T = window.CAL_TAXONOMY;
  var CFG = window.CAL_CONFIG;
  var DATA = window.CAL_DATA;
  var I18N = window.CAL_I18N;
  var t = I18N.t, L = I18N.label;
  var AR = I18N.lang === "ar";
  var RTL = I18N.isRTL;
  var IS_EMBED = document.documentElement.classList.contains("is-embed");

  var MONTH_NAMES = I18N.months;
  var MONTH_ABBR = I18N.monthsShort;
  var DAY_W = 40;       // px per day column, must match --day-w in styles.css
  var MIN_PILL_W = 190; // px, keeps event names legible even for 1-day events
  var PILL_H = 34;
  var PILL_GAP = 8;

  // `param` is the key used in shareable links (?scope=Jordan&who=…).
  var FILTERS = [
    { key: "scope", param: "scope", id: "filterScope", sort: T.sortScopes },
    { key: "format", param: "format", id: "filterFormat", sort: T.sortFormats },
    { key: "type", param: "type", id: "filterType", sort: T.sortTypes },
    { key: "theme", param: "theme", id: null }, // set by the theme chips
    { key: "participation", param: "who", id: "filterParticipation", sort: T.sortParticipation }
  ];

  var EVENTS = [];
  var CONTACTS = [];
  var LAST_UPDATED = null;
  var TODAY = DATA.todayISO();

  var state = {
    view: "timeline",     // "timeline" | "list"
    period: "upcoming",   // "upcoming" | "all" | a year number
    filters: { scope: "All", format: "All", type: "All", theme: "All", participation: "All" },
    search: "",
    openEvent: null,      // id of the event shown in the detail panel
    lastFocusedEl: null
  };

  /* ----------------------------------------------------------------- *
   * Generic helpers
   * ----------------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function el(tag, className, html) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  // Plain-text description from the sheet → safe HTML. Blank lines start a
  // new paragraph; lines starting with "- " become bullet lists.
  function formatDescription(text) {
    return String(text || "").replace(/\r/g, "").split(/\n\s*\n/).map(function (block) {
      var html = "", para = [], list = [];
      function flushP() { if (para.length) { html += "<p>" + para.join("<br>") + "</p>"; para = []; } }
      function flushL() { if (list.length) { html += "<ul>" + list.map(function (li) { return "<li>" + li + "</li>"; }).join("") + "</ul>"; list = []; } }
      block.split("\n").forEach(function (line) {
        var m = line.match(/^\s*[-•*]\s+(.*)/);
        if (m) { flushP(); list.push(esc(m[1])); }
        else if (line.trim()) { flushL(); para.push(esc(line.trim())); }
      });
      flushP(); flushL();
      return html;
    }).join("");
  }
  function summaryText(text) {
    return String(text || "").split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  }

  var toastTimer;
  function toast(message) {
    var n = document.getElementById("toast");
    n.textContent = message;
    n.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { n.classList.remove("is-visible"); }, 2400);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); resolve(); } catch (e) { reject(e); }
      ta.remove();
    });
  }

  /* ----------------------------------------------------------------- *
   * Dates
   * ----------------------------------------------------------------- */
  function parseISO(iso) {
    var p = iso.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function toISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addDays(iso, n) { var d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
  function ymOf(iso) { var p = iso.split("-"); return (+p[0]) * 12 + (+p[1] - 1); }
  function daysInMonth(y, m0) { return new Date(y, m0 + 1, 0).getDate(); }

  function formatLongDate(d) { return d.getDate() + " " + MONTH_NAMES[d.getMonth()] + " " + d.getFullYear(); }

  function formatDateRange(startISO, endISO) {
    if (!startISO) return t("dateTbc");
    var s = parseISO(startISO), e = parseISO(endISO);
    var sM = MONTH_NAMES[s.getMonth()], eM = MONTH_NAMES[e.getMonth()];
    var sY = s.getFullYear(), eY = e.getFullYear();
    if (startISO === endISO) return s.getDate() + " " + sM + " " + sY;
    if (sY === eY && s.getMonth() === e.getMonth()) return s.getDate() + "–" + e.getDate() + " " + sM + " " + sY;
    if (sY === eY) return s.getDate() + " " + sM + " – " + e.getDate() + " " + eM + " " + sY;
    return s.getDate() + " " + sM + " " + sY + " – " + e.getDate() + " " + eM + " " + eY;
  }

  // Short form for pills and cards; the year is added only when the event
  // crosses into another year, where "Feb – Aug" alone would be ambiguous.
  function formatCompact(startISO, endISO) {
    if (!startISO) return t("tbcShort");
    var s = parseISO(startISO), e = parseISO(endISO);
    var sM = MONTH_ABBR[s.getMonth()], eM = MONTH_ABBR[e.getMonth()];
    if (startISO === endISO) return s.getDate() + " " + sM;
    if (s.getFullYear() !== e.getFullYear()) return s.getDate() + " " + sM + " " + s.getFullYear() + " – " + e.getDate() + " " + eM + " " + e.getFullYear();
    if (s.getMonth() === e.getMonth()) return s.getDate() + "–" + e.getDate() + " " + sM;
    return s.getDate() + " " + sM + " – " + e.getDate() + " " + eM;
  }

  function overlapsMonth(ev, y, m0) {
    if (!ev.startDate) return false;
    var first = y + "-" + pad(m0 + 1) + "-01";
    var last = y + "-" + pad(m0 + 1) + "-" + pad(daysInMonth(y, m0));
    return ev.startDate <= last && ev.endDate >= first;
  }
  function byStart(a, b) {
    if (!a.startDate || !b.startDate) return a.startDate ? -1 : b.startDate ? 1 : 0;
    return a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : a.endDate < b.endDate ? -1 : a.endDate > b.endDate ? 1 : 0;
  }

  /* ----------------------------------------------------------------- *
   * Time zones (for the time line in the detail panel and for .ics)
   * ----------------------------------------------------------------- */
  function tzOffsetMinutes(date, tz) {
    var parts = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
    var asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
    return (asUTC - date.getTime()) / 60000;
  }
  // Wall-clock date + time in `tz` → the real instant (a Date).
  function zonedToDate(isoDate, hhmm, tz) {
    var d = isoDate.split("-").map(Number), tm = hhmm.split(":").map(Number);
    var guess = Date.UTC(d[0], d[1] - 1, d[2], tm[0], tm[1]);
    var off = tzOffsetMinutes(new Date(guess), tz);
    var ts = guess - off * 60000;
    var off2 = tzOffsetMinutes(new Date(ts), tz);
    if (off2 !== off) ts = guess - off2 * 60000;
    return new Date(ts);
  }
  function tzCity(tz) { return tz === "UTC" ? "UTC" : tz.split("/").pop().replace(/_/g, " "); }
  function viewerTz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ""; } }

  function eventInstants(ev) {
    if (!ev.startDate || !ev.startTime) return null;
    var start = zonedToDate(ev.startDate, ev.startTime, ev.timezone);
    var end = ev.endTime ? zonedToDate(ev.endDate, ev.endTime, ev.timezone) : new Date(start.getTime() + 60 * 60000);
    if (end <= start) end = new Date(start.getTime() + 60 * 60000);
    return { start: start, end: end, hasEnd: !!ev.endTime };
  }

  function timeLine(ev) {
    var inst = eventInstants(ev);
    if (!inst) return "";
    var out = t("timeIn", { range: ev.startTime + (inst.hasEnd ? "–" + ev.endTime : ""), city: I18N.city(tzCity(ev.timezone)) });
    var vtz = viewerTz();
    if (vtz && tzOffsetMinutes(inst.start, vtz) !== tzOffsetMinutes(inst.start, ev.timezone)) {
      var fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: vtz });
      out += " · " + t("yourTime", { range: fmt.format(inst.start) + (inst.hasEnd ? "–" + fmt.format(inst.end) : "") });
    }
    return out;
  }

  /* ----------------------------------------------------------------- *
   * Shareable links: the view, period, filters and search live in the
   * query string (?view=list&scope=Jordan…), the open event in the hash
   * (#event=id). Links copied from the page reproduce what the sender saw.
   * ----------------------------------------------------------------- */
  var KEEP_PARAMS = ["lang", "embed", "mode"];

  function stateParams() {
    var p = new URLSearchParams();
    var cur = new URLSearchParams(location.search);
    KEEP_PARAMS.forEach(function (k) { if (cur.get(k)) p.set(k, cur.get(k)); });
    if (state.view === "list") p.set("view", "list");
    if (state.period !== "upcoming") p.set("period", String(state.period));
    FILTERS.forEach(function (f) { if (state.filters[f.key] !== "All") p.set(f.param, state.filters[f.key]); });
    if (state.search) p.set("q", state.search);
    return p;
  }
  // The page's own address without query or hash. (Not origin + pathname:
  // a page opened from disk has the origin "null".)
  function pageBase() { return location.href.split(/[?#]/)[0]; }
  function urlWith(params, hash) {
    var qs = params.toString();
    return pageBase() + (qs ? "?" + qs : "") + (hash || "");
  }

  function syncURL() {
    var url = urlWith(stateParams(), state.openEvent ? "#event=" + encodeURIComponent(state.openEvent) : "");
    try { history.replaceState(null, "", url); } catch (e) {}
    updateLangToggle();
    updateEmbedLink();
  }

  function readURL() {
    var p = new URLSearchParams(location.search);
    if (p.get("view") === "list") state.view = "list";
    var period = p.get("period");
    if (period === "all") state.period = "all";
    else if (/^\d{4}$/.test(period || "")) state.period = +period;
    FILTERS.forEach(function (f) {
      var v = p.get(f.param);
      if (!v) return;
      var match = filterOptions(f).filter(function (o) { return o.toLowerCase() === v.toLowerCase(); })[0];
      if (match) state.filters[f.key] = match;
    });
    if (p.get("q")) state.search = p.get("q").trim().toLowerCase();
  }
  function eventFromHash() {
    var m = location.hash.match(/^#event=(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // Link to one event: the full page (never the embed), in the current language.
  function eventShareUrl(ev) {
    var p = new URLSearchParams();
    if (AR) p.set("lang", "ar");
    return urlWith(p, "#event=" + encodeURIComponent(ev.id));
  }

  function updateLangToggle() {
    var a = document.getElementById("langToggle");
    var p = stateParams();
    var other = AR ? "en" : "ar";
    p.set("lang", other);
    a.href = urlWith(p, state.openEvent ? "#event=" + encodeURIComponent(state.openEvent) : "");
    a.textContent = t("langSwitch");
    a.lang = other;
    a.hreflang = other;
  }

  function updateEmbedLink() {
    if (!IS_EMBED) return;
    var p = stateParams();
    p.delete("embed"); p.delete("mode");
    var a = document.getElementById("embedFullLink");
    a.href = urlWith(p);
    a.textContent = t("embedFull") + " →";
  }

  /* ----------------------------------------------------------------- *
   * Add to calendar (.ics download + Google Calendar link)
   * ----------------------------------------------------------------- */
  function utcStamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function icsEscape(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  // RFC 5545 lines are folded at 75 octets (not characters — Arabic and
  // other non-Latin text is multi-byte in UTF-8).
  function icsFold(line) {
    var enc = new TextEncoder(), out = [], cur = "", bytes = 0;
    Array.from(line).forEach(function (ch) {
      var b = enc.encode(ch).length;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
      cur += ch; bytes += b;
    });
    out.push(cur);
    return out.join("\r\n ");
  }
  function calendarText(ev) {
    var lines = [summaryText(ev.description)];
    if (ev.link) lines.push("", ev.link);
    lines.push("", (AR ? CFG.calendarNameAr : CFG.calendarName) + ": " + eventShareUrl(ev));
    return lines.join("\n");
  }
  function veventLines(ev) {
    var inst = eventInstants(ev);
    var lines = ["BEGIN:VEVENT", "UID:" + ev.id + "@ungc-middle-east-calendar", "DTSTAMP:" + utcStamp(new Date())];
    if (inst) {
      lines.push("DTSTART:" + utcStamp(inst.start), "DTEND:" + utcStamp(inst.end));
    } else {
      // All-day: DTEND is exclusive. Marked free so a months-long programme
      // doesn't block the whole period in Outlook.
      lines.push("DTSTART;VALUE=DATE:" + ev.startDate.replace(/-/g, ""), "DTEND;VALUE=DATE:" + addDays(ev.endDate, 1).replace(/-/g, ""), "TRANSP:TRANSPARENT");
    }
    lines.push("SUMMARY:" + icsEscape(ev.name), "DESCRIPTION:" + icsEscape(calendarText(ev)));
    if (ev.location) lines.push("LOCATION:" + icsEscape(ev.location));
    if (/^https?:/i.test(ev.link)) lines.push("URL:" + ev.link);
    lines.push("END:VEVENT");
    return lines;
  }
  function buildICS(events) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + CFG.orgName + "//" + CFG.calendarName + "//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "X-WR-CALNAME:" + icsEscape(AR ? CFG.calendarNameAr : CFG.calendarName)];
    events.forEach(function (ev) { lines = lines.concat(veventLines(ev)); });
    lines.push("END:VCALENDAR");
    return lines.map(icsFold).join("\r\n") + "\r\n";
  }
  function downloadFile(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function googleCalendarUrl(ev) {
    var inst = eventInstants(ev);
    var dates = inst
      ? utcStamp(inst.start) + "/" + utcStamp(inst.end)
      : ev.startDate.replace(/-/g, "") + "/" + addDays(ev.endDate, 1).replace(/-/g, "");
    var params = { action: "TEMPLATE", text: ev.name, dates: dates, details: calendarText(ev).slice(0, 1500), location: ev.location || "" };
    return "https://calendar.google.com/calendar/render?" + Object.keys(params).map(function (k) {
      return k + "=" + encodeURIComponent(params[k]);
    }).join("&");
  }
  function canAddToCalendar(ev) { return !!ev.startDate && ev.endDate >= TODAY; }

  /* ----------------------------------------------------------------- *
   * Period (which months are shown)
   * ----------------------------------------------------------------- */
  function nowYM() { var d = new Date(); return d.getFullYear() * 12 + d.getMonth(); }

  function dataYears() {
    var years = {};
    EVENTS.forEach(function (ev) {
      if (!ev.startDate) return;
      for (var y = +ev.startDate.slice(0, 4); y <= +ev.endDate.slice(0, 4); y++) years[y] = true;
    });
    return Object.keys(years).map(Number).sort();
  }

  // Months to draw for the current period, as [{ y, m }] (m is 0-based).
  function periodMonths() {
    var dated = EVENTS.filter(function (ev) { return ev.startDate; });
    var from, to;
    if (typeof state.period === "number") {
      from = state.period * 12; to = from + 11;
    } else if (!dated.length) {
      from = to = nowYM();
    } else {
      var minYM = Math.min.apply(null, dated.map(function (ev) { return ymOf(ev.startDate); }));
      var maxYM = Math.max.apply(null, dated.map(function (ev) { return ymOf(ev.endDate); }));
      if (state.period === "upcoming") { from = nowYM(); to = Math.max(maxYM, from); }
      else { from = minYM; to = maxYM; }
    }
    var out = [];
    for (var ym = from; ym <= to; ym++) out.push({ y: Math.floor(ym / 12), m: ym % 12 });
    return out;
  }

  function inPeriod(ev) {
    if (!ev.startDate) return state.period === "upcoming" || state.period === "all";
    if (state.period === "upcoming") return ev.endDate >= TODAY;
    if (state.period === "all") return true;
    return +ev.startDate.slice(0, 4) <= state.period && +ev.endDate.slice(0, 4) >= state.period;
  }
  function periodLabel() {
    if (typeof state.period === "number") return String(state.period);
    return t(state.period === "all" ? "period.all" : "period.upcoming");
  }

  /* ----------------------------------------------------------------- *
   * Filtering
   * ----------------------------------------------------------------- */
  // skipTheme: used for the theme chips' counts.
  function matchesFilters(ev, skipTheme) {
    var f = state.filters;
    if (f.scope !== "All" && ev.scope !== f.scope) return false;
    if (f.format !== "All" && ev.format !== f.format) return false;
    if (f.type !== "All" && ev.type !== f.type) return false;
    if (!skipTheme && f.theme !== "All" && T.themeMeta(ev.theme).group !== f.theme) return false;
    if (f.participation !== "All" && ev.participation !== f.participation) return false;
    if (state.search && !eventMatchesSearch(ev, state.search)) return false;
    return true;
  }
  // Searches both languages, so an Arabic query finds English-only rows by
  // their translated labels and vice versa.
  function eventMatchesSearch(ev, term) {
    var fields = [ev.name, ev.description, ev.location];
    [ev.type, ev.theme, ev.scope, ev.format, ev.participation, ev.status].forEach(function (v) { fields.push(v, L(v)); });
    var haystack = fields.join(" ").toLowerCase();
    return term.split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
  }
  function isDefaultFilters() {
    var f = state.filters;
    return Object.keys(f).every(function (k) { return f[k] === "All"; }) && state.search === "";
  }
  function periodEvents() { return EVENTS.filter(inPeriod); }
  function visibleEvents() { return periodEvents().filter(function (ev) { return matchesFilters(ev); }); }

  // Groups events by month for the list and print views. An event that
  // began before the period (e.g. an ongoing programme in "Upcoming") goes
  // under the period's first month; undated events go last.
  function groupByMonth(events) {
    var first = periodMonths()[0];
    var firstYM = first.y * 12 + first.m;
    var groups = [], byKey = {};
    events.slice().sort(byStart).forEach(function (ev) {
      var key = ev.startDate ? Math.max(ymOf(ev.startDate), firstYM) : "tbc";
      if (!byKey[key]) {
        byKey[key] = { key: key, label: key === "tbc" ? t("datesTbc") : MONTH_NAMES[key % 12] + " " + Math.floor(key / 12), items: [] };
        groups.push(byKey[key]);
      }
      byKey[key].items.push(ev);
    });
    return groups;
  }

  /* ----------------------------------------------------------------- *
   * Small render helpers
   * ----------------------------------------------------------------- */
  function scopeIcon(scope) { return ICONS[T.scopeIcon(scope)]; }
  function themeIcon(theme) { return ICONS[T.themeMeta(theme).icon]; }
  function statusBadge(status) { return '<span class="status-badge status--' + T.statusTone(status) + '">' + esc(L(status)) + "</span>"; }

  function actionFor(ev) {
    if (!ev.link) return null;
    var s = ev.status.toLowerCase();
    if (s === "completed" || s.indexOf("soon") !== -1 || s.indexOf("closed") !== -1 || s === "ongoing") return { label: t("learnMore") };
    if (s.indexOf("application") !== -1) return { label: t("apply") };
    return { label: t("register") };
  }

  function tagRowHTML(ev, includeTheme) {
    var out = '<span class="tag"><span class="tag-icon">' + scopeIcon(ev.scope) + "</span>" + esc(L(ev.scope)) + "</span>";
    out += '<span class="tag">' + esc(L(ev.format)) + "</span>";
    out += '<span class="tag">' + esc(L(ev.type)) + "</span>";
    if (includeTheme) {
      var tm = T.themeMeta(ev.theme);
      out += '<span class="tag theme-tag" style="background:' + tm.color + (tm.darkText ? ";color:var(--black)" : "") + '">' + themeIcon(ev.theme) + " " + esc(L(tm.label)) + "</span>";
    }
    out += '<span class="tag"><span class="tag-icon">' + ICONS.users + "</span>" + esc(L(ev.participation)) + "</span>";
    return out;
  }

  // A location-only filter (e.g. a country's embed) with nothing in it
  // means "nothing announced yet", not "your filters are too narrow".
  function noMatchText() {
    var f = state.filters;
    var onlyScope = f.scope !== "All" && !state.search &&
      Object.keys(f).every(function (k) { return k === "scope" || f[k] === "All"; });
    return t(onlyScope ? "empty.month" : "empty.filtered");
  }

  function emptyState(message) {
    var wrap = el("div", "empty-state");
    wrap.innerHTML = ICONS.calendar + "<p>" + message + "</p>";
    return wrap;
  }

  // Result count + the toolbar buttons that depend on what's shown.
  function updateToolbar(n) {
    var parts = [I18N.count(n)];
    if (typeof state.period === "number") parts.push(t("count.inYear", { y: state.period }));
    else if (state.period === "upcoming") parts.push(t("count.upcoming"));
    if (!isDefaultFilters()) parts.push(t(n === 1 ? "count.filtered1" : "count.filtered"));
    document.getElementById("resultCount").textContent = parts.join(" ");

    var addable = visibleEvents().filter(canAddToCalendar).length;
    var addBtn = document.getElementById("addAllBtn");
    addBtn.disabled = !addable;
    addBtn.title = t("addAllTitle", { n: addable });
  }

  /* ----------------------------------------------------------------- *
   * Timeline view
   * ----------------------------------------------------------------- */
  // `seg` (optional) is the timeline segment. A segment continuing from an
  // earlier month only needs its end date ("to 1 Dec"), and one continuing
  // on both sides none, so the name keeps the room.
  function makePill(ev, extraClass, seg) {
    var tm = T.themeMeta(ev.theme);
    var dateText = formatCompact(ev.startDate, ev.endDate);
    if (seg && seg.continuesPrev) dateText = seg.continuesNext ? "" : t("toDate", { d: formatCompact(ev.endDate, ev.endDate) });
    var pill = el("button", "event-pill" + (tm.darkText ? " text-dark" : "") + (extraClass || ""));
    pill.type = "button";
    pill.style.background = tm.color;
    pill.setAttribute("aria-haspopup", "dialog");
    pill.title = ev.name + " — " + formatDateRange(ev.startDate, ev.endDate);
    // .pill-inner is sticky, so a long bar's label stays in view while
    // the month row is scrolled sideways.
    pill.innerHTML = '<span class="pill-inner">' +
      '<span class="pill-icon">' + scopeIcon(ev.scope) + "</span>" +
      '<span class="pill-name" dir="auto">' + esc(ev.name) + "</span>" +
      (dateText ? '<span class="pill-date">' + dateText + "</span>" : "") + "</span>";
    pill.addEventListener("click", function () { openDetail(ev.id, pill); });
    return pill;
  }

  function renderTimeline() {
    var root = document.getElementById("timelineView");
    root.innerHTML = "";
    var months = periodMonths();
    var base = periodEvents();
    var visible = base.filter(function (ev) { return matchesFilters(ev); });
    var multiYear = months[0].y !== months[months.length - 1].y;
    var prevYear = null;
    var currentYM = nowYM();

    months.forEach(function (mo) {
      var y = mo.y, m = mo.m;
      if (multiYear && y !== prevYear) root.appendChild(el("h3", "year-divider", "<span>" + y + "</span>"));
      prevYear = y;

      var baseList = base.filter(function (ev) { return overlapsMonth(ev, y, m); });
      var filteredList = visible.filter(function (ev) { return overlapsMonth(ev, y, m); });
      var nDays = daysInMonth(y, m);
      var isCurrent = y * 12 + m === currentYM;

      var row = el("div", "month-row" + (isCurrent ? " is-current" : ""));
      row.appendChild(el("div", "month-id",
        '<span class="month-badge">' + pad(m + 1) + "</span>" +
        '<span class="month-name">' + MONTH_NAMES[m] + '<span class="month-year">' + y + (isCurrent ? " · " + t("thisMonth") : "") + "</span></span>"));

      var scrollWrap = el("div", "month-scroll");
      var inner = el("div", "month-inner");
      inner.style.width = (nDays * DAY_W) + "px";

      var ruler = el("div", "day-ruler");
      ruler.setAttribute("aria-hidden", "true");
      for (var d = 1; d <= nDays; d++) {
        var dow = new Date(y, m, d).getDay();
        var iso = y + "-" + pad(m + 1) + "-" + pad(d);
        // Fri/Sat is the weekend across most of the region (Lebanon: Sat/Sun);
        // shading Fri–Sun covers both without implying either.
        var tick = el("div", "day-tick" + ((dow === 0 || dow === 5 || dow === 6) ? " is-weekend" : "") + (iso === TODAY ? " is-today" : ""), String(d));
        tick.style.width = DAY_W + "px";
        ruler.appendChild(tick);
      }
      inner.appendChild(ruler);

      var track = el("div", "event-track");
      inner.appendChild(track);

      if (baseList.length === 0) {
        track.appendChild(el("p", "empty-note", t("empty.month")));
      } else if (filteredList.length === 0) {
        track.appendChild(el("p", "empty-note", noMatchText()));
      } else {
        var monthFirst = y + "-" + pad(m + 1) + "-01";
        var monthLast = y + "-" + pad(m + 1) + "-" + pad(nDays);
        var segments = filteredList.map(function (ev) {
          var continuesPrev = ev.startDate < monthFirst, continuesNext = ev.endDate > monthLast;
          var segStartDay = continuesPrev ? 1 : parseISO(ev.startDate).getDate();
          var segEndDay = continuesNext ? nDays : parseISO(ev.endDate).getDate();
          var startPx = (segStartDay - 1) * DAY_W;
          var naturalW = (segEndDay - segStartDay + 1) * DAY_W;
          var width = Math.min(Math.max(naturalW, MIN_PILL_W), nDays * DAY_W - startPx);
          // Very late one-day events would be squeezed; shift them back so
          // the name stays readable.
          if (width < MIN_PILL_W) { startPx = Math.max(0, nDays * DAY_W - MIN_PILL_W); width = MIN_PILL_W; }
          return { ev: ev, startPx: startPx, width: width, continuesPrev: continuesPrev, continuesNext: continuesNext };
        }).sort(function (a, b) { return a.startPx - b.startPx; });

        var laneEnds = [];
        segments.forEach(function (seg) {
          var lane = 0;
          while (lane < laneEnds.length && laneEnds[lane] + PILL_GAP > seg.startPx) lane++;
          laneEnds[lane] = seg.startPx + seg.width;
          seg.lane = lane;
        });
        track.style.minHeight = (laneEnds.length * (PILL_H + PILL_GAP) + PILL_GAP) + "px";

        segments.forEach(function (seg) {
          var pill = makePill(seg.ev, (seg.continuesPrev ? " continues-prev" : "") + (seg.continuesNext ? " continues-next" : ""), seg);
          // inline-start: days run right-to-left on the Arabic page.
          pill.style.insetInlineStart = seg.startPx + "px";
          pill.style.width = seg.width + "px";
          pill.style.top = (seg.lane * (PILL_H + PILL_GAP) + PILL_GAP) + "px";
          track.appendChild(pill);
        });
      }

      scrollWrap.appendChild(inner);
      row.appendChild(scrollWrap);
      root.appendChild(row);
    });

    // Undated engagements get their own row instead of disappearing.
    var tbcBase = base.filter(function (ev) { return !ev.startDate; });
    if (tbcBase.length) {
      var tbcVisible = visible.filter(function (ev) { return !ev.startDate; });
      var row = el("div", "month-row month-row--tbc");
      row.appendChild(el("div", "month-id",
        '<span class="month-badge month-badge--tbc">' + t("tbcShort") + '</span><span class="month-name">' + t("datesWord") + '<span class="month-year">' + t("tbcSub") + "</span></span>"));
      var track = el("div", "tbc-track");
      if (!tbcVisible.length) track.appendChild(el("p", "empty-note", noMatchText()));
      tbcVisible.forEach(function (ev) { track.appendChild(makePill(ev, " is-static")); });
      row.appendChild(track);
      root.appendChild(row);
    }

    scrollToToday();
    updateToolbar(visible.length);
  }

  // On narrow screens, start the current month's row scrolled to today.
  // Re-run on window load: before the stylesheet applies, the row is not
  // yet a scroll container and scrollLeft is ignored. (In right-to-left
  // layout, browsers count scrollLeft as negative from the right edge.)
  function scrollToToday() {
    var wrap = document.querySelector(".month-row.is-current .month-scroll");
    if (wrap) wrap.scrollLeft = (RTL ? -1 : 1) * Math.max(0, (+TODAY.slice(8) - 4) * DAY_W);
  }
  window.addEventListener("load", scrollToToday);

  /* ----------------------------------------------------------------- *
   * List view — grouped by month, across years
   * ----------------------------------------------------------------- */
  function renderList() {
    var root = document.getElementById("listCards");
    root.innerHTML = "";
    var base = periodEvents();
    var visible = base.filter(function (ev) { return matchesFilters(ev); });
    updateToolbar(visible.length);

    if (!base.length) { root.appendChild(emptyState(t("empty.soon"))); return; }
    if (!visible.length) { root.appendChild(emptyState(noMatchText())); return; }

    groupByMonth(visible).forEach(function (g) {
      var section = el("section", "list-group");
      section.setAttribute("aria-label", g.label);
      var head = el("div", "list-group-head");
      head.appendChild(el("h3", "list-group-title", esc(g.label) + ' <span class="list-group-count">' + g.items.length + "</span>"));
      if (!IS_EMBED) {
        var pr = el("button", "icon-btn icon-btn--quiet", ICONS.printer + '<span class="icon-btn-label">' + esc(t("printMonth", { m: g.label })) + "</span>");
        pr.type = "button";
        pr.addEventListener("click", function () { printView(g.key); });
        head.appendChild(pr);
      }
      section.appendChild(head);
      var grid = el("div", "cards-grid");
      g.items.forEach(function (ev) { grid.appendChild(renderCard(ev)); });
      section.appendChild(grid);
      root.appendChild(section);
    });
  }

  function renderCard(ev) {
    var tm = T.themeMeta(ev.theme);
    var card = el("article", "event-card");

    var dateBlock = el("div", "date-block");
    dateBlock.setAttribute("aria-hidden", "true");
    dateBlock.style.background = tm.color;
    if (tm.darkText) dateBlock.style.color = "var(--black)";
    if (!ev.startDate) {
      dateBlock.innerHTML = '<span class="day day--tbc">' + t("tbcShort") + "</span>";
    } else {
      var s = parseISO(ev.startDate);
      dateBlock.innerHTML =
        '<span class="day">' + s.getDate() + "</span>" +
        '<span class="mon">' + MONTH_ABBR[s.getMonth()] + " " + String(s.getFullYear()).slice(2) + "</span>" +
        (ev.startDate !== ev.endDate ? '<span class="range">' + t("toDate", { d: formatCompact(ev.endDate, ev.endDate) + (ev.endDate.slice(0, 4) !== ev.startDate.slice(0, 4) ? " " + ev.endDate.slice(0, 4) : "") }) + "</span>" : "");
    }
    card.appendChild(dateBlock);

    var action = actionFor(ev);
    var body = el("div", "event-card-body");
    body.innerHTML =
      '<h3 dir="auto"><button type="button" class="card-open" aria-haspopup="dialog">' + esc(ev.name) + "</button></h3>" +
      '<p class="card-when">' + ICONS.calendar + "<span>" + formatDateRange(ev.startDate, ev.endDate) + "</span></p>" +
      '<div class="tag-row">' + tagRowHTML(ev, true) + "</div>" +
      '<p class="desc" dir="auto">' + esc(summaryText(ev.description)) + "</p>" +
      '<div class="card-footer">' + statusBadge(ev.status) +
      (action ? '<a class="btn btn--sm btn--ghost card-action" href="' + esc(ev.link) + '" target="_blank" rel="noopener">' + action.label + '<span class="visually-hidden"> ' + t("newTab") + "</span></a>" : "") +
      "</div>";
    card.appendChild(body);

    var openBtn = body.querySelector(".card-open");
    openBtn.addEventListener("click", function () { openDetail(ev.id, openBtn); });
    // Whole card is clickable for pointer users; keyboard users get the
    // title button (one tab stop) and the action link.
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      openDetail(ev.id, openBtn);
    });
    return card;
  }

  /* ----------------------------------------------------------------- *
   * Hero, right: the soonest engagements whose registration or
   * applications are open.
   * ----------------------------------------------------------------- */
  function renderOpenNow() {
    var wrap = document.getElementById("openNow");
    // One entry per series ("Governance Sprint — Session 1/2/3" shows once)
    // so the list covers more than one programme.
    var seenSeries = {};
    var picks = EVENTS.filter(function (ev) {
      return ev.startDate && ev.endDate >= TODAY && ev.link && T.statusTone(ev.status) === "open" && ev.status !== "Ongoing";
    }).sort(byStart).filter(function (ev) {
      var series = ev.name.split(/\s+[—–]\s+/)[0].toLowerCase();
      if (seenSeries[series]) return false;
      seenSeries[series] = true;
      return true;
    }).slice(0, 4);
    wrap.hidden = !picks.length;
    if (!picks.length) return;
    document.getElementById("openNowTitle").textContent = t("openReg");
    var list = document.getElementById("openNowList");
    list.innerHTML = "";
    picks.forEach(function (ev) {
      var s = parseISO(ev.startDate);
      var li = el("li");
      var btn = el("button", "open-item");
      btn.type = "button";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.style.setProperty("--accent", T.themeMeta(ev.theme).color);
      btn.innerHTML =
        '<span class="open-date"><span class="open-day">' + s.getDate() + '</span><span class="open-month">' + MONTH_ABBR[s.getMonth()] + "</span></span>" +
        '<span class="open-body"><span class="open-name" dir="auto">' + esc(ev.name) + "</span>" +
        '<span class="open-meta">' + esc(L(ev.scope)) + ", " + esc(AR ? L(ev.type) : L(ev.type).toLowerCase()) + "</span></span>" +
        '<span class="open-cta">' + actionFor(ev).label + "</span>";
      btn.addEventListener("click", function () { openDetail(ev.id, btn); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ----------------------------------------------------------------- *
   * Hero, bottom: the months ahead, every upcoming engagement drawn as a
   * bar in its theme colour at its real dates. Select a bar to open it.
   * ----------------------------------------------------------------- */
  function renderRibbon() {
    var fig = document.getElementById("ribbon");
    var upcoming = EVENTS.filter(function (ev) { return ev.startDate && ev.endDate >= TODAY; }).sort(byStart);
    if (!upcoming.length) { fig.hidden = true; return; }

    // Six to twelve months, from this month to the last announced event.
    var fromYM = nowYM();
    var lastYM = Math.max.apply(null, upcoming.map(function (ev) { return ymOf(ev.endDate); }));
    var toYM = Math.min(Math.max(lastYM, fromYM + 5), fromYM + 11);
    var rangeStart = new Date(Math.floor(fromYM / 12), fromYM % 12, 1);
    var rangeEnd = new Date(Math.floor(toYM / 12), toYM % 12 + 1, 0);
    var DAY = 86400000;
    var total = Math.round((rangeEnd - rangeStart) / DAY) + 1;
    function offset(iso) { return Math.round((parseISO(iso) - rangeStart) / DAY); }
    function pct(days) { return (days / total * 100).toFixed(3) + "%"; }

    var inner = document.getElementById("ribbonInner");
    inner.innerHTML = "";
    var months = el("div", "ribbon-months");
    months.setAttribute("aria-hidden", "true");
    for (var ym = fromYM; ym <= toYM; ym++) {
      var y = Math.floor(ym / 12), m = ym % 12;
      var col = el("div", "ribbon-month", '<span class="ribbon-month-name">' + MONTH_ABBR[m] + (m === 0 || ym === fromYM ? " " + y : "") + "</span>");
      col.style.width = pct(daysInMonth(y, m));
      months.appendChild(col);
    }
    inner.appendChild(months);

    var track = el("div", "ribbon-track");
    var BAR_H = 12, GAP = 7, laneEnds = [];
    var shown = 0;
    upcoming.forEach(function (ev) {
      var a = Math.max(0, offset(ev.startDate)), b = Math.min(total - 1, offset(ev.endDate));
      if (a > total - 1) return;
      var lane = 0;
      while (lane < laneEnds.length && laneEnds[lane] + 3 > a) lane++;
      laneEnds[lane] = Math.max(b, a + 2);
      var tm = T.themeMeta(ev.theme);
      var bar = el("button", "ribbon-bar" + (tm.group === "Other" ? " is-other" : ""));
      bar.type = "button";
      bar.style.insetInlineStart = pct(a);
      bar.style.width = "max(10px, " + pct(b - a + 1) + ")";
      bar.style.top = (lane * (BAR_H + GAP)) + "px";
      bar.style.background = tm.color;
      bar.style.setProperty("--i", shown++);
      bar.setAttribute("aria-haspopup", "dialog");
      bar.setAttribute("aria-label", ev.name + ", " + formatDateRange(ev.startDate, ev.endDate));
      bar.title = ev.name + "\n" + formatDateRange(ev.startDate, ev.endDate);
      bar.addEventListener("click", function () { openDetail(ev.id, bar); });
      track.appendChild(bar);
    });
    track.style.height = (laneEnds.length * (BAR_H + GAP) - GAP) + "px";
    var today = el("div", "ribbon-today", '<span>' + esc(t("today")) + "</span>");
    today.style.insetInlineStart = pct(offset(TODAY));
    track.appendChild(today);
    inner.appendChild(track);

    document.getElementById("ribbonTitle").textContent = t("ribbon.title");
    var groups = {};
    upcoming.forEach(function (ev) { groups[T.themeMeta(ev.theme).group] = T.themeMeta(ev.theme).color; });
    document.getElementById("ribbonLegend").innerHTML = Object.keys(groups).map(function (g) {
      return '<span class="ribbon-key"><span class="ribbon-key-swatch' + (g === "Other" ? " is-other" : "") + '" style="background:' + groups[g] + '"></span>' + esc(L(g)) + "</span>";
    }).join("");
    fig.hidden = false;
  }

  /* ----------------------------------------------------------------- *
   * Print / PDF: a clean month-by-month table of what is currently shown
   * (or of a single month), built just before the print dialog opens.
   * ----------------------------------------------------------------- */
  var printMonthKey = null, printPrepared = false;

  function buildPrintView() {
    var root = document.getElementById("printView");
    var groups = groupByMonth(visibleEvents());
    if (printMonthKey !== null) groups = groups.filter(function (g) { return g.key === printMonthKey; });

    var filterBits = [];
    FILTERS.forEach(function (f) { if (state.filters[f.key] !== "All") filterBits.push(L(state.filters[f.key])); });
    if (state.search) filterBits.push(t("print.search", { q: state.search }));
    var subtitle = printMonthKey !== null && groups.length ? groups[0].label : periodLabel();

    var html =
      '<header class="print-head">' +
      '<img src="assets/ungc-emblem.png" alt="" />' +
      "<div><h1>" + esc(AR ? CFG.calendarNameAr : CFG.calendarName) + "</h1>" +
      '<p class="print-sub">' + esc(subtitle) + (filterBits.length ? " · " + esc(t("print.filters", { f: filterBits.join(", ") })) : "") + "</p>" +
      '<p class="print-meta">' + (LAST_UPDATED ? esc(t("lastUpdated", { d: formatLongDate(LAST_UPDATED) })) + " · " : "") +
      esc(t("printed", { d: formatLongDate(new Date()) })) + " · " + esc(pageBase()) + "</p></div>" +
      "</header>";

    if (!groups.length) html += "<p>" + esc(noMatchText()) + "</p>";
    groups.forEach(function (g) {
      html += "<section><h2>" + esc(g.label) + "</h2><table><thead><tr>" +
        "<th>" + t("print.col.date") + "</th><th>" + t("print.col.event") + "</th><th>" + t("print.col.theme") + "</th><th>" + t("print.col.status") + "</th><th>" + t("print.col.link") + "</th>" +
        "</tr></thead><tbody>";
      g.items.forEach(function (ev) {
        var tm = T.themeMeta(ev.theme);
        var sub = [ev.location, L(ev.scope), L(ev.format), L(ev.type)].filter(Boolean).join(" · ");
        var tl = timeLine(ev);
        html += "<tr>" +
          "<td>" + esc(formatDateRange(ev.startDate, ev.endDate)) + (tl ? '<div class="print-small">' + esc(tl) + "</div>" : "") + "</td>" +
          '<td dir="auto"><strong>' + esc(ev.name) + '</strong><div class="print-small">' + esc(sub) + "</div></td>" +
          '<td><span class="print-swatch" style="background:' + tm.color + '"></span>' + esc(L(tm.label)) + "</td>" +
          "<td>" + esc(L(ev.status)) + "</td>" +
          '<td class="print-link">' + (ev.link ? esc(ev.link.replace(/^https?:\/\//, "")) : "—") + "</td>" +
          "</tr>";
      });
      html += "</tbody></table></section>";
    });
    root.innerHTML = html;
    printPrepared = true;
  }

  function printView(monthKey) {
    printMonthKey = monthKey === undefined ? null : monthKey;
    buildPrintView();
    window.print();
  }
  // Ctrl+P / the browser menu print what's on screen too.
  window.addEventListener("beforeprint", function () { if (!printPrepared) buildPrintView(); });
  window.addEventListener("afterprint", function () { printPrepared = false; printMonthKey = null; });

  /* ----------------------------------------------------------------- *
   * Detail panel
   * ----------------------------------------------------------------- */
  var panel, overlay;

  function findContact(ref) {
    if (!ref) return null;
    var k = ref.toLowerCase();
    return CONTACTS.filter(function (c) { return c.key === k || c.name.toLowerCase() === k || c.email.toLowerCase() === k; })[0] || null;
  }

  function openDetail(eventId, triggerEl) {
    var ev = EVENTS.filter(function (e) { return e.id === eventId; })[0];
    if (!ev) return;
    if (panel.hidden) state.lastFocusedEl = triggerEl || document.activeElement;

    var tm = T.themeMeta(ev.theme);
    var themeTagEl = document.getElementById("detailThemeTag");
    themeTagEl.innerHTML = themeIcon(ev.theme) + " " + esc(L(tm.label));
    themeTagEl.style.background = tm.color;
    themeTagEl.style.color = tm.darkText ? "var(--black)" : "#fff";

    document.getElementById("detailTitle").textContent = ev.name;
    document.getElementById("detailDate").textContent = formatDateRange(ev.startDate, ev.endDate);

    var meta = "";
    var tl = timeLine(ev);
    if (tl) meta += "<li>" + ICONS.clock + "<span>" + esc(tl) + "</span></li>";
    if (ev.location) meta += "<li>" + ICONS.pin + '<span dir="auto">' + esc(ev.location) + "</span></li>";
    var metaEl = document.getElementById("detailMeta");
    metaEl.innerHTML = meta;
    metaEl.hidden = !meta;

    document.getElementById("detailTags").innerHTML = tagRowHTML(ev, false);
    document.getElementById("detailStatus").innerHTML = statusBadge(ev.status);
    document.getElementById("detailDescription").innerHTML = formatDescription(ev.description);

    var contactWrap = document.getElementById("detailContact");
    contactWrap.innerHTML = "";
    var person = findContact(ev.contact);
    if (person && !IS_EMBED) {
      var link = el("a", "detail-contact-link", esc(t("contactPerson", { name: person.name.split(" ")[0] })) + " " + ICONS.arrow);
      link.href = "#contact-" + person.key;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        closeDetail();
        goToContact(person.key);
      });
      contactWrap.appendChild(link);
    } else {
      var email = person ? person.email : (/@/.test(ev.contact) ? ev.contact : "");
      if (email) {
        var mail = el("a", "detail-contact-link", esc(t("emailPerson", { email: person ? person.name : email })) + " " + ICONS.arrow);
        mail.href = "mailto:" + email;
        contactWrap.appendChild(mail);
      }
    }
    contactWrap.hidden = !contactWrap.childNodes.length;

    var actionsWrap = document.getElementById("detailActions");
    actionsWrap.innerHTML = "";
    var action = actionFor(ev);
    if (action) {
      var a = el("a", "btn btn--on-light", esc(action.label) + ' <span class="visually-hidden">' + t("newTab") + "</span>" + ICONS.external);
      a.href = ev.link; a.target = "_blank"; a.rel = "noopener";
      actionsWrap.appendChild(a);
    }
    if (ev.brochure) {
      var b = el("a", "btn btn--ghost", ICONS.document + " " + esc(t("brochure")));
      b.href = ev.brochure; b.target = "_blank"; b.rel = "noopener";
      actionsWrap.appendChild(b);
    }

    var calWrap = document.getElementById("detailCalendar");
    calWrap.innerHTML = "";
    calWrap.hidden = !canAddToCalendar(ev);
    if (canAddToCalendar(ev)) {
      calWrap.appendChild(el("span", "detail-calendar-label", esc(t("addToCalendar"))));
      var ics = el("button", "btn btn--ghost btn--sm", ICONS.calendarPlus + " Outlook / Apple (.ics)");
      ics.type = "button";
      ics.addEventListener("click", function () { downloadFile(ev.id + ".ics", buildICS([ev]), "text/calendar;charset=utf-8"); });
      var g = el("a", "btn btn--ghost btn--sm", ICONS.calendarPlus + ' Google Calendar<span class="visually-hidden"> ' + t("newTab") + "</span>");
      g.href = googleCalendarUrl(ev); g.target = "_blank"; g.rel = "noopener";
      calWrap.appendChild(ics);
      calWrap.appendChild(g);
    }

    var copyBtn = document.getElementById("detailCopyLink");
    copyBtn.setAttribute("aria-label", t("copyLink"));
    copyBtn.title = t("copyLink");
    copyBtn.onclick = function () {
      copyText(eventShareUrl(ev)).then(function () { toast(t("linkCopied")); });
    };

    state.openEvent = ev.id;
    syncURL();

    if (panel.hidden) {
      ["main", "siteHeader", "siteFooter", "contact"].forEach(function (id) { document.getElementById(id).setAttribute("inert", ""); });
      overlay.hidden = false;
      panel.hidden = false;
      document.body.classList.add("panel-open");
      document.addEventListener("keydown", onPanelKeydown, true);
    }
    panel.scrollTop = 0;
    document.getElementById("detailPanelClose").focus();
  }

  function closeDetail() {
    if (panel.hidden) return;
    panel.hidden = true;
    overlay.hidden = true;
    document.body.classList.remove("panel-open");
    ["main", "siteHeader", "siteFooter", "contact"].forEach(function (id) { document.getElementById(id).removeAttribute("inert"); });
    document.removeEventListener("keydown", onPanelKeydown, true);
    state.openEvent = null;
    syncURL();
    if (state.lastFocusedEl && typeof state.lastFocusedEl.focus === "function" && document.body.contains(state.lastFocusedEl)) {
      state.lastFocusedEl.focus();
    }
  }

  function goToContact(key) {
    var target = document.getElementById("contact-" + key);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("is-highlighted");
    window.setTimeout(function () { target.classList.remove("is-highlighted"); }, 2200);
  }

  function onPanelKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeDetail(); return; }
    if (e.key === "Tab") {
      var focusables = panel.querySelectorAll("a[href], button:not([disabled])");
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ----------------------------------------------------------------- *
   * Controls: filters, search, period, view toggle, theme tiles, toolbar
   * ----------------------------------------------------------------- */
  function renderCurrentView() {
    updateThemeChips();
    if (state.view === "timeline") renderTimeline(); else renderList();
    syncURL();
  }

  function filterOptions(f) {
    if (f.key === "theme") return T.THEME_FILTERS.slice();
    var values = {};
    if (f.key === "scope") ["Global", "Regional"].concat(CFG.countries).forEach(function (v) { values[v] = true; });
    EVENTS.forEach(function (ev) { if (ev[f.key]) values[ev[f.key]] = true; });
    return Object.keys(values).sort(f.sort);
  }

  function setupFilters() {
    FILTERS.forEach(function (f) {
      if (!f.id) return;
      var sel = document.getElementById(f.id);
      sel.innerHTML = "";
      ["All"].concat(filterOptions(f)).forEach(function (val) {
        var opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val === "All" ? t("all." + f.key) : L(val);
        sel.appendChild(opt);
      });
      sel.value = state.filters[f.key];
      sel.addEventListener("change", function () {
        state.filters[f.key] = sel.value;
        updateResetButton();
        renderCurrentView();
      });
    });

    document.getElementById("resetFilters").addEventListener("click", function () {
      FILTERS.forEach(function (f) { state.filters[f.key] = "All"; if (f.id) document.getElementById(f.id).value = "All"; });
      state.search = "";
      document.getElementById("eventSearch").value = "";
      updateResetButton();
      renderCurrentView();
    });
    updateResetButton();
  }

  function setupSearch() {
    var input = document.getElementById("eventSearch");
    input.value = state.search;
    var timer;
    input.addEventListener("input", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        state.search = input.value.trim().toLowerCase();
        updateResetButton();
        renderCurrentView();
      }, 120);
    });
  }

  function updateResetButton() {
    document.getElementById("resetFilters").disabled = isDefaultFilters();
  }

  function setupPeriod() {
    var wrap = document.getElementById("periodToggle");
    var years = dataYears();
    if (typeof state.period === "number" && years.indexOf(state.period) === -1) years.push(state.period);
    var options = [{ value: "upcoming", label: t("period.upcoming") }]
      .concat(years.sort().map(function (y) { return { value: y, label: String(y) }; }))
      .concat([{ value: "all", label: t("period.all") }]);
    wrap.innerHTML = "";
    options.forEach(function (o) {
      var btn = el("button", "", o.label);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(state.period === o.value));
      btn.addEventListener("click", function () {
        state.period = o.value;
        wrap.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        renderCurrentView();
      });
      wrap.appendChild(btn);
    });
  }

  function setupViewToggle() {
    var timelineBtn = document.getElementById("viewTimelineBtn");
    var listBtn = document.getElementById("viewListBtn");
    function apply() {
      timelineBtn.setAttribute("aria-pressed", String(state.view === "timeline"));
      listBtn.setAttribute("aria-pressed", String(state.view === "list"));
      document.getElementById("timelineView").hidden = state.view !== "timeline";
      document.getElementById("listCards").hidden = state.view !== "list";
    }
    timelineBtn.addEventListener("click", function () { state.view = "timeline"; apply(); renderCurrentView(); });
    listBtn.addEventListener("click", function () { state.view = "list"; apply(); renderCurrentView(); });
    apply();
  }

  function setupToolbarButtons() {
    function label(id, text) {
      var b = document.getElementById(id);
      b.querySelector(".icon-btn-label").textContent = text;
      return b;
    }
    label("shareViewBtn", t("shareView")).addEventListener("click", function () {
      copyText(urlWith(stateParams())).then(function () { toast(t("viewCopied")); });
    });
    label("addAllBtn", t("addAll")).addEventListener("click", function () {
      var events = visibleEvents().filter(canAddToCalendar);
      if (events.length) downloadFile("ungc-middle-east-calendar.ics", buildICS(events), "text/calendar;charset=utf-8");
    });
    label("printBtn", t("print")).addEventListener("click", function () { printView(null); });
  }

  // The four Ten Principles areas as toggle chips: they are the theme
  // filter and the colour key at once, each with its number of engagements
  // under the other filters.
  function setupThemeChips() {
    var wrap = document.getElementById("themeChips");
    ["All"].concat(T.THEME_FILTERS).forEach(function (val) {
      var chip = el("button", "theme-chip" + (val === "All" ? " theme-chip--all" : ""));
      chip.type = "button";
      chip.setAttribute("data-value", val);
      if (val !== "All") chip.style.setProperty("--chip", T.themeMeta(val).color);
      chip.innerHTML = (val === "All" ? "" : '<span class="theme-chip-swatch" aria-hidden="true"></span>') +
        '<span class="theme-chip-label">' + esc(val === "All" ? t("all.theme") : L(val)) + "</span>" +
        '<span class="theme-chip-count"></span>';
      chip.addEventListener("click", function () {
        state.filters.theme = val;
        updateResetButton();
        renderCurrentView();
      });
      wrap.appendChild(chip);
    });
  }
  // The four pillar cards above the calendar: each shows its number of
  // upcoming engagements and jumps to the calendar filtered to it.
  function setupPillars() {
    var upcoming = EVENTS.filter(function (ev) { return !ev.startDate || ev.endDate >= TODAY; });
    document.querySelectorAll(".pillar[data-theme-filter]").forEach(function (card) {
      var val = card.getAttribute("data-theme-filter");
      var n = upcoming.filter(function (ev) { return T.themeMeta(ev.theme).group === val; }).length;
      card.querySelector(".pillar-count").textContent = n ? t("pillar.count", { n: n }) : t("pillar.none");
      card.addEventListener("click", function () {
        state.filters.theme = val;
        updateResetButton();
        renderCurrentView();
        document.getElementById("calendar").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function updateThemeChips() {
    var base = periodEvents().filter(function (ev) { return matchesFilters(ev, true); });
    document.querySelectorAll("#themeChips .theme-chip").forEach(function (chip) {
      var val = chip.getAttribute("data-value");
      var n = val === "All" ? base.length : base.filter(function (ev) { return T.themeMeta(ev.theme).group === val; }).length;
      chip.querySelector(".theme-chip-count").textContent = n;
      chip.setAttribute("aria-pressed", String(state.filters.theme === val));
    });
  }

  function setupColorModeToggle() {
    var toggle = document.getElementById("themeToggle");
    toggle.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      try { localStorage.setItem("ungc-me-color-mode", next); } catch (e) {}
    });
    toggle.setAttribute("aria-pressed", String(document.documentElement.getAttribute("data-theme") === "dark"));
  }

  function applyStaticIcons() {
    document.querySelectorAll("[data-icon]").forEach(function (node) {
      var key = node.getAttribute("data-icon");
      if (ICONS[key]) node.innerHTML = ICONS[key];
    });
  }

  /* ----------------------------------------------------------------- *
   * Data-driven page sections: last updated, contacts, networks
   * ----------------------------------------------------------------- */
  function renderLastUpdated(date) {
    document.querySelectorAll("[data-last-updated]").forEach(function (node) {
      if (!date) { node.hidden = true; return; }
      node.hidden = false;
      node.innerHTML = t("lastUpdated", { d: '<time datetime="' + toISO(date) + '">' + formatLongDate(date) + "</time>" });
    });
  }

  function renderContacts() {
    var list = document.getElementById("contactList");
    list.innerHTML = "";
    CONTACTS.forEach(function (c) {
      var li = el("li", "contact-item");
      li.id = "contact-" + c.key;
      li.innerHTML =
        '<p class="contact-name"><strong>' + esc(c.name) + "</strong>" +
        (c.email ? ' <span class="sep">|</span> <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>" : "") + "</p>" +
        ((c.role || c.network) ? '<p class="role">' + esc([c.role, c.network].filter(Boolean).join(", ")) + "</p>" : "");
      list.appendChild(li);
    });
    if (CFG.generalEmail) {
      var li = el("li", "contact-item");
      li.innerHTML = '<p class="contact-name"><strong>' + esc(t("generalEnquiries")) + '</strong> <span class="sep">|</span> <a href="mailto:' + esc(CFG.generalEmail) + '">' + esc(CFG.generalEmail) + "</a></p>";
      list.appendChild(li);
    }
    // No named contacts yet: point people to their Local Network instead.
    var hasPeople = !!list.childNodes.length;
    if (!hasPeople) {
      CFG.networks.forEach(function (n) {
        var name = AR && n.nameAr ? n.nameAr : n.name;
        var li = el("li", "contact-item contact-item--network");
        li.innerHTML = n.url
          ? '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(name) + '<span class="visually-hidden"> ' + t("newTab") + "</span></a>"
          : "<span>" + esc(name) + "</span>";
        list.appendChild(li);
      });
    }
    document.getElementById("contactFallback").hidden = hasPeople;
  }

  function renderNetworks() {
    var band = document.getElementById("networkLogos");
    CFG.networks.forEach(function (n) {
      var tag = n.url ? "a" : "div";
      var name = AR && n.nameAr ? n.nameAr : n.name;
      var logo = AR && n.logoAr ? n.logoAr : n.logo;
      var item = el(tag, "network-logo", '<img src="' + esc(logo) + '" alt="' + esc(name) + '" />');
      if (n.url) { item.href = n.url; item.target = "_blank"; item.rel = "noopener"; }
      band.appendChild(item);
    });
  }

  /* ----------------------------------------------------------------- *
   * Init
   * ----------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    I18N.apply();
    applyStaticIcons();
    panel = document.getElementById("detailPanel");
    overlay = document.getElementById("overlay");
    document.getElementById("detailPanelClose").addEventListener("click", closeDetail);
    overlay.addEventListener("click", closeDetail);
    document.getElementById("copyrightYear").textContent = new Date().getFullYear();

    setupColorModeToggle();
    renderNetworks();
    updateLangToggle();
    updateEmbedLink();
    document.getElementById("langToggle").addEventListener("click", function () {
      try { localStorage.setItem("ungc-me-lang", AR ? "en" : "ar"); } catch (e) {}
    });

    DATA.load().then(function (res) {
      EVENTS = res.events;
      CONTACTS = res.contacts;
      LAST_UPDATED = res.lastUpdated;
      // Read before the first render, which rewrites the URL.
      var shared = eventFromHash();
      readURL();
      renderLastUpdated(res.lastUpdated);
      renderContacts();
      renderOpenNow();
      renderRibbon();
      setupFilters();
      setupThemeChips();
      setupPillars();
      setupSearch();
      setupPeriod();
      setupViewToggle();
      setupToolbarButtons();
      document.getElementById("calendarBody").removeAttribute("aria-busy");
      renderCurrentView();

      // A shared event link (#event=id) opens that event straight away,
      // with the calendar scrolled into view behind it.
      if (shared) {
        if (!IS_EMBED) document.getElementById("calendar").scrollIntoView({ block: "start" });
        openDetail(shared, null);
      }
      window.addEventListener("hashchange", function () {
        var id = eventFromHash();
        if (id && id !== state.openEvent) openDetail(id, null);
      });
    }).catch(function (err) {
      console.error(err);
      var root = document.getElementById("timelineView");
      root.innerHTML = "";
      root.appendChild(emptyState(t("load.error")));
      document.getElementById("calendarBody").removeAttribute("aria-busy");
      renderContacts();
    });
  });
})();
