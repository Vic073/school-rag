# SchoolRAG — UI Design System

> Aesthetic direction: **Dark editorial minimalism.** Inspired by Wibify's near-black precision — stark contrast, numbered sections, italic serif accents in headings, generous negative space. Adapted for a conversational AI product used by students daily.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Patterns](#component-patterns)
  - [Navigation](#navigation)
  - [Section Labels](#section-labels)
  - [Headings with Italic Accent](#headings-with-italic-accent)
  - [Chat Interface](#chat-interface)
  - [Document Upload](#document-upload)
  - [Stat Blocks](#stat-blocks)
  - [Cards & Lists](#cards--lists)
  - [Buttons](#buttons)
  - [Forms & Inputs](#forms--inputs)
  - [Source Citations](#source-citations)
  - [Subject Selector](#subject-selector)
  - [Sidebar](#sidebar)
- [Motion & Animation](#motion--animation)
- [Page Layouts](#page-layouts)
  - [Landing / Login](#landing--login)
  - [Chat Page](#chat-page)
  - [Admin Dashboard](#admin-dashboard)
- [Tailwind Config](#tailwind-config)
- [CSS Variables](#css-variables)
- [Do's and Don'ts](#dos-and-donts)

---

## Design Philosophy

Wibify's site works because of **restraint as a statement.** Every element earns its place. The philosophy translated to SchoolRAG:

| Wibify principle | SchoolRAG translation |
|---|---|
| Numbered editorial sections `[01]` | Section labels in the chat sidebar and admin panels |
| Italic serif word in every heading | Key term in every section title uses the serif italic |
| Near-black background, not pure black | Same — `#0A0A0B`, adds depth without harshness |
| Massive negative space | Generous padding, nothing crammed |
| Monospaced stats / metadata | File names, timestamps, page numbers in mono |
| Arrow CTA `→` not chevrons or icons | Navigation and link affordances use `→` |
| No decorative illustration | UI is the design — no hero art or stock images |
| One focal accent color | A single warm accent (amber/cream) on dark |

**Additional SchoolRAG improvements over Wibify:**

- Wibify is a marketing site — SchoolRAG is an **app**. We add functional density where needed (sidebar, message thread) while keeping the same editorial feel.
- Introduce a **subtle grain overlay** on the background — adds tactile depth that pure flat dark lacks.
- Add **streaming text animation** on AI responses so they feel alive, not dumped.
- Use **micro-border accents** (1px left-border on assistant messages) instead of chat bubbles — more editorial, less "WhatsApp."

---

## Color System

```css
/* CSS Variables — paste into globals.css */

:root {
  /* Backgrounds */
  --bg-base:      #0A0A0B;   /* near-black, main canvas */
  --bg-surface:   #111113;   /* cards, sidebar, panels */
  --bg-elevated:  #18181B;   /* hover states, active items */
  --bg-border:    #232327;   /* subtle dividers */

  /* Text */
  --text-primary:   #F2F0EC;  /* main readable text — warm white */
  --text-secondary: #8A8A93;  /* metadata, labels, timestamps */
  --text-tertiary:  #55555F;  /* placeholders, disabled */

  /* Accent — single warm amber */
  --accent:         #D4A853;  /* primary CTA, highlights, cursor */
  --accent-subtle:  #D4A85318; /* tinted backgrounds */
  --accent-border:  #D4A85340; /* accent-tinted borders */

  /* Semantic */
  --success:  #4ADE80;
  --warning:  #FBBF24;
  --error:    #F87171;

  /* Mono label */
  --label-bg:     #1C1C20;
  --label-text:   #8A8A93;
  --label-border: #2A2A30;
}
```

**Palette rationale:**
- `#0A0A0B` matches Wibify's `theme-color` exactly — proven to read well with light text.
- Warm white `#F2F0EC` (not pure `#FFFFFF`) feels printed, editorial.
- Amber accent `#D4A853` — warm, academic, completely different from the sea of blue/purple SaaS. Think old library books, inkwells.
- A single accent. No secondary accent colors. If something needs to stand out, use the accent. If everything stands out, nothing does.

---

## Typography

### Font Pairing

```css
/* In Next.js layout.tsx — Google Fonts */

import { Playfair_Display, JetBrains_Mono, DM_Sans } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});
```

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Display / Headings** | Playfair Display | 400 regular + *italic* | `<h1>` `<h2>` section titles |
| **Body** | DM Sans | 300–400 | All readable paragraph text |
| **Mono / Labels** | JetBrains Mono | 400 | Section numbers, filenames, timestamps, stats |
| **UI text** | DM Sans | 500 | Buttons, nav items, input labels |

### Type Scale

```css
--text-xs:   0.6875rem;  /* 11px — labels, section numbers */
--text-sm:   0.8125rem;  /* 13px — secondary text, meta */
--text-base: 1rem;       /* 16px — body */
--text-lg:   1.125rem;   /* 18px — lead text */
--text-xl:   1.375rem;   /* 22px — card headings */
--text-2xl:  1.75rem;    /* 28px — page subheadings */
--text-3xl:  2.5rem;     /* 40px — section headings */
--text-4xl:  3.5rem;     /* 56px — hero heading */
--text-5xl:  5rem;       /* 80px — landing statement */
```

### The Italic Rule

Every major heading has **one or two key words in italic serif** — this is Wibify's signature move and the most recognizable pattern to carry over.

```tsx
// Pattern: wrap the important noun/verb in <em> inside the heading
<h1 className="font-display text-5xl font-normal leading-tight">
  Ask anything about your <em className="italic text-accent">notes.</em>
</h1>

<h2 className="font-display text-3xl font-normal">
  Your <em className="italic">questions,</em> answered instantly.
</h2>
```

In CSS, `em` inside a Playfair Display heading renders in the italic optical variant — a genuine swash, not a slant. This contrast between the upright DM Sans body and the Playfair italic headline is the aesthetic heartbeat of the whole system.

---

## Spacing & Layout

### Grid

```css
/* Max content width: 1280px, padding: 2rem mobile, 5rem desktop */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (min-width: 1024px) {
  .container { padding: 0 5rem; }
}
```

### Spacing Scale (Tailwind)

Use **multiples of 4** exclusively. Avoid odd gaps.

```
4px   → gap-1  — between inline label items
8px   → gap-2  — between icon and text
16px  → gap-4  — standard inline spacing
24px  → gap-6  — between form fields
32px  → gap-8  — between components in a panel
64px  → gap-16 — between sections inside a page
128px → gap-32 — between major page sections
```

### Section Rhythm

Every section has a full-bleed top border line + numbered label before the heading. Copy Wibify's section anatomy exactly:

```tsx
<section className="border-t border-[--bg-border] pt-20 pb-32">
  {/* Section label */}
  <span className="font-mono text-xs text-[--text-secondary] tracking-widest uppercase">
    [01] Chat
  </span>

  {/* Section heading — with italic accent */}
  <h2 className="font-display text-3xl mt-6 leading-snug">
    Ask anything about your <em className="italic text-[--accent]">subjects.</em>
  </h2>
</section>
```

---

## Component Patterns

### Navigation

```
┌─────────────────────────────────────────────────────────┐
│  SchoolRAG              [Physics ▾]    History    [KC]  │
└─────────────────────────────────────────────────────────┘
```

- Fixed top, `height: 56px`, background `--bg-base` with a bottom `1px solid --bg-border`.
- Logo: `SchoolRAG` in DM Sans 500, white. Optionally with a tiny dot in `--accent`.
- Right side: subject selector pill (see below) + "History" link + user avatar circle with initials.
- **No hamburger on desktop.** Nav is dead simple — only 3 elements.
- Mobile: same, but subject selector moves to the chat header bar below nav.

```tsx
<nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[--bg-border] bg-[--bg-base]/90 backdrop-blur-sm">
  <div className="container h-full flex items-center justify-between">
    <span className="font-body font-medium text-[--text-primary] tracking-tight">
      School<span className="text-[--accent]">RAG</span>
    </span>
    <div className="flex items-center gap-6">
      <SubjectSelector />
      <NavLink href="/history">History</NavLink>
      <UserAvatar />
    </div>
  </div>
</nav>
```

---

### Section Labels

Directly from Wibify — monospaced, bracketed, uppercase:

```tsx
const SectionLabel = ({ number, text }: { number: string; text: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="font-mono text-[11px] text-[--text-tertiary] tracking-[0.15em]">
      [{number}]
    </span>
    <span className="font-mono text-[11px] text-[--text-secondary] uppercase tracking-[0.12em]">
      {text}
    </span>
  </div>
);

// Usage
<SectionLabel number="01" text="Chat · Physics" />
```

---

### Headings with Italic Accent

```tsx
// H1 — Landing page
<h1 className="font-display text-5xl leading-[1.05] font-normal text-[--text-primary]">
  Your school notes,<br />
  <em className="italic text-[--accent]">finally searchable.</em>
</h1>

// H2 — Section title
<h2 className="font-display text-3xl leading-snug font-normal text-[--text-primary]">
  Four subjects. <em className="italic">One search.</em>
</h2>

// H3 — Card title
<h3 className="font-display text-xl font-normal text-[--text-primary]">
  <em className="italic">Physics</em> · Form 3
</h3>
```

---

### Chat Interface

The chat is the core product. It should feel editorial and calm — not like a chatbot widget.

**Layout:**
```
┌────────────┬──────────────────────────────────────┐
│            │  [01] Physics · Form 3                │
│  Sidebar   │  ─────────────────────────────────── │
│            │                                       │
│  ▸ Conv 1  │   User: What is Newton's 2nd law?    │
│  ▸ Conv 2  │                                       │
│  ▸ Conv 3  │   ┃  Force equals mass times         │
│            │   ┃  acceleration. In your Form 3    │
│  [+] New   │   ┃  notes (p.12), this is stated    │
│            │   ┃  as F = ma where...               │
│            │   ┃                                   │
│            │   ╰─ Sources  ↓                       │
│            │      · physics_notes_f3.pdf · p.12   │
│            │      · past_paper_2023.pdf · p.4     │
│            │                                       │
│            │  ┌─────────────────────────────────┐ │
│            │  │ Ask anything about Physics...   │ │
│            │  │                          Send → │ │
│            │  └─────────────────────────────────┘ │
└────────────┴──────────────────────────────────────┘
```

**User message:**
```tsx
<div className="flex justify-end mb-8">
  <p className="font-body text-base text-[--text-primary] max-w-[65%] leading-relaxed">
    {message.content}
  </p>
</div>
```

**Assistant message — the left-border treatment (not a bubble):**
```tsx
<div className="mb-8">
  <div className="pl-5 border-l-2 border-[--accent]">
    <p className="font-body text-base text-[--text-primary] leading-[1.8] mb-4">
      {message.content}
    </p>
    <SourcesCitation sources={message.sources} />
  </div>
  <FeedbackRow messageId={message.id} />
</div>
```

**Why left-border instead of bubbles:** Bubbles feel like a chat app. A left-border accent line reads like an editorial pull-quote — calm, authoritative, academic. It also handles long answers without awkward wrapping.

**Streaming effect:**
```css
/* Typewriter cursor on streaming messages */
.streaming-cursor::after {
  content: '▊';
  color: var(--accent);
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

---

### Document Upload

Admin-only. Drag-and-drop zone with the same monochrome aesthetic — no colored upload cloud icons.

```tsx
<div className="border border-dashed border-[--bg-border] rounded-none p-16
                hover:border-[--accent-border] hover:bg-[--accent-subtle]
                transition-colors duration-300 cursor-pointer text-center group">

  <span className="font-mono text-[11px] text-[--text-tertiary] uppercase tracking-widest block mb-4">
    [Upload]
  </span>

  <p className="font-display text-2xl text-[--text-primary] mb-2">
    Drop your <em className="italic">documents</em> here.
  </p>

  <p className="font-body text-sm text-[--text-secondary]">
    PDF, DOCX · up to 50MB · any subject
  </p>

  <span className="font-body text-sm text-[--accent] mt-6 block group-hover:underline">
    or browse files →
  </span>
</div>
```

Note: `rounded-none` — no border radius on major containers. Wibify uses sharp corners throughout. Pill shapes only on small tags/labels.

---

### Stat Blocks

Used on the landing page and admin dashboard. Wibify's stat display — mono number, small label underneath:

```tsx
const StatBlock = ({ value, label }: { value: string; label: string }) => (
  <div className="border-t border-[--bg-border] pt-6">
    <p className="font-mono text-3xl text-[--text-primary] mb-1">{value}</p>
    <p className="font-body text-sm text-[--text-secondary]">{label}</p>
  </div>
);

// Row of stats
<div className="grid grid-cols-3 gap-8 mt-16">
  <StatBlock value="4"      label="Subjects indexed"    />
  <StatBlock value="2,847"  label="Chunks in vector DB" />
  <StatBlock value="50"     label="Queries today"       />
</div>
```

---

### Cards & Lists

Document list in admin, conversation list in sidebar. No drop shadows — borders only.

```tsx
// Document card
<div className="border-t border-[--bg-border] py-5 flex justify-between items-start
                hover:bg-[--bg-elevated] px-4 -mx-4 transition-colors group">

  <div>
    <p className="font-body text-base text-[--text-primary]">
      physics_notes_form3.pdf
    </p>
    <p className="font-mono text-xs text-[--text-secondary] mt-1">
      Physics · 234 chunks · uploaded 2 Jun 2026
    </p>
  </div>

  <button className="font-mono text-xs text-[--text-tertiary]
                     hover:text-[--error] opacity-0 group-hover:opacity-100 transition">
    Delete →
  </button>
</div>
```

---

### Buttons

**Primary CTA — Wibify's exact pattern:**
```tsx
<button className="
  inline-flex items-center gap-2
  font-body font-medium text-sm text-[--bg-base]
  bg-[--text-primary] hover:bg-[--accent]
  px-5 py-2.5
  transition-colors duration-200
  rounded-none
">
  Start a session →
</button>
```

**Ghost / secondary:**
```tsx
<button className="
  inline-flex items-center gap-2
  font-body font-medium text-sm text-[--text-primary]
  border border-[--bg-border] hover:border-[--text-secondary]
  px-5 py-2.5
  transition-colors duration-200
  rounded-none
">
  View history →
</button>
```

**Icon-only (send button):**
```tsx
<button className="
  w-9 h-9 flex items-center justify-center
  text-[--text-secondary] hover:text-[--accent]
  transition-colors
">
  →
</button>
```

Rules:
- `rounded-none` everywhere — sharp corners, no pill buttons except small tags.
- Arrow `→` at the end of primary CTAs, never a separate icon component.
- No filled icon buttons with colored backgrounds except the user avatar.

---

### Forms & Inputs

```tsx
// Chat input
<textarea
  className="
    w-full bg-transparent resize-none outline-none
    font-body text-base text-[--text-primary]
    placeholder:text-[--text-tertiary]
    border-t border-[--bg-border]
    px-6 py-4
    min-h-[56px] max-h-[200px]
  "
  placeholder="Ask anything about this subject..."
/>

// Standard text input (admin forms)
<div className="border-b border-[--bg-border] pb-2 focus-within:border-[--text-secondary] transition-colors">
  <label className="font-mono text-[11px] text-[--text-tertiary] uppercase tracking-widest block mb-2">
    Document Title
  </label>
  <input
    className="
      w-full bg-transparent outline-none
      font-body text-base text-[--text-primary]
      placeholder:text-[--text-tertiary]
    "
    placeholder="e.g. Physics Notes Form 3"
  />
</div>
```

Note: **underline inputs, not boxed inputs.** Wibify uses underline-only fields (border-bottom only). Lighter, cleaner, more editorial than full-border boxes.

---

### Source Citations

Collapsible, sits below each assistant answer:

```tsx
const SourcesCitation = ({ sources }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-xs text-[--text-tertiary] hover:text-[--text-secondary]
                   flex items-center gap-2 transition-colors"
      >
        <span>{open ? '↑' : '↓'}</span>
        Sources · {sources.length} document{sources.length > 1 ? 's' : ''}
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {sources.map((s, i) => (
            <li key={i} className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-[--text-tertiary]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs text-[--text-secondary]">
                {s.filename}
              </span>
              <span className="font-mono text-[11px] text-[--text-tertiary]">
                p.{s.page}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

### Subject Selector

The subject filter is a small pill in the nav. Think of it as a context label, not a full dropdown:

```tsx
<button className="
  flex items-center gap-2
  font-mono text-xs text-[--text-secondary]
  border border-[--bg-border] hover:border-[--text-tertiary]
  px-3 py-1.5 rounded-full
  transition-colors
">
  <span className="w-1.5 h-1.5 rounded-full bg-[--accent]" />
  Physics
  <span className="text-[--text-tertiary]">▾</span>
</button>
```

The dot before the subject name is the only place a colored dot appears — it indicates "active filter."

---

### Sidebar

```
┌──────────────────────┐
│ [01] Conversations   │
│ ──────────────────── │
│ Today                │
│  · Newton's laws     │
│  · Photosynthesis    │
│                      │
│ Yesterday            │
│  · Quadratic eqns   │
│  · WW2 causes        │
│                      │
│ ──────────────────── │
│ [+] New session →   │
└──────────────────────┘
```

```tsx
// Conversation item
<button className="
  w-full text-left px-4 py-2.5
  flex items-center gap-3
  hover:bg-[--bg-elevated]
  transition-colors group
">
  <span className="font-mono text-[11px] text-[--text-tertiary] shrink-0">
    {index + 1 < 10 ? `0${index + 1}` : index + 1}
  </span>
  <span className="font-body text-sm text-[--text-secondary]
                   group-hover:text-[--text-primary] transition-colors truncate">
    {conversation.title}
  </span>
</button>

// Group label
<p className="font-mono text-[11px] text-[--text-tertiary] uppercase tracking-widest
              px-4 pt-6 pb-2">
  Today
</p>

// New session CTA
<div className="absolute bottom-0 inset-x-0 border-t border-[--bg-border] p-4">
  <button className="w-full font-body text-sm text-[--accent] hover:underline flex items-center gap-2">
    <span>+</span> New session →
  </button>
</div>
```

---

## Motion & Animation

Less is more. Only three types of motion in the entire app:

### 1. Page enter — staggered fade-up

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

.animate-in {
  animation: fadeUp 0.4s ease forwards;
}

/* Stagger children */
.stagger > *:nth-child(1) { animation-delay: 0ms;  }
.stagger > *:nth-child(2) { animation-delay: 80ms; }
.stagger > *:nth-child(3) { animation-delay: 160ms;}
.stagger > *:nth-child(4) { animation-delay: 240ms;}
```

### 2. Chat message appear

```css
@keyframes messageIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

.message-enter {
  animation: messageIn 0.25s ease forwards;
}
```

### 3. Streaming text cursor

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor::after {
  content: '▊';
  font-size: 0.85em;
  color: var(--accent);
  animation: blink 0.7s step-end infinite;
}
```

No hover scale transforms. No bounce. No spring physics. Transitions are `duration-200` max with `ease` or `ease-out` — nothing elastic.

---

## Page Layouts

### Landing / Login

Structure (single-page scroll, dark):

```
┌──────────────────────────────────────────────────────────┐
│  SchoolRAG                              Sign in →         │
├──────────────────────────────────────────────────────────┤
│  [01] School Intelligence Platform                       │
│                                                          │
│  Your notes,                                             │
│  your past papers,                                       │
│  finally answerable.                     ← 80px Playfair │
│                                                          │
│  [Continue with Google →]                                │
│                                                          │
│  ── 2,847 chunks indexed · 4 subjects · 0 hallucinations │
├──────────────────────────────────────────────────────────┤
│  [02] How it works                                       │
│                                                          │
│  01 · Upload your PDFs                                   │
│  02 · Ask in plain English                               │
│  03 · Get cited answers                                  │
├──────────────────────────────────────────────────────────┤
│  [03] For Schools                                        │
│  Students — Teachers — Admins (3 col)                    │
├──────────────────────────────────────────────────────────┤
│  SchoolRAG · © 2026                                      │
└──────────────────────────────────────────────────────────┘
```

The hero has **no illustration.** Just the typography and a Google login button. The stats line at the bottom (`2,847 chunks indexed...`) mimics Wibify's `5.0 Google · 7.5M+ Users reached`.

---

### Chat Page

Two-column layout. Sidebar fixed width `240px`, main area fills rest.

```
┌──────────────────────────────────────────────────────────┐
│  NAV                                                     │
├──────────┬───────────────────────────────────────────────┤
│  SIDEBAR │  SECTION LABEL + HEADING                      │
│  240px   │                                               │
│          │  ───── message thread ─────                   │
│  conv 1  │                                               │
│  conv 2  │  user Q                                       │
│  conv 3  │                                               │
│          │  ┃ assistant answer                           │
│          │  ┃ with streaming text                        │
│          │  ╰ sources ↓                                  │
│          │                                               │
│          │  ──── input bar ────────────────────────────  │
│  + New → │  [ Ask anything... ]               Send →    │
└──────────┴───────────────────────────────────────────────┘
```

The input bar is **pinned to the bottom** of the main area. `position: sticky; bottom: 0;` on a `border-t border-[--bg-border] bg-[--bg-base]` container.

---

### Admin Dashboard

```
┌──────────────────────────────────────────────────────────┐
│  NAV — [Admin panel]                                     │
├──────────┬───────────────────────────────────────────────┤
│  SIDEBAR │  [01] Overview                                │
│          │                                               │
│  Overview│  2,847     4         147       32             │
│  Docs    │  Chunks    Subjects  Students  Queries today  │
│  Usage   │                                               │
│          │  [02] Documents                               │
│          │  ┌───────────────────────────────────────┐   │
│          │  │ physics_notes_f3.pdf  234 chunks  ↗↓  │   │
│          │  │ bio_form4.pdf          89 chunks  ↗↓  │   │
│          │  │ past_paper_2023.pdf   121 chunks  ↗↓  │   │
│          │  └───────────────────────────────────────┘   │
│          │                                               │
│          │  [+ Upload document →]                        │
└──────────┴───────────────────────────────────────────────┘
```

---

## Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:      '#0A0A0B',
        surface:   '#111113',
        elevated:  '#18181B',
        border:    '#232327',
        primary:   '#F2F0EC',
        secondary: '#8A8A93',
        tertiary:  '#55555F',
        accent:    '#D4A853',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',  // force sharp corners globally
        full: '9999px',  // still allow pills where explicitly needed
      },
    },
  },
};

export default config;
```

---

## CSS Variables

```css
/* globals.css */

@import url('https://fonts.googleapis.com/...');

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body), sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Grain overlay — add to body::before */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.022;
}

/* Scrollbar */
::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg-border); border-radius: 0; }

/* Selection */
::selection {
  background: var(--accent);
  color: var(--bg-base);
}
```

---

## Do's and Don'ts

### DO

- Use `rounded-none` on all containers, inputs, buttons — only `rounded-full` for the subject selector pill
- Use Playfair Display italic for the key noun in every heading
- Put monospaced labels (`[01]`, filenames, timestamps) everywhere data-like text appears
- Use `→` as the affordance for links and CTAs — never `>` or `▶` or icon components
- Use only `--accent` (amber) for the single highlight color — resist adding any other accent
- Keep negative space generous: when in doubt, add more padding
- Left-border on assistant messages, not speech bubbles
- Underline-only inputs (border-bottom only)

### DON'T

- Don't use `rounded-lg` or `rounded-md` on cards or panels
- Don't use `box-shadow` anywhere — borders only
- Don't use more than one accent color
- Don't animate anything with spring/bounce physics
- Don't use colored filled backgrounds on buttons (only white-on-dark primary and ghost)
- Don't use Roboto, Inter, or system-ui — they kill the editorial feel
- Don't add decorative illustrations, hero images, or emoji in the UI
- Don't use gradient backgrounds (only `--bg-base` solid)
- Don't put borders on all four sides of inputs — bottom border only

---

*Design system for SchoolRAG — adapted from Wibify's editorial dark aesthetic, extended for a conversational AI product.*
