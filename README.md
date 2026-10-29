# Middle East Engagement Calendar — UN Global Compact

A web page listing global, regional and local UN Global Compact engagements
for participants in Jordan, Lebanon, Saudi Arabia and the UAE. Plain
HTML/CSS/JS: no build step, no server, no spreadsheet.

**To view it:** double-click `index.html`.

## Adding or changing events

Everything is in **`js/data.js`**. Open it in any text editor (Notepad, VS
Code), and:

- **Add an event:** copy one `{ … }` block, paste it after the last one,
  keep the comma between blocks, and change the text.
- **Change an event:** edit its text between the quotes.
- **Remove an event:** delete its whole `{ … },` block.
- **"Last updated":** change `CAL_LAST_UPDATED` at the top of the file.
- **Contacts:** add people to `CAL_CONTACTS` (an example is in the file).
  Until then, the contact section lists the four Local Networks.

Save and refresh the page. The instructions at the top of `data.js` list
every field (name, dates, times, location, scope, format, type, theme,
participation, status, link, brochure, contact, description).

Things the page does for you:

- Past events show **Completed** on their own, and an event with no status
  gets one from its dates.
- An event with no `startDate` shows as **Date to be confirmed**.
- Descriptions: leave an empty line between paragraphs; start a line with
  `- ` for a bullet point.

If the page shows "The events could not be shown", a quote, comma or `` ` ``
is missing in `data.js`. Press F12 → Console to see the line.

## What's on the page

- **Hero:** the title, the engagements currently **open for registration**
  (one per series), and **the months ahead**: every upcoming engagement as
  a bar in its Ten Principles colour at its real dates, with today marked.
  Select a bar to open the engagement.
- **Local Networks band** with the four network logos.
- **Calendar:** search; **theme chips** (the Ten Principles areas with
  their counts, which work as the theme filter); filters for location,
  format, event type and who can take part; Timeline or List; a period
  switch (Upcoming, each year, All dates) so events running into the next
  year are never cut off.
- **Detail panel** for each engagement: times in the event's time zone and
  the visitor's, location, registration, brochure, contact, **add to
  calendar** (Outlook/Apple .ics and Google Calendar), and a copy-link
  button.
- **Toolbar:** *Share this view* (copies a link with the current filters),
  *Add to calendar* (all upcoming engagements shown, as one .ics file),
  *Print / PDF* (a clean month-by-month table; each month in the List view
  can also be printed alone).
- **Arabic:** the *العربية* button switches menus, labels, filters, dates
  and buttons to Arabic, laid out right to left. Event text shows as
  written in `data.js`. Lebanon and Saudi Arabia use their Arabic logos.
- **Light mode by default**, with a dark-mode switch.

## Project structure

```
index.html          The page
js/data.js          THE EVENTS (and contacts, last-updated date)
js/config.js        Site settings: names, Local Networks and logos, default time zone
js/taxonomy.js      Accepted values, colours and icons
js/i18n.js          Arabic interface text
js/loader.js        Tidies and checks the events
js/app.js           Everything the page does
js/icons.js         Line icons
css/styles.css      All styling
assets/             UN Global Compact emblem, Local Network logos
Logos CNs/          Original logo files (not used by the page)
```

## Links and embedding

The address bar always reflects what's on screen, so any view can be
bookmarked or sent:

| Parameter | Effect |
|---|---|
| `lang=ar` / `lang=en` | Language. |
| `view=list` | List view (default Timeline). |
| `period=2027` / `period=all` | Period (default Upcoming). |
| `scope`, `format`, `type`, `theme`, `who`, `q` | Filters and search, e.g. `scope=UAE`, `theme=Human%20Rights`. |
| `embed=1` | Calendar only, for a Local Network website. `mode=dark` for dark. |
| `#event=<id>` | Opens that event. |

To show the calendar on a Local Network's website once it is hosted,
paste this into the site, with your address and the country you want:

```html
<iframe src="https://YOUR-ADDRESS/index.html?embed=1&scope=Jordan" title="Middle East Engagement Calendar" style="width:100%;height:900px;border:0" loading="lazy"></iframe>
```

Add `&lang=ar` for Arabic.

## Hosting

Upload the folder to any web host (Netlify, GitHub Pages, SharePoint,
any web server). `Logos CNs/` and the `.docx` files do not need to be
uploaded.

## Accessibility

Skip link, visible keyboard focus, keyboard-operable controls (including
the months-ahead bars), a modal detail panel that traps focus and returns
it on close, a result count announced to screen readers, colour never the
only signal (every colour comes with a text label), reduced-motion
support. All event text is escaped before display and only `http(s)`,
`mailto` or relative links are accepted.

## Things to confirm

- Contacts in `js/data.js`, and the Local Network websites in
  `js/config.js` (only Lebanon's is set).
- Dates not stated in the newsletters: Business & Human Rights Accelerator
  end (22 April 2027, the last Deep Dive), Business Integrity Accelerator
  (1 March – 31 August 2027), 2026 UN Water Conference (2–4 December 2026,
  Abu Dhabi).
- Arabic interface text (`js/i18n.js`) should be reviewed by a
  native-speaking colleague. Jordan and the UAE have no Arabic logotype in
  `Logos CNs/`; add one to `assets/networks/` and set `logoAr` in
  `js/config.js`.
