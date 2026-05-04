# APEX Landing — Cinematic v1

A complete, ready-to-ship Vite + React landing page for `apex-landing.vercel.app`. Single-file React component (~1,400 lines) with multi-layered cinematic effects.

---

## What's in this build

**8 sections, scroll-triggered:**

1. **Hero** — Italic serif headline with parallax mouse tilt, gold gradient pulse, dual CTA
2. **Marquee** — Infinite-scroll brand strip (CSS animation)
3. **Problem** — 5 numbered glass cards, the trap unpacked
4. **Scorecard** — Animated score-ring preview (gauge fills from 0 to 32 on scroll-in), 3-tier strip, primary CTA
5. **Audience** — 3 persona cards with hover glow (Finance Pro / Corporate Climber / Present Parent)
6. **About JJ** — Pull-quote card + animated number stats
7. **Product Ladder** — 3 pricing cards ($47 / $497 / $5K), middle card featured with gold gradient
8. **Newsletter** — Email capture that pipes to your MailerLite hosted form

**Cinematic effects layer-by-layer:**

- ✨ Animated **orb field** — 5 orbs at varying sizes/positions, pulsing on individual schedules
- 🖱️ **Cursor-following gold glow** — large radial gradient that follows the mouse (desktop only, auto-disabled on touch)
- 📊 **Scroll-progress bar** — gold gradient sticky at top, fills as you scroll
- 🎬 **Scroll-triggered reveals** — every section element fades up on viewport entry (IntersectionObserver, no layout thrash)
- 🎯 **Parallax hero tilt** — hero text tilts subtly with mouse position
- 🔢 **Animated number counters** — stats animate from 0 to value on scroll-in
- 🪟 **Glassmorphism cards** — backdrop-filter blur, hover-lift, gold accent gradients
- 📜 **Marquee strip** — pure CSS infinite scroll (50s cycle)
- ✨ **Grain overlay** — subtle SVG noise (3% opacity) for film-like texture
- 🎨 **Section dividers** — gold dot dividers with linear gradients

**Brand aesthetic** matches v3 Scorecard exactly: dark `#07080B`, gold `#D4A853`, cream `#F0EBE3`, Playfair Display + Outfit + JetBrains Mono.

**Configuration baked in:**

- Scorecard CTA links to `https://apex-scorecard.vercel.app`
- Calendly link in footer points to your discovery call
- Newsletter form pipes to your MailerLite hosted signup form

---

## Deploy in 5 minutes

When you're at your Mac, paste this **one bash block** to move + install + push:

```bash
mv ~/Desktop/"Apex Dashboard"/_apex_landing_v1 ~/Documents/apex-landing
cd ~/Documents/apex-landing
npm install
git init
git add .
git commit -m "APEX Landing v1 — cinematic"
git branch -M main
git remote add origin https://github.com/Johnjosephelisarraras13/apex-landing.git
git push -u origin main
```

If `git push` fails on auth (it will if the GitHub repo was created with auto-README), the same fix from Project 1 applies:

1. Browser → `github.com/Johnjosephelisarraras13/apex-landing` → Settings → Danger Zone → **Delete this repository**
2. Re-create at `github.com/new` → name: `apex-landing` → **DON'T tick "Add a README"** → Create
3. Switch to **GitHub Desktop** → File → Add Local Repository → `~/Documents/apex-landing` → click **Push origin**

---

## Deploy to Vercel (web UI, 2 min)

1. **vercel.com** → top right **Add New** → **Project**
2. Find `apex-landing` in the import list → **Import**
3. Framework Preset: **Vite** (auto-detected)
4. Build/Output: leave defaults
5. **No environment variables needed** — landing page doesn't talk to any APIs directly; the newsletter form opens MailerLite's hosted page in a new tab
6. Click **Deploy**

Wait ~90 seconds for the green confetti screen.

---

## Test (3 min)

Open the live URL in an **incognito window** (rules out cache):

- Hero animations smooth, mouse-tilt working
- Scroll all the way down — every section fades in
- Marquee strip running
- Scorecard CTA opens `apex-scorecard.vercel.app`
- Newsletter form takes an email and opens MailerLite in a new tab
- Footer Calendly link opens your discovery call

If you spot anything broken or want copy/design tweaks, tell me which section + what to change and I'll patch the file.

---

## What's in this folder

```
_apex_landing_v1/
├── .gitignore
├── README.md            ← this file
├── index.html           ← OG meta + font preconnects + title
├── package.json         ← name: "apex-landing"
├── vercel.json          ← SPA rewrite (so deep links work)
├── vite.config.js
└── src/
    ├── App.jsx          ← cinematic landing (1,381 lines, Babel-validated)
    ├── index.css        ← body reset
    └── main.jsx         ← React bootstrap
```

---

## Knobs you might want to turn later

- **Headline copy** — currently *"Build wealth that doesn't require your time."* — change in the `Hero` component near top of App.jsx
- **5 pain points** — `Problem` component, change the `pains` array
- **Audience profiles** — `Audience` component, change the `personas` array
- **JJ pull quote** — `About` component, replace with a real moment when you have one
- **Product pricing** — `Products` component, change the `tiers` array (matches Scorecard's offer logic)
- **Marquee strip text** — `Marquee` component, change the `items` array
- **Newsletter form behavior** — `Newsletter` component currently opens MailerLite hosted form in new tab; can swap to inline iframe or direct API submit later

— Built fresh by Claude. Cinematic. Mobile-first. ~50KB of pure JSX, no extra deps.
