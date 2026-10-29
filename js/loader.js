/**
 * Reads the events in js/data.js, tidies each one (dates, accepted values,
 * status) and reports anything it had to guess or skip in the browser
 * console (F12), so a typo never breaks the whole page.
 *
 * Event shape produced:
 * {
 *   id, name, startDate, endDate   ("YYYY-MM-DD" | null — null = date TBC),
 *   startTime, endTime             ("HH:MM" | ""), timezone (IANA name),
 *   location, scope, format, type, theme, description (plain text),
 *   participation, status, link, brochure, contact
 * }
 */
(function () {
  "use strict";

  var T = window.CAL_TAXONOMY;
  var CFG = window.CAL_CONFIG;

  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(y, m, d) {
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return undefined;
    return y + "-" + pad(m) + "-" + pad(d);
  }

  // Returns "YYYY-MM-DD", null for an intentionally empty/TBC value, or
  // undefined when there is something we cannot read.
  function parseDate(s) {
    s = String(s || "").trim();
    if (!s || /^(tbc|tbd|tba|n\/?a|-)$/i.test(s)) return null;
    var m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return iso(+m[1], +m[2], +m[3]);
    // Day first (the region's convention): 19/11/2026, 19.11.2026
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/))) return iso(+m[3], +m[2], +m[1]);
    // 19 November 2026, 19 Nov 2026
    if ((m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,})\.?,?\s+(\d{4})/i))) {
      var mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
      if (mi !== -1) return iso(+m[3], mi + 1, +m[1]);
    }
    return undefined;
  }

  // "12:00", "9:30", "3 pm" → "HH:MM"; "" when empty; undefined if unreadable.
  function parseTime(s) {
    s = String(s || "").trim().toLowerCase().replace(/\./g, "");
    if (!s) return "";
    var m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!m) return undefined;
    var h = +m[1], min = m[2] ? +m[2] : 0;
    if (m[3] === "pm" && h < 12) h += 12;
    if (m[3] === "am" && h === 12) h = 0;
    if (h > 23 || min > 59) return undefined;
    return pad(h) + ":" + pad(min);
  }

  var TZ_ALIASES = {
    dubai: "Asia/Dubai", "abu dhabi": "Asia/Dubai", uae: "Asia/Dubai", gst: "Asia/Dubai",
    beirut: "Asia/Beirut", lebanon: "Asia/Beirut",
    riyadh: "Asia/Riyadh", ksa: "Asia/Riyadh", "saudi arabia": "Asia/Riyadh",
    amman: "Asia/Amman", jordan: "Asia/Amman",
    utc: "UTC", gmt: "UTC", "new york": "America/New_York"
  };
  function parseTimezone(s) {
    s = String(s || "").trim();
    if (!s) return CFG.defaultTimezone;
    var tz = TZ_ALIASES[s.toLowerCase()] || s;
    try { new Intl.DateTimeFormat("en", { timeZone: tz }); return tz; }
    catch (e) { return undefined; }
  }

  // Only http(s), mailto and relative file paths — never javascript: etc.
  function safeUrl(s) {
    s = String(s || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s) || /^mailto:/i.test(s)) return s;
    if (/^www\./i.test(s)) return "https://" + s;
    if (!/^[a-z][a-z0-9+.\-]*:/i.test(s)) return s;
    return undefined;
  }

  function slug(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event";
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // An empty status is worked out from the dates, and anything whose end
  // date has passed reads "Completed" — so the page never shows a stale
  // "Registration open" badge on a finished event.
  function resolveStatus(given, startDate, endDate, today) {
    var status = T.normStatus(given);
    if (!startDate) return status || "Date to be confirmed";
    if (endDate < today) return "Completed";
    if (status) return status;
    return startDate <= today ? "Ongoing" : "Upcoming";
  }

  function normalizeEvents(list, warnings) {
    var today = todayISO();
    var seen = {};
    var out = [];
    (list || []).forEach(function (o, i) {
      o = o || {};
      var name = String(o.name || "").trim();
      var label = "Event " + (i + 1) + (name ? " (" + name + ")" : "");
      function warn(msg) { warnings.push(label + ": " + msg); }
      if (!name) { warn("no name — skipped."); return; }

      var start = parseDate(o.startDate);
      var end = parseDate(o.endDate);
      if (start === undefined) { warn('startDate "' + o.startDate + '" not recognised — shown as date to be confirmed. Use "2026-11-19".'); start = null; }
      if (end === undefined) { warn('endDate "' + o.endDate + '" not recognised — using the start date.'); end = null; }
      if (start && !end) end = start;
      if (!start && end) start = end;
      if (start && end < start) { warn("endDate is before startDate — swapped."); var tmp = start; start = end; end = tmp; }

      var startTime = parseTime(o.startTime), endTime = parseTime(o.endTime);
      if (startTime === undefined) { warn('startTime "' + o.startTime + '" not recognised — ignored.'); startTime = ""; }
      if (endTime === undefined) { warn('endTime "' + o.endTime + '" not recognised — ignored.'); endTime = ""; }
      var tz = parseTimezone(o.timezone);
      if (tz === undefined) { warn('timezone "' + o.timezone + '" not recognised — using ' + CFG.defaultTimezone + "."); tz = CFG.defaultTimezone; }

      var scope = T.normScope(o.scope);
      if (!scope) { warn("no scope — set to Regional."); scope = "Regional"; }

      var link = safeUrl(o.link), brochure = safeUrl(o.brochure);
      if (link === undefined) { warn("link is not a web address — ignored."); link = ""; }
      if (brochure === undefined) { warn("brochure is not a web address — ignored."); brochure = ""; }

      var id = o.id ? slug(o.id) : slug(name + (start ? "-" + start.slice(0, 7) : ""));
      if (seen[id]) { var n = 2; while (seen[id + "-" + n]) n++; id = id + "-" + n; }
      seen[id] = true;

      out.push({
        id: id,
        name: name,
        startDate: start,
        endDate: end,
        startTime: start ? startTime : "",
        endTime: start ? endTime : "",
        timezone: tz,
        location: String(o.location || "").trim(),
        scope: scope,
        format: T.normFormat(o.format),
        type: T.normType(o.type) || "Event",
        theme: T.normTheme(o.theme),
        description: String(o.description || "").trim(),
        participation: T.normParticipation(o.participation) || "Open to all participants",
        status: resolveStatus(o.status, start, end, today),
        link: link,
        brochure: brochure,
        contact: String(o.contact || "").trim()
      });
    });
    return out;
  }

  function normalizeContacts(list) {
    return (list || []).filter(function (c) { return c && c.name; }).map(function (c) {
      return { key: slug(c.key || c.name), name: c.name, role: c.role || "", email: c.email || "", network: c.network || "" };
    });
  }

  // Kept as a promise so the page code doesn't care where events come from.
  function load() {
    return new Promise(function (resolve, reject) {
      if (!Array.isArray(window.CAL_EVENTS)) {
        reject(new Error("js/data.js did not load or has a typo (missing quote, comma or `)."));
        return;
      }
      var warnings = [];
      var events = normalizeEvents(window.CAL_EVENTS, warnings);
      var lastUpdated = parseDate(window.CAL_LAST_UPDATED);
      warnings.forEach(function (w) { console.warn("[calendar] " + w); });
      resolve({
        events: events,
        contacts: normalizeContacts(window.CAL_CONTACTS),
        lastUpdated: lastUpdated ? new Date(lastUpdated + "T00:00:00") : null,
        warnings: warnings
      });
    });
  }

  window.CAL_DATA = { load: load, parseDate: parseDate, todayISO: todayISO };
})();
