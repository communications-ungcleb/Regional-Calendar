/**
 * Site settings: names, Local Networks, default time zone.
 * The events themselves are in js/data.js.
 */
window.CAL_CONFIG = {
  orgName: "UN Global Compact Middle East",
  calendarName: "Middle East Engagement Calendar",
  calendarNameAr: "تقويم المشاركة في الشرق الأوسط",
  countries: ["Jordan", "Lebanon", "Saudi Arabia", "UAE"],

  // Time zone assumed for event times when an event has no timezone. Any IANA name, e.g. "Asia/Dubai", "Asia/Beirut", "Asia/Riyadh".
  defaultTimezone: "Asia/Dubai",

  // General enquiries address shown in the contact section. Optional.
  generalEmail: "",

  // Local Networks shown under the hero and in the contact section. `url`
  // (the network's website) is optional.
  // logoAr / logoWhiteAr are the Arabic logotypes, used on the Arabic page
  // where a network has one (falls back to the English logo).
  networks: [
    { key: "jordan", name: "Global Compact Network Jordan", nameAr: "شبكة الاتفاق العالمي في الأردن", logo: "assets/networks/jordan.png", logoWhite: "assets/networks/jordan-white.png", url: "" },
    { key: "lebanon", name: "UN Global Compact Network Lebanon", nameAr: "شبكة الاتفاق العالمي في لبنان", logo: "assets/networks/lebanon.png", logoWhite: "assets/networks/lebanon-white.png", logoAr: "assets/networks/lebanon-ar.png", logoWhiteAr: "assets/networks/lebanon-ar-white.png", url: "https://ungcnlebanon.org/" },
    { key: "saudi-arabia", name: "Global Compact Network Saudi Arabia", nameAr: "شبكة الاتفاق العالمي في المملكة العربية السعودية", logo: "assets/networks/saudi-arabia.png", logoWhite: "assets/networks/saudi-arabia-white.png", logoAr: "assets/networks/saudi-arabia-ar.png", logoWhiteAr: "assets/networks/saudi-arabia-ar-white.png", url: "" },
    { key: "uae", name: "Global Compact Network UAE", nameAr: "شبكة الاتفاق العالمي في الإمارات", logo: "assets/networks/uae.png", logoWhite: "assets/networks/uae-white.png", url: "" }
  ]
};
