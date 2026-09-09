# AIESEC in Bangladesh — Official Website

A fully responsive, SEO-optimized static website for AIESEC in Bangladesh, built with
semantic HTML5, modern CSS (variables, Flexbox/Grid), and vanilla JavaScript. No build
tools or frameworks required.

## File structure

```
/
├── index.html              Home
├── about.html               About Us
├── for-students.html        For Students (hub)
├── volunteer-abroad.html    Global Volunteer program
├── intern-abroad.html       Global Talent (internship) program
├── teach-abroad.html        Global Teacher program
├── for-organizations.html   Hire an Intern / Volunteer / Teacher, Employer Branding
├── local-committees.html    4 Local Committees
├── success-stories.html     Filterable exchange stories
├── blog.html                Blog / News grid
├── events.html               YSF, Women in STEM, Global Village, WLL, Food Heroes, YWB
├── faq.html                  Accordion FAQ with schema markup
├── contact.html               Contact form + embedded map
├── careers.html               Internal recruitment / open roles
├── join-member.html           Membership application form
├── css/style.css              Full design system (variables, components, responsive)
├── js/main.js                 Cursor, header, nav, loader, counters, accordion, forms
├── assets/images/              Logos, program marks, favicon (from provided brand assets)
├── sitemap.xml
├── robots.txt
└── README.md
```

## Design system

- **Core colors:** AIESEC Blue `#037EF3`, white, off-white `#FAFAF8`, light grey `#F3F3F3`, ink `#101820`.
- **Program accents:** Volunteer `#F85A40`, Teach `#F48924`, Intern/Talent `#0CB9C1`, Membership `#037EF3`.
- **Events accents:** `#7552CC` / `#00C16E`.
- **Type:** Space Grotesk (headings) + Inter (body), loaded from Google Fonts.
- All tokens live at the top of `css/style.css` under `:root`.

## Features implemented

- Sticky header with mega-menu navigation, mobile slide-in nav
- Custom cursor (desktop/pointer devices only — automatically disabled on touch)
- Page-load and page-transition loader using the AIESEC walking-figure mark
- Scroll-reveal animations, animated stat counters, hover states throughout
- Floating WhatsApp button, back-to-top button
- FAQ accordions with `FAQPage` JSON-LD schema
- Filterable Success Stories / Blog grids
- Membership application form (Name, Age, University, Hometown, Phone, Department, Email, WhatsApp)
- Organization inquiry form and general contact form (front-end only — see below)
- `Organization` JSON-LD on every page, Open Graph + Twitter Card meta, canonical tags
- `sitemap.xml` and `robots.txt`

## Homepage hero carousel

The homepage hero (`index.html`, `.hero-carousel`) is a full-bleed, auto-advancing
3-slide photo carousel modeled on aiesec.in's homepage: dark gradient overlay for
legibility, a slow "Ken Burns" zoom on each photo, an uppercase eyebrow tag, a
crossfading headline/subhead that changes per slide, left/right arrow controls,
bottom-left stat counter, scroll cue, and dot pagination — all driven by
`initHeroCarousel()` in `js/main.js`.

To add your own photos, just replace these three files (keep the same filenames,
or update the `background-image: url(...)` paths in `index.html` if you rename them):

- `assets/images/hero-slide-1.jpg`
- `assets/images/hero-slide-2.jpg`
- `assets/images/hero-slide-3.jpg`

