# 🛡️ ScamShield AI

**A frontend prototype for an AI-powered scam-detection platform.**
Built as a graduation project to demonstrate the user experience of a tool that helps people
check suspicious content — messages, links, emails, screenshots, QR codes, and voice recordings —
before they fall for a scam.

> ⚠️ **This is a prototype only.** There is no real backend, no real AI model, and no data is
> stored or transmitted. Every "analysis" in this project is a simulated result used to
> demonstrate the intended product experience.

---

## 💡 The idea

Most scam-detection tools try to monitor a user's device in the background, which raises privacy
concerns. ScamShield AI proposes a different, consent-based model: the user *chooses* what to
check, uploading only the specific content they're unsure about. The (simulated) AI engine then
returns a clear, human-readable verdict — a threat score, the likely attack type, the reasons
behind the score, and a recommended next action.

## ✨ Features

| Area | Description |
|---|---|
| **Home** | Hero section, six detection-surface feature cards, a "how it works" flow, animated stats, and footer. |
| **Scanner Center** | Tabbed interface (Text, Link, Email, Image, QR, Voice) with realistic forms. Each "Analyze" button simulates a 2-second scan and renders a full security report. |
| **AI Assistant** | A ChatGPT-style chat interface that returns predefined, keyword-matched answers to common scam-related questions. |
| **Dashboard** | KPI cards, Chart.js visualizations (threat distribution, top scam categories, risk trend), a recent activity timeline, and a latest-reports table — all populated with dummy data. |
| **About** | Project background, technology stack, roadmap, and a demo contact form. |

## 🧱 Technology stack

- **HTML5** — semantic structure across all pages
- **CSS3** — custom properties (design tokens), glassmorphism, gradients, and motion — no preprocessor
- **Vanilla JavaScript** — a single organized file (`js/app.js`), no frameworks or build step
- **Bootstrap 5** — grid system, tabs, and form components, restyled to match the brand
- **Bootstrap Icons** — iconography throughout
- **Chart.js** — dashboard visualizations
- **Google Fonts** — Poppins (display/body) and JetBrains Mono (data, code, terminal UI)

## 📁 Project structure

```
ScamShield-AI/
├── index.html          # Home
├── scanner.html         # Scanner Center (Text / Link / Email / Image / QR / Voice)
├── assistant.html       # AI Security Assistant (chat UI)
├── dashboard.html        # Dashboard (KPIs, charts, reports)
├── about.html            # About, tech stack, roadmap, contact
├── css/
│   └── style.css         # All styles, organized by section, driven by CSS variables
├── js/
│   └── app.js             # All JavaScript, organized by feature, no inline scripts
├── assets/
│   ├── images/            # Reserved for project images
│   └── icons/              # Reserved for custom icon assets
└── README.md
```

## 🖼️ Screenshots

> Add screenshots of each page here once available.

- `assets/images/screenshot-home.png`
- `assets/images/screenshot-scanner.png`
- `assets/images/screenshot-assistant.png`
- `assets/images/screenshot-dashboard.png`

## 🚀 Getting started

No build step or package manager is required.

1. Download or clone the project folder.
2. Open `index.html` directly in a browser, **or** serve it locally for the best experience:
   ```bash
   # Python 3
   python -m http.server 8000

   # then visit
   http://localhost:8000
   ```
3. Navigate between Home, Scanner Center, AI Assistant, Dashboard, and About using the top navigation bar.

All CDN dependencies (Bootstrap, Bootstrap Icons, Google Fonts, Chart.js) require an internet
connection on first load.

## 🎨 Design system

Colors and spacing are defined once as CSS variables in `css/style.css`:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0F172A` | Page background |
| `--card` | `#1E293B` | Card surfaces |
| `--primary` | `#3B82F6` | Primary actions, links, accents |
| `--success` | `#22C55E` | Low-risk / safe verdicts |
| `--danger` | `#EF4444` | High-risk verdicts |
| `--text` | `#F8FAFC` | Primary text |

## 🗺️ Future improvements

- Connect a real classification model behind each analyzer
- Add a backend to persist scan history per user
- Localize scam-pattern detection for different languages and regions
- Package the same upload-first workflow into a native mobile app with share-sheet support
- Add user accounts and authenticated report history

## 🎓 Academic context

This project was built as a graduation project to demonstrate product thinking, UI/UX design,
and frontend engineering skills. It is not a commercial product and should not be relied on for
real scam detection.

---

**License:** For academic/demo use.
