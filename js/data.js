/**
 * THE EVENTS — edit this file to add, change or remove engagements.
 *
 * Each engagement is one { … } block below. To add one, copy a block, paste
 * it after the last one (keep the comma between blocks) and change the text.
 * Save the file and refresh the page — that's all.
 *
 *   name           Title of the engagement.                          (needed)
 *   startDate      "2026-11-19" (year-month-day). Leave out if the date is
 *                  not known yet — it shows as "Date to be confirmed".
 *   endDate        Last day. Leave out for one-day events.
 *   startTime      "12:00" (24-hour). Optional. endTime is optional too.
 *   timezone       Time zone of those times: "Asia/Dubai", "Asia/Beirut",
 *                  "Asia/Riyadh", "Asia/Amman". Optional (default Dubai).
 *   location       Venue, city or "Online via Zoom".
 *   scope          "Global", "Regional", "Jordan", "Lebanon",
 *                  "Saudi Arabia" or "UAE".                          (needed)
 *   format         "In person", "Online" or "Hybrid".
 *   type           e.g. "Webinar", "Workshop", "Conference", "Accelerator",
 *                  "Programme", "Training", "Campaign".
 *   theme          Sets the colour: "Human Rights", "Labour", "Environment"
 *                  (or "Climate", "Water"), "Anti-Corruption" (or
 *                  "Governance"), "Community Impact" or "Other".
 *   participation  e.g. "Open to all participants", "Businesses only",
 *                  "By invitation", "Public".
 *   status         Optional, e.g. "Registration open", "Applications opening
 *                  soon". Leave out and it is worked out from the dates;
 *                  past events always show "Completed".
 *   link           Registration or information web address (https://…).
 *   brochure       Optional link to a PDF (web address or "assets/file.pdf").
 *   contact        Optional: a key from CAL_CONTACTS below, or an email.
 *   description    Between the ` ` marks. Leave an empty line between
 *                  paragraphs; start a line with "- " for a bullet point.
 *   id             Optional short code used in links to the event. Once
 *                  shared, don't change it.
 *
 * Text must stay inside its quotes. If the page shows no events after an
 * edit, a quote, comma or ` is probably missing — press F12 to see where.
 */

// Shown on the page as "Last updated …". Change it when you edit events.
window.CAL_LAST_UPDATED = "2026-10-29";

// People listed under "Contact us". Events can point to one with
// contact: "key". Example:
//   { key: "jane", name: "Jane Doe", role: "Programmes Lead", email: "jane@example.org", network: "Global Compact Network Jordan" }
window.CAL_CONTACTS = [
];

