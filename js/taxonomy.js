/**
 * Taxonomy: the vocabularies the spreadsheet columns map onto, with their
 * colours, icons and display order. Spreadsheet values are matched without
 * regard to case, and common spellings are accepted through the alias
 * tables (so "KSA", "online " or "In-person" all work). A value that matches
 * nothing is still shown as typed — it just gets neutral styling and sorts
 * after the known values in the filter dropdown.
 */
(function () {
  "use strict";

  // Ten Principles issue areas. Finer themes share their parent's colour and
  // icon (`group`), so the colour signal stays to a handful of values and the
  // Theme filter works by issue area.
  var THEMES = {
    "Human Rights": { group: "Human Rights", color: "#6E417A", icon: "humanRights" },
    "Labour": { group: "Labour", color: "#CCB146", icon: "labour" },
    "Decent Work": { group: "Labour", color: "#CCB146", icon: "labour" },
    "Environment": { group: "Environment", color: "#297D6D", icon: "environment" },
    "Climate": { group: "Environment", color: "#297D6D", icon: "environment" },
    "Water": { group: "Environment", color: "#297D6D", icon: "environment" },
    // Deepened brand red — #EC3740 fails WCAG AA behind white pill text.
    "Anti-Corruption": { group: "Anti-Corruption", color: "#D42D38", icon: "anticorruption" },
    "Governance": { group: "Anti-Corruption", color: "#D42D38", icon: "anticorruption" },
    // Global Compact Tone 2, reserved for community / youth engagements.
    "Community Impact": { group: "Community Impact", color: "#699CC6", icon: "other" },
    "Other": { group: "Other", color: "#1E3250", icon: "other" }
  };
  var THEME_ALIASES = { "human rights": "Human Rights", "labor": "Labour", "anticorruption": "Anti-Corruption", "anti corruption": "Anti-Corruption", "integrity": "Anti-Corruption", "general": "Other", "sdgs": "Other" };
  var THEME_FILTERS = ["Human Rights", "Labour", "Environment", "Anti-Corruption"];
  // Labour gold and Tone 2 blue are too light for white text at AA.
  var DARK_TEXT_GROUPS = { "Labour": true, "Community Impact": true };

  var SCOPES = ["Global", "Regional", "Jordan", "Lebanon", "Saudi Arabia", "UAE"];
  var SCOPE_ALIASES = {
    "middle east": "Regional", "me": "Regional", "region": "Regional", "mena": "Regional",
    "international": "Global",
    "ksa": "Saudi Arabia", "saudi": "Saudi Arabia", "kingdom of saudi arabia": "Saudi Arabia",
    "united arab emirates": "UAE", "emirates": "UAE",
    "hashemite kingdom of jordan": "Jordan"
  };
  var SCOPE_ICONS = { "Global": "globe", "Regional": "share" }; // countries → pin

  var FORMATS = ["In person", "Online", "Hybrid", "Format TBC"];
  var FORMAT_ALIASES = {
    "in-person": "In person", "inperson": "In person", "face to face": "In person", "face-to-face": "In person", "onsite": "In person", "on-site": "In person",
    "virtual": "Online", "remote": "Online", "webinar": "Online",
    "tbc": "Format TBC", "tbd": "Format TBC", "format tbd": "Format TBC", "": "Format TBC"
  };

  // status → badge tone (CSS .status--*). Order = filter/legend order.
  var STATUSES = {
    "Registration open": "open",
    "Applications open": "open",
    "Ongoing": "open",
    "Applications opening soon": "soon",
    "Registration opening soon": "soon",
    "Upcoming": "soon",
    "Recruitment period": "soon",
    "Registration closed": "closed",
    "Completed": "closed",
    "Date to be confirmed": "tbc"
  };
  var STATUS_ALIASES = { "open": "Registration open", "registration opens soon": "Registration opening soon", "applications open soon": "Applications opening soon", "closed": "Registration closed", "done": "Completed", "past": "Completed", "tbc": "Date to be confirmed", "tbd": "Date to be confirmed", "in progress": "Ongoing" };

  var TYPES = ["Conference", "Event", "Webinar", "Workshop", "Training", "Peer Learning", "Accelerator", "Programme", "Report Launch", "General Assembly", "Campaign"];
  var TYPE_ALIASES = { "accelerators": "Accelerator", "events": "Event", "webinars": "Webinar", "workshops": "Workshop", "program": "Programme", "programmes": "Programme", "programs": "Programme", "summit": "Conference" };

  var PARTICIPATION = ["Open to all participants", "Businesses only", "Non-businesses only", "Registered participants", "By invitation", "Youth initiative", "Public"];
  var PARTICIPATION_ALIASES = { "open to all": "Open to all participants", "all participants": "Open to all participants", "business only": "Businesses only", "companies only": "Businesses only", "invitation only": "By invitation", "by invitation only": "By invitation" };

  function lookup(value, canonical, aliases) {
    var v = String(value == null ? "" : value).trim();
    var key = v.toLowerCase().replace(/\s+/g, " ");
    if (aliases && Object.prototype.hasOwnProperty.call(aliases, key)) return aliases[key];
    var list = Array.isArray(canonical) ? canonical : Object.keys(canonical);
    for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === key) return list[i];
    return v;
  }
  function orderOf(list) {
    return function (a, b) {
      var ia = list.indexOf(a), ib = list.indexOf(b);
      if (ia === -1) ia = 999;
      if (ib === -1) ib = 999;
      return ia - ib || a.localeCompare(b);
    };
  }

  window.CAL_TAXONOMY = {
    THEME_FILTERS: THEME_FILTERS,
    normTheme: function (v) { return lookup(v, THEMES, THEME_ALIASES) || "Other"; },
    normScope: function (v) { return lookup(v, SCOPES, SCOPE_ALIASES); },
    normFormat: function (v) { return lookup(v, FORMATS, FORMAT_ALIASES) || "Format TBC"; },
    normStatus: function (v) { return lookup(v, STATUSES, STATUS_ALIASES); },
    normType: function (v) { return lookup(v, TYPES, TYPE_ALIASES); },
    normParticipation: function (v) { return lookup(v, PARTICIPATION, PARTICIPATION_ALIASES); },

    themeMeta: function (theme) {
      var m = THEMES[theme] || THEMES.Other;
      return { group: THEMES[theme] ? m.group : "Other", color: m.color, icon: m.icon, label: theme || "Other", darkText: !!DARK_TEXT_GROUPS[m.group] };
    },
    scopeIcon: function (scope) { return SCOPE_ICONS[scope] || "pin"; },
    statusTone: function (status) { return STATUSES[status] || "invite"; },
    knownStatuses: Object.keys(STATUSES),

    sortScopes: orderOf(SCOPES),
    sortFormats: orderOf(FORMATS),
    sortTypes: orderOf(TYPES),
    sortParticipation: orderOf(PARTICIPATION)
  };
})();
