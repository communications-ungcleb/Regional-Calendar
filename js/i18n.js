/**
 * English / Arabic interface text.
 *
 * The page's static English text lives in index.html; elements carrying
 * data-i18n="key" get the Arabic below when the language is Arabic. Text
 * built in JavaScript always goes through t(), so it needs both languages.
 * Spreadsheet values (scope, type, theme…) are translated by label().
 *
 * The Arabic here was written for this page and should be reviewed by a
 * native-speaking colleague before launch.
 */
(function () {
  "use strict";

  var lang = document.documentElement.lang === "ar" ? "ar" : "en";

  var EN = {
    "doc.title": "Middle East Engagement Calendar — UN Global Compact",
    loading: "Loading engagements…",
    "count.one": "{n} engagement", "count.many": "{n} engagements",
    "count.upcoming": "upcoming", "count.inYear": "in {y}", "count.filtered": "match your filters", "count.filtered1": "matches your filters",
    "period.upcoming": "Upcoming", "period.all": "All dates",
    "all.scope": "All locations", "all.format": "All formats", "all.type": "All types", "all.theme": "All themes", "all.participation": "Everyone",
    "empty.month": "No engagements announced yet.", "empty.filtered": "No engagements match the selected filters.", "empty.soon": "More opportunities will be announced soon.",
    "load.error": "The events could not be shown. js/data.js has a typo, often a missing quote, comma or ` mark. Press F12 and open Console to see the line.",
    today: "Today", "ribbon.title": "The months ahead. Select a bar to open that engagement.",
    "pillar.count": "{n} upcoming", "pillar.none": "None scheduled yet",
    thisMonth: "This month", tbcShort: "TBC", datesTbc: "Dates to be confirmed", dateTbc: "Date to be confirmed", tbcSub: "to be confirmed", datesWord: "Dates",
    toDate: "to {d}",
    register: "Register", apply: "Apply", learnMore: "Learn more", newTab: "(opens in a new tab)",
    brochure: "Download brochure", addToCalendar: "Add to your calendar",
    contactPerson: "Contact {name} for more details", emailPerson: "Email {email}", generalEnquiries: "General enquiries",
    timeIn: "{range} {city} time", yourTime: "{range} your time",
    copyLink: "Copy link to this event", linkCopied: "Link copied", viewCopied: "Link to this view copied",
    shareView: "Share this view", addAll: "Add to calendar", addAllTitle: "Download the {n} upcoming engagements shown as one calendar file", print: "Print / PDF", printMonth: "Print {m}",
    lastUpdated: "Last updated {d}", printed: "Printed {d}",
    nextUp: "Next up", openReg: "Open for registration", seeAll: "See the full calendar",
    embedFull: "Open the full Middle East Engagement Calendar",
    "print.col.date": "Date", "print.col.event": "Engagement", "print.col.theme": "Theme", "print.col.status": "Status", "print.col.link": "Register / details",
    "print.filters": "Filtered by: {f}", "print.search": "search “{q}”",
    langSwitch: "العربية"
  };

  var AR = {
    "doc.title": "تقويم المشاركة في الشرق الأوسط — الاتفاق العالمي للأمم المتحدة",
    skip: "تخطَّ إلى التقويم",
    "brand.name": "الاتفاق العالمي للأمم المتحدة", "brand.sub": "الشرق الأوسط",
    "nav.darkMode": "الوضع الداكن",
    "hero.title": "تقويم المشاركة في الشرق الأوسط",
    "hero.lede": "البرامج والفعاليات وفرص المشاركة العالمية والإقليمية والمحلية للمشاركين في الاتفاق العالمي للأمم المتحدة في الأردن ولبنان والمملكة العربية السعودية والإمارات العربية المتحدة.",
    "cal.title": "التقويم",
    "search.placeholder": "ابحث بالاسم أو البلد أو الموضوع أو كلمة مفتاحية…", "search.label": "ابحث في الفعاليات",
    "filter.scope": "الموقع", "filter.format": "الصيغة", "filter.type": "نوع الفعالية", "filter.theme": "المحور", "filter.participation": "من يمكنه المشاركة", reset: "إعادة الضبط",
    "view.label": "طريقة العرض", "view.timeline": "المخطط الزمني", "view.list": "القائمة", "period.label": "الفترة الزمنية",
    "contact.title": "هل لديك سؤال حول إحدى الفعاليات؟", "contact.fallback": "تواصل مع الشبكة المحلية للاتفاق العالمي للأمم المتحدة في بلدك.",
    "footer.text": "تساعد الشبكات المحلية للاتفاق العالمي للأمم المتحدة الشركات في أنحاء الشرق الأوسط على تطبيق المبادئ العشرة للاتفاق العالمي وتحقيق أهداف التنمية المستدامة.",
    "footer.calendar": "التقويم", "footer.browse": "تصفّح الفعاليات", "footer.contact": "اتصل بنا",
    "footer.ungc": "الاتفاق العالمي للأمم المتحدة", "footer.principles": "المبادئ العشرة", "footer.networks": "الشبكات المحلية",
    "footer.copyright": "الشبكات المحلية للاتفاق العالمي للأمم المتحدة في الشرق الأوسط.",
    closeDetails: "إغلاق التفاصيل",

    loading: "جارٍ تحميل الفعاليات…",
    "count.one": "فعالية واحدة", "count.two": "فعاليتان", "count.few": "{n} فعاليات", "count.many": "{n} فعالية",
    "count.upcoming": "قادمة", "count.inYear": "في {y}", "count.filtered": "مطابقة لخيارات التصفية",
    "period.upcoming": "القادمة", "period.all": "كل التواريخ",
    "all.scope": "كل المواقع", "all.format": "كل الصيغ", "all.type": "كل الأنواع", "all.theme": "كل المحاور", "all.participation": "الجميع",
    "empty.month": "لم يُعلَن عن فعاليات بعد.", "empty.filtered": "لا توجد فعاليات مطابقة لخيارات التصفية.", "empty.soon": "سيُعلَن عن مزيد من الفرص قريبًا.",
    "load.error": "تعذّر عرض الفعاليات بسبب خطأ في ملف js/data.js.",
    today: "اليوم", "ribbon.title": "الأشهر المقبلة. اختر أي شريط لفتح الفعالية.",
    "hero.browse": "تصفّح التقويم",
    "pillar.count": "القادمة: {n}", "pillar.none": "لا فعاليات مقرّرة بعد",
    "pillars.title": "المحاور الأربعة للمبادئ العشرة",
    "tile.hr": "حقوق الإنسان", "tile.hr.text": "احترام الشركات لحقوق الإنسان، بما في ذلك العناية الواجبة وتقييم الأثر.",
    "tile.labour": "العمل", "tile.labour.text": "معايير العمل والعمل اللائق والأجور المعيشية في العمليات وسلاسل الإمداد.",
    "tile.env": "البيئة", "tile.env.text": "الطموح المناخي والقدرة على الصمود في مجال المياه والممارسات الداعمة للطبيعة.",
    "tile.ac": "مكافحة الفساد", "tile.ac.text": "نزاهة الأعمال والحوكمة الرشيدة ومكافحة الفساد بجميع أشكاله.",
    "band.title": "بالتعاون مع الشبكات المحلية للاتفاق العالمي للأمم المتحدة في",
    thisMonth: "هذا الشهر", tbcShort: "لاحقًا", datesTbc: "مواعيد تُحدَّد لاحقًا", dateTbc: "الموعد يُحدَّد لاحقًا", tbcSub: "تُحدَّد لاحقًا", datesWord: "المواعيد",
    toDate: "حتى {d}",
    register: "سجّل الآن", apply: "قدّم طلبك", learnMore: "اعرف المزيد", newTab: "(يُفتح في علامة تبويب جديدة)",
    brochure: "تنزيل الكتيّب", addToCalendar: "أضف إلى تقويمك",
    contactPerson: "تواصل مع {name} لمزيد من التفاصيل", emailPerson: "راسل {email}", generalEnquiries: "الاستفسارات العامة",
    timeIn: "{range} بتوقيت {city}", yourTime: "{range} بتوقيتك",
    copyLink: "نسخ رابط هذه الفعالية", linkCopied: "تم نسخ الرابط", viewCopied: "تم نسخ رابط هذا العرض",
    shareView: "مشاركة هذا العرض", addAll: "أضف إلى التقويم", addAllTitle: "نزّل الفعاليات القادمة المعروضة ({n}) في ملف تقويم واحد", print: "طباعة / PDF", printMonth: "طباعة {m}",
    lastUpdated: "آخر تحديث {d}", printed: "طُبع في {d}",
    nextUp: "الفعاليات القادمة", openReg: "التسجيل مفتوح", seeAll: "عرض التقويم الكامل",
    embedFull: "افتح تقويم المشاركة الكامل في الشرق الأوسط",
    "print.col.date": "التاريخ", "print.col.event": "الفعالية", "print.col.theme": "المحور", "print.col.status": "الحالة", "print.col.link": "التسجيل / التفاصيل",
    "print.filters": "التصفية: {f}", "print.search": "البحث عن «{q}»",
    langSwitch: "English"
  };

  // Spreadsheet vocabulary → Arabic. Unknown values are shown as typed.
  var LABELS_AR = {
    "Global": "عالمي", "Regional": "إقليمي", "Jordan": "الأردن", "Lebanon": "لبنان", "Saudi Arabia": "المملكة العربية السعودية", "UAE": "الإمارات",
    "In person": "حضوري", "Online": "عبر الإنترنت", "Hybrid": "هجين", "Format TBC": "الصيغة تُحدَّد لاحقًا",
    "Conference": "مؤتمر", "Event": "فعالية", "Webinar": "ندوة عبر الإنترنت", "Workshop": "ورشة عمل", "Training": "تدريب", "Peer Learning": "التعلّم بين الأقران",
    "Accelerator": "برنامج تسريع", "Programme": "برنامج", "Report Launch": "إطلاق تقرير", "General Assembly": "الجمعية العامة", "Campaign": "حملة",
    "Human Rights": "حقوق الإنسان", "Labour": "العمل", "Decent Work": "العمل اللائق", "Environment": "البيئة", "Climate": "المناخ", "Water": "المياه",
    "Anti-Corruption": "مكافحة الفساد", "Governance": "الحوكمة", "Community Impact": "الأثر المجتمعي", "Other": "أخرى",
    "Open to all participants": "مفتوح لجميع المشاركين", "Businesses only": "للشركات فقط", "Non-businesses only": "لغير الشركات فقط",
    "Registered participants": "للمشاركين المسجّلين", "By invitation": "بدعوة", "Youth initiative": "مبادرة شبابية", "Public": "مفتوح للعموم",
    "Registration open": "التسجيل مفتوح", "Applications open": "باب التقديم مفتوح", "Ongoing": "جارٍ", "Applications opening soon": "يُفتح باب التقديم قريبًا",
    "Registration opening soon": "يُفتح التسجيل قريبًا", "Upcoming": "قادم", "Recruitment period": "فترة الاستقطاب", "Registration closed": "التسجيل مغلق",
    "Completed": "مكتمل", "Date to be confirmed": "الموعد يُحدَّد لاحقًا"
  };

  var CITIES_AR = { "Dubai": "دبي", "Beirut": "بيروت", "Riyadh": "الرياض", "Amman": "عمّان", "UTC": "UTC", "Zurich": "زيورخ", "New York": "نيويورك" };

  var MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  };
  var MONTHS_SHORT = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    ar: MONTHS.ar
  };

  function t(key, vars) {
    var dict = lang === "ar" ? AR : EN;
    var s = dict[key] != null ? dict[key] : EN[key] != null ? EN[key] : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }

  // Arabic has distinct forms for 1, 2, 3–10 and 11+.
  function count(n) {
    if (lang !== "ar") return t(n === 1 ? "count.one" : "count.many", { n: n });
    if (n === 1) return t("count.one");
    if (n === 2) return t("count.two");
    return t(n >= 3 && n <= 10 ? "count.few" : "count.many", { n: n });
  }

  function label(value) { return lang === "ar" && LABELS_AR[value] ? LABELS_AR[value] : value; }
  function city(name) { return lang === "ar" && CITIES_AR[name] ? CITIES_AR[name] : name; }

  // Swap static text for Arabic. data-i18n sets the text; data-i18n-attr
  // takes "attribute:key" pairs separated by ";".
  function apply(root) {
    if (lang !== "ar") return;
    (root || document).querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = AR[n.getAttribute("data-i18n")];
      if (v != null) n.textContent = v;
    });
    (root || document).querySelectorAll("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (AR[p[1]] != null) n.setAttribute(p[0], AR[p[1]]);
      });
    });
    document.title = AR["doc.title"];
  }

  window.CAL_I18N = {
    lang: lang,
    isRTL: lang === "ar",
    t: t,
    count: count,
    label: label,
    city: city,
    apply: apply,
    months: MONTHS[lang],
    monthsShort: MONTHS_SHORT[lang]
  };
})();
