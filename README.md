# 🎓 Jackometer

**Your AI-Powered Academic Integrity Assistant**

Jackometer helps students draft papers, find research topics, review documents for AI-generated content, and organize academic work — all in one place.

> ⚠️ This is an **academic integrity tool**, not a bypass tool. We help you write better, cite properly, and ensure your work meets institutional standards.

---

## ✨ Features

### 📝 Write
- **Document Writer** — Draft full academic papers with structured sections
- **Technical Report** — Generate lab and technical reports with proper formatting
- **Assignment Solver** — Submit structured academic answers with citations

### 🔍 Research
- **Topic Finder** — Stuck on what to research? Get 8 original, feasible topics with methodologies for your department and level
- **Lit Review Engine** — Build your literature chapter step-by-step with optimized search strings for Google Scholar, Scopus, and PubMed
- **Data Cruncher** — Analyze lab results and field trip data with easy-to-use insights

### 🛡️ Integrity
- **AI-giarism Check** — Detect AI-generated sections in your writing. Get a risk score (Low / Review / High) with specific flagged paragraphs
- **Integrity Revision** — Compress padding, filler phrases, and AI-style hedging while preserving all substantive claims

### 🏕️ Field
- **Field Trip** — Organize and document field observations

### 🛠️ Tools
- **Projects** — Save and manage your work
- **Career Studio** — Build your academic CV and career path
- **File Compressor** — Reduce file sizes for submission
- **Scholar Hub** — Connect with other researchers

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (see `.nvmrc`)
- A Google Gemini API key

### Local Setup

```bash
# Clone the repo
git clone https://github.com/0xzahra/Jackometer.git
cd Jackometer

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your VITE_GEMINI_API_KEY

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ | Your Google Gemini API key |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL for cloud sync |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase anon key for cloud sync |

> ⚠️ The key **must** start with `VITE_` — Vite only exposes `VITE_*` prefixed variables to the browser.

---

## ☁️ Deploy to Vercel

1. Connect your repository to [Vercel](https://vercel.com)
2. Under **Settings → Environment Variables**, add:
   - `VITE_GEMINI_API_KEY` — your Gemini API key
   - `VITE_SUPABASE_URL` — your Supabase URL (optional)
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key (optional)
3. Vercel auto-detects Node 20 from `.nvmrc`
4. Deploy!

---

## ☁️ Cloud Sync (Supabase)

To enable user progress and project saving:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your **Project URL** and **Anon Key**
3. Add to `.env.local` and Vercel env vars:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🧪 Testing

```bash
# Run type checks
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Tech Stack

- **React 18** + **TypeScript** — Type-safe UI
- **Vite** — Lightning-fast dev & build
- **Tailwind CSS** — Utility-first styling
- **Google Gemini** — AI-powered content generation
- **Supabase** — Cloud sync & auth (optional)
- **Firebase** — Alternative auth provider

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT

---

## 📧 Contact

Built by [0xzahra](https://github.com/0xzahra) · [X/Twitter](https://x.com/0xarewah)

For questions or feedback, open an issue or reach out on Twitter.