window.CAL_EVENTS = [
  {
    id: "bridging-the-water-gap",
    name: "Bridging the Water Gap: Building Water Resilience for Business",
    startDate: "2026-11-19",
    endDate: "2026-11-19",
    startTime: "12:00",
    timezone: "Asia/Dubai",
    location: "Online via Zoom",
    scope: "Regional",
    format: "Online",
    type: "Webinar",
    theme: "Water",
    participation: "Open to all participants",
    status: "Registration open",
    link: "https://us02web.zoom.us/webinar/register/WN_vdX4fwuVQOyNA9jjdvtyCQ",
    description: `Water-related risks are increasingly affecting business operations, supply chains and long-term resilience across the Middle East and Asia Pacific. Ahead of the 2026 UN Water Conference in Abu Dhabi, this cross-regional webinar will bring together companies from both regions to explore emerging water risks and practical approaches to water stewardship, efficiency and collective action.

12:00 p.m. Dubai | 3:00 p.m. Bangkok | 10:00 a.m. Beirut | 11:00 a.m. Riyadh

Speakers:
- Adam Saffian Ghazali, CEO, Air Selangor, Malaysia
- Natasha Gabriella, Head of Sustainability, Coca-Cola Europacific Partners, Indonesia
- Ibrahim Alhelali, Ministry of Environment, Water and Agriculture, Saudi Arabia
- Prof. Ian Overton, Director, Water Data Science and Country Manager for Sri Lanka, International Water Management Institute (IWMI)

You will:
- Understand emerging water trends, risks and expectations in both regions
- Get practical guidance on water stewardship, efficiency and collective action
- Hear real examples from companies in the Middle East and Asia Pacific`
  },
  {
    id: "business-human-rights-accelerator-2027",
    name: "Business & Human Rights Accelerator 2027",
    startDate: "2027-02-02",
    endDate: "2027-04-22",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Accelerator",
    theme: "Human Rights",
    participation: "Businesses only",
    status: "Registration open",
    link: "https://unglobalcompact.org/take-action/business-and-human-rights",
    description: `A three-month programme, in collaboration with Shift, supporting participating companies of the UN Global Compact to strengthen their approach to human rights and labour rights. Now in its fifth year, it has reached more than 6,000 participants from 3,000 companies worldwide, and this round includes a dedicated Middle East track.

Your company will come away with:
- A practical Action Plan for its most salient human rights and labour rights risks
- An ongoing due diligence approach aligned with the UN Guiding Principles
- Readiness for evolving human rights due diligence requirements
- A certificate of completion and a network of peers, UN partners and experts

Key dates:
- Programme opens: 2 February 2027
- Global Deep Dives: 25 February, 18 March and 22 April 2027
- Action Plan submission: June 2027`
  },
  {
    id: "business-integrity-accelerator-2027",
    name: "Business Integrity Accelerator",
    startDate: "2027-03-01",
    endDate: "2027-08-31",
    location: "Online",
    scope: "Global",
    format: "Online",
    type: "Accelerator",
    theme: "Anti-Corruption",
    participation: "Businesses only",
    status: "Applications opening soon",
    link: "https://unglobalcompact.org/take-action/business-integrity-accelerator",
    description: `A new programme that helps companies go beyond compliance and put integrity at the heart of their strategies, decisions and operations. From March to August 2027, the programme will support companies in assessing where they are on their business integrity journey and developing an Action Plan with concrete internal, external and collective targets.

Your company will:
- See where it stands on integrity and get a clear roadmap for improvement
- Strengthen its compliance programme, including whistleblowing channels, risk assessment and due diligence
- Take part in collective action and learn from peers at national, regional and global level
- Be better prepared to complete its Communication on Progress

Who can join: participating companies of all sizes and maturity levels. Each company takes part with two managers (compliance, legal, risk, audit, HR, procurement or similar) and one senior ambassador.

Applications open in November 2026.`
  },
  {
    id: "un-water-conference-2026",
    name: "2026 UN Water Conference",
    startDate: "2026-12-02",
    endDate: "2026-12-04",
    location: "Abu Dhabi, UAE",
    scope: "Global",
    format: "In person",
    type: "Conference",
    theme: "Water",
    participation: "By invitation",
    status: "Upcoming",
    description: `The 2026 United Nations Water Conference, hosted in Abu Dhabi, will bring together Member States, the UN system, business and civil society to accelerate progress on water and sanitation for all (SDG 6).`
  },
  {
    id: "cop31",
    name: "COP 31 United Nations Climate Change Conference",
    startDate: "2026-11-09",
    endDate: "2026-11-20",
    location: "Antalya, Türkiye",
    scope: "Global",
    format: "In person",
    type: "Conference",
    theme: "Climate",
    participation: "Public",
    status: "Upcoming",
    description: `Governments, businesses, civil society and international organisations will come together in Antalya to advance global climate action under the Paris Agreement, strengthen implementation and discuss the next phase of collective climate ambition.`
  },
  {
    id: "spark-2026",
    name: "SPARK 2026",
    startDate: "2026-09-10",
    endDate: "2026-12-09",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Programme",
    theme: "Other",
    participation: "Businesses only",
    status: "Ongoing",
    description: `SPARK is a regional learning programme designed to help SMEs and suppliers of companies strengthen sustainability practices across their value chains. Through practical learning sessions, tools and peer exchange, participants build their capacity across key environmental, social and governance topics, including greenhouse gas emissions, occupational safety and health, and supplier codes of conduct.

The 2026 cohort is currently underway. Registration is closed.`
  },
  {
    id: "climate-ambition-accelerator-2026",
    name: "Climate Ambition Accelerator",
    startDate: "2026-09-01",
    endDate: "2026-12-01",
    location: "Online",
    scope: "Global",
    format: "Online",
    type: "Accelerator",
    theme: "Climate",
    participation: "Businesses only",
    status: "Ongoing",
    description: `The Climate Ambition Accelerator supports companies in accelerating progress towards science-based emissions reduction targets and a credible transition to net zero, combining global and local learning, practical activities, peer exchange and insights from climate experts.

The 2026 cohort is currently underway. Registration for the 2027 cohort will open at a later stage.`
  },
  {
    id: "leaders-summit-2026",
    name: "UN Global Compact Leaders Summit 2026",
    startDate: "2026-09-22",
    endDate: "2026-09-23",
    location: "New York",
    scope: "Global",
    format: "In person",
    type: "Conference",
    theme: "Other",
    participation: "Public",
    description: `The UN Global Compact Leaders Summit convened business leaders, United Nations representatives, governments, civil society and sustainability experts to accelerate private-sector action on the Ten Principles and the Sustainable Development Goals.`
  },
  {
    id: "rbc-human-rights-due-diligence",
    name: "Responsible Business Conduct: Human Rights Due Diligence for Responsible Business Decision-Making",
    startDate: "2026-06-23",
    endDate: "2026-06-23",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Webinar",
    theme: "Human Rights",
    participation: "Open to all participants",
    description: `The first webinar in the regional Responsible Business Conduct series examined how human rights due diligence can strengthen business decision-making, risk management and accountability.`
  },
  {
    id: "rbc-strategic-communication",
    name: "Responsible Business Conduct: Strategic Communication for Responsible Business Conduct",
    startDate: "2026-06-30",
    endDate: "2026-06-30",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Webinar",
    theme: "Other",
    participation: "Open to all participants",
    description: `The second webinar in the regional Responsible Business Conduct series explored how organisations can communicate sustainability and human rights commitments clearly, credibly and responsibly.`
  },
  {
    id: "info-circle-green-public-procurement",
    name: "Regional Info-circle: Green Public Procurement",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Workshop",
    theme: "Environment",
    participation: "Open to all participants",
    description: `This regional info-circle introduced Green Public Procurement and explored how public purchasing can support sustainable markets, responsible suppliers and environmental objectives.`
  },
  {
    id: "me-regional-cop-workshop",
    name: "Middle East Regional CoP Workshop",
    startDate: "2026-07-15",
    endDate: "2026-07-15",
    location: "Online",
    scope: "Regional",
    format: "Online",
    type: "Workshop",
    theme: "Other",
    participation: "Open to all participants",
    description: `This regional session supported participating companies in navigating the Communication on Progress process, covering key requirements, policy updates, reporting timelines and practical guidance for submission on the UN Global Compact platform.`
  },
  {
    id: "governance-sprint-1",
    name: "Governance Sprint — Session 1: Corporate & Transformational Governance",
    startDate: "2026-11-24",
    endDate: "2026-11-24",
    timezone: "Asia/Beirut",
    location: "Online via Zoom",
    scope: "Lebanon",
    format: "Online",
    type: "Workshop",
    theme: "Governance",
    participation: "Businesses only",
    status: "Registration open",
    link: "https://us06web.zoom.us/meeting/register/BU0_6e3CRhaKIS3jItLRyA",
    description: `How governance shows up throughout the company — at board, senior and line-management level — and the UN Global Compact's strategy on Transformational Governance for more effective governance structures and systems.`
  },
  {
    id: "governance-sprint-2",
    name: "Governance Sprint — Session 2: Business Integrity for Anti-Corruption & Good Governance",
    startDate: "2026-11-25",
    endDate: "2026-11-25",
    timezone: "Asia/Beirut",
    location: "Online via Zoom",
    scope: "Lebanon",
    format: "Online",
    type: "Workshop",
    theme: "Anti-Corruption",
    participation: "Open to all participants",
    status: "Registration open",
    link: "https://us06web.zoom.us/meeting/register/UI24W3EZSgaK9PRx-FphZA",
    description: `An interactive session on using integrity as an anti-corruption tool across systems, operations and departments, with real-life Lebanese scenarios from different industries and situational quizzes.`
  },
  {
    id: "governance-sprint-3",
    name: "Governance Sprint — Session 3: AI Integrity & Transparency in the Workplace",
    startDate: "2026-11-26",
    endDate: "2026-11-26",
    timezone: "Asia/Beirut",
    location: "Online via Zoom",
    scope: "Lebanon",
    format: "Online",
    type: "Workshop",
    theme: "Governance",
    participation: "Open to all participants",
    status: "Registration open",
    link: "https://us06web.zoom.us/meeting/register/WQbGly_mR7is22kBA8_86Q",
    description: `A discussion led by seasoned experts on the transparent use of AI in the workplace, covering fairness, legal risk, regulatory direction, and the risks and opportunities AI brings to companies.`
  },
  {
    id: "business-value-of-sustainability-campaign",
    name: "The Business Value of Sustainability: Perspectives from the Middle East",
    scope: "Regional",
    format: "Online",
    type: "Campaign",
    theme: "Other",
    participation: "Public",
    description: `A new regional campaign bringing together the voices and experiences of business leaders from across the Middle East. In their own words, they will share how sustainability shows up in practical decisions and where it creates opportunity for their companies.

Stay tuned as we share the stories shaping responsible business across the region.`
  }
];
