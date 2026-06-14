# Jackometer

Jackometer is an academic integrity assistant and research workspace for students, final-year researchers, and postgraduate writers.

It should be marketed as:

- an **academic integrity assistant**
- an **AI-use disclosure checker**
- a **citation and authorship risk checker**
- a **research topic finder with source verification links**
- a **document drafting workspace that keeps the student responsible for final thinking**

It should **not** be marketed as an “AI detector bypass,” “Turnitin bypass,” or cheating tool.

## Core Positioning

Jackometer helps students use AI responsibly. It supports brainstorming, outlining, drafting, citation checking, process reflection, and revision while keeping the student accountable for authorship, evidence, and final academic judgment.

The strongest product message is:

> Jackometer helps students draft, verify, disclose, and defend academic work without hiding AI assistance.

## Main Features

### Document Writer

- Generate a full academic draft across structured sections.
- Generate or rewrite one section at a time.
- Keep draft history and activity logs.
- Export drafts to DOCX/TXT/PDF-style formats.
- Add process evidence such as revisions, notes, figures, citations, and contribution logs.

### AI-giarism Integrity Check

Based on the “AI-giarism” framing from Chan (2023) and Med Kharbach’s academic misconduct explanation, Jackometer checks whether AI use may cross into integrity risk.

It looks for:

- hidden AI assistance
- missing inline citations
- unclear authorship
- delegated thinking
- proxy-performance risk
- generic AI-style academic filler
- missing process evidence such as notes, drafts, reflections, observations, or methodology decisions

The checker does **not** claim to prove whether text is AI-written. Instead, it flags academic integrity risks and recommends safer revision steps.

### Topic Finder With Sources

- Generates research topic ideas by department and academic level.
- Shows existing research / verification links for each topic.
- Helps students verify whether a topic already has related literature.
- Encourages source checking before choosing a project topic.

### Assignment / Report Support

Jackometer can support assignments, reports, field trip writeups, data crunching, and defense preparation. The app should always frame generated text as a draft that students must verify, cite, revise, and own.

## AI-giarism Concept

AI-giarism is when AI use becomes academic misconduct. It differs from traditional plagiarism because the issue is not always copying a human source. The deeper risk is concealed AI assistance, blurred authorship, delegated thinking, and proxy performance.

Key concepts:

- **Assistance:** AI support is different from AI substitution.
- **Collaboration:** AI may shape ideas, but it is not a human classmate or accountable co-author.
- **Authorship:** If AI does major parts of the work, ownership becomes unclear.
- **Delegation:** Outsourcing core thinking to AI transfers responsibility away from the student.
- **Proxy performance:** If AI performs the intellectual work and the student presents it as their own, learning is replaced by a proxy performance.

## Recommended Marketing Copy

Short version:

> Jackometer is an academic integrity assistant for students using AI. Draft smarter, verify sources, disclose AI use, and protect your authorship.

Founder/student version:

> Jackometer helps students turn AI from a shortcut into a responsible academic workflow: topic discovery, source verification, document drafting, AI-giarism checks, and defense preparation in one workspace.

Teacher-friendly version:

> Jackometer supports responsible AI use by helping students document process, verify citations, disclose assistance, and avoid proxy-performance misconduct.

## What Jackometer Is Not

Jackometer is not:

- an AI detector that claims certainty
- a plagiarism evasion tool
- a Turnitin bypass tool
- a replacement for student thinking
- a source fabrication engine

## Deployment Setup

### Vercel

1. Connect this repository to Vercel.
2. Add environment variables:
   - `GEMINI_API_KEY`: Google Gemini API key.
   - `VITE_API_KEY`: same Gemini API key for browser-side calls when needed.
   - `VITE_SUPABASE_URL`: optional Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: optional Supabase anon key.
3. Deploy the application.

### Local Setup

1. Copy `.env.local.example` to `.env.local` if present, or create `.env.local`.
2. Add your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key
VITE_API_KEY=your_gemini_api_key
```

3. Install and run:

```bash
npm install
npm run dev
```

4. Build check:

```bash
npm run build
```

## Cloud Sync Setup

To enable user progress and project saving via Supabase:

1. Create a Supabase project.
2. Get your Project URL and Anon Key.
3. Add them to `.env.local` and Vercel:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Academic Integrity Note

Jackometer should encourage students to follow their institution’s AI policy. When AI assistance is used, students should disclose it where required, verify factual claims, cite sources, and keep notes/drafts that show their own thinking process.