They're currently branded gradient placeholders (clearly marked "PLACEHOLDER" in the
corner) so the carousel works out of the box — swap them for real photography (ideally
1920×1080 or larger, landscape, with the main subject slightly left-of-center so it
isn't hidden behind the text). Each slide carries `data-eyebrow`, `data-title`,
`data-lede`, `data-stat`, `data-suffix`, and `data-label` attributes on the
`.hero-slide` element in the HTML — edit those directly to change the headline,
subtext, and stat counter shown while that slide is active.

## Header

The header matches your reference: transparent over the hero, solidifying to white on
scroll. Top-level nav is **About Us · For Students · For Organizations · Contact**,
plus a white "Find Opportunities" pill button. Local Committees, Blog, Events, Success
Stories, FAQ, Careers, and Join as Member live inside the **For Students** mega menu —
all of it is also listed in full in the footer.

The dropdown-disappearing bug is fixed — there's no longer a dead gap between the nav
link and the menu that closed it before your cursor could reach it.

## Page loader

The loader between page navigations is now a simple, neutral spinner with an empty
placeholder slot (`id="loader-logo"`, the `.loader-logo-slot` div right at the top of
`<div id="page-loader">` in every page's HTML) — drop your own static logo `<img>` in
there and it'll show above the spinner on every page transition.

## Individual Event &amp; Blog pages

Every event and blog post now has its own page instead of a shared list with a
generic button:

- **Events** (`event-*.html`, 6 pages — Youth Speaking Forum, Women in STEM, Global
  Village, World's Largest Lesson, Food Heroes, Youth Without Borders): each covers
  what the event is, event details (format/audience/duration), how it aligns with
  youth development, how organizations can partner, and how to participate.
  `events.html` is now just an index of cards linking to these.
- **Blog** (`blog-*.html`, 6 pages): each is a full article with real section
  headings and body copy, built from one shared template in `build_pages.py`.
  `blog.html` is the index. Since they're generated from one template, duplicating
  a new post is just copying one `dict(...)` entry in the `posts` list in
  `build_pages.py` and re-running it — or, if you're not touching the Python build
  script, just copy any `blog-*.html` file, rename it, and edit the text directly.

## Leadership: National Member Committee &amp; Board of Advisors

The About page now lists the full **National Member Committee** (8 roles: President,
VP Talent Management, VP Business Development, VP Finance &amp; Legal, VP Marketing,
VP Outgoing Exchange, VP Incoming Exchange, VP Information Management) and a
**Board of Advisors** section (9 roles: Chairperson, Vice Chairperson, and 7
subject-area advisors). Each card shows a photo, name, role, and LinkedIn + email
icons.

Everything is placeholder — replace before launch:

- **Names/roles/emails/LinkedIn URLs:** edit the `mc_members` and `boa_members` lists
  near the top of the "ABOUT US" section in `build_pages.py` (each entry is
  `(name, role, email, linkedin_url, photo_filename)`), then re-run
  `python3 build_pages.py`. If you're not touching the Python build script, you can
  instead edit the real names/emails/links directly inside the rendered
  `about.html` — search for `team-card`.
- **Photos:** drop real headshots into `assets/images/team/`, keeping the same
  filenames used in `mc_members`/`boa_members` (e.g. `mc-president.jpg`,
  `boa-chairperson.jpg`) so they show up automatically. They're currently colored
  circular placeholders.

## Placeholder content to replace before launch

- **Hero photos:** see "Homepage hero carousel" above.
- **Loader logo:** see "Page loader" above.
- **Team photos, names, emails, LinkedIn:** see "Leadership" above.
- **Logos:** `assets/images/aiesec-logo-primary*.png` were generated from the brand
  marks you attached. Swap in your official vector/SVG logo files when available.
- **Partner logos:** the partner strip currently uses text placeholders — replace with
  real partner logo images.
- **Stats:** member counts, exchange totals, and alumni numbers in the Home and About
  stat sections are placeholders — update with your real figures.
- **Team photos:** the About page leadership grid uses icon placeholders instead of
  real headshots.
- **WhatsApp number:** the floating button links to a placeholder number
  (`js`-free, set directly in each page's footer markup) — update to your real WhatsApp
  Business number.
- **Google Map:** the Contact page embeds a generic "Dhaka, Bangladesh" map — replace
  the query in the iframe `src` with your exact office address once confirmed.
- **Domain:** canonical URLs, sitemap, and Open Graph tags use the placeholder domain
  `https://aiesec-bangladesh.org` — do a find-and-replace with your real domain.

## Forms — now emailing aiesec.bangladesh@aiesec.net

`join-member.html`, `contact.html`, `for-organizations.html`, and the **footer
newsletter signup** on every page now all send their submissions to
**aiesec.bangladesh@aiesec.net**, using [FormSubmit](https://formsubmit.co) — a free
service that forwards form submissions to an email address with no backend or
account required.

**One-time step:** the very first submission from your live domain triggers a
confirmation email to `aiesec.bangladesh@aiesec.net` from FormSubmit — someone needs
to click the confirmation link in that email once before submissions start arriving
normally. Until then, submissions are silently dropped. This activation is tied to
the *email address*, not each individual form — so once it's confirmed, all four
forms work without any further setup.

How it works, in case you want to change the destination email or add a form field:

- Each `<form>` has `data-email-endpoint="https://formsubmit.co/ajax/EMAIL"` — change
  the email in that URL to redirect submissions elsewhere.
- Every `<input>`/`<select>`/`<textarea>` needs a `name="..."` attribute — that's the
  field label FormSubmit uses in the email it sends you. An input with no `name`
  submits no value.
- The actual send logic lives in `js/main.js`, in the `form[data-ajax-form]` submit
  handler — it does a `fetch()` POST to whatever `data-email-endpoint` is set, and
  only shows your existing "success" message once FormSubmit confirms it went
  through.
- Each form also has a hidden `_subject` field (sets the email's subject line) and a
  hidden, visually-none `_honey` field (a spam honeypot FormSubmit checks — leave it
  alone).

## Join Member applications → also logged to a Google Sheet

In addition to the email above, `join-member.html` can also log every application as
a row in a Google Sheet you own — useful for tracking applicants by Local Committee,
status, etc. rather than digging through an inbox. This uses Google's own free Apps
Script tool, so no third-party service or data-sharing is involved.

**Setup (one time, ~5 minutes):** the full script and step-by-step instructions are
in `apps-script/join-member-to-sheet.gs` in this zip — open that file, follow the
numbered steps in the comment at the top (create a Sheet, paste the script into
Extensions → Apps Script, deploy as a Web App, copy the resulting URL).

Once you have that URL, paste it into **`build_pages.py`**, replacing
`PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` in the `data-sheet-endpoint` attribute on
the Join Member `<form>` tag (search for `data-sheet-endpoint` — it's near the top of
the "JOIN AS MEMBER" section), then re-run `python3 build_pages.py`. If you're not
touching the Python build script, you can instead paste the URL directly into that
same attribute in `join-member.html`.

Until that placeholder is replaced, the site works completely normally — the
membership form still emails you as before; it just silently skips the (unconfigured)
Sheet step, since that part fails quietly by design rather than breaking the form.


If you'd rather use a different provider (Formspree, Google Forms, your own backend),
just point `data-email-endpoint` at that provider's endpoint instead — the `fetch()`
call in `main.js` expects a JSON response back, so check your provider supports that,
or adjust the `.then()` chain if not.

## Running locally

No build step needed. Either:

1. Open `index.html` directly in a browser, or
2. Serve the folder locally for full-fidelity testing (recommended, avoids any
   browser file:// restrictions):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

## Deploying

This is a static site — deploy the whole folder as-is to any static host:
**Netlify, Vercel, GitHub Pages, Cloudflare Pages, or a regular web server.** No
environment variables or server-side code required.

## Notes on the source references mentioned in your brief

The brief referenced source code for a USA AIESEC "About Us" page and a "Volunteer
Abroad" page as attachments to adapt — those files weren't included in what was
uploaded (only the seven brand images came through), so About Us and the three
program pages were designed from scratch to match AIESEC in Bangladesh's own
information and this site's visual system. If you still have those source files,
send them over and I can rework the affected pages to mirror that structure more
closely.
