# Product Playbook — AI Web App on Next.js + Vercel + Groq

This document captures the full stack, process, and key decisions used to build cv2jd.
Use it as a starting template for the next product.

---

## Stack at a glance

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (Pages Router) | Simple, no server components complexity, great Vercel integration |
| Hosting | Vercel | Zero-config deploys, serverless API routes, free tier is generous |
| AI | Groq API (`llama-3.3-70b-versatile`) | Fast inference, generous free tier, OpenAI-compatible API |
| Styling | Tailwind CSS + styled-jsx | Tailwind for utility classes, styled-jsx for keyframe animations |
| Components | shadcn/ui | Copy-paste components, no lock-in, fully customisable |
| Analytics | PostHog (EU region) | Privacy-preserving, cookieless config, no GDPR consent banner needed |
| Contact form | Web3Forms | Free, client-side only, no backend needed |
| PDF parse | pdfjs-dist (client-side) | No server cost, works in browser |
| PDF export | jsPDF (dynamic import) | Avoids SSR issues, small bundle impact |

---

## Project setup checklist

```bash
npx create-next-app@latest my-app --js --no-app --no-src-dir --import-alias "@/*"
cd my-app
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
npm install posthog-js
```

**shadcn components to add upfront:**
```bash
npx shadcn@latest add button card badge input label textarea tabs
```

**`.env.local` template (gitignored):**
```
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
NEXT_PUBLIC_WEB3FORMS_KEY=...
```

---

## Architecture pattern

### Pages Router conventions
- All pages in `pages/` — no `app/` directory
- API routes in `pages/api/` — each file is a serverless function
- Shared data (blog posts, config) in `lib/`
- UI components in `components/ui/`
- Global styles only in `styles/globals.css` (resets + shared keyframes)

### Standard page structure
```
pages/
  _app.js          ← analytics init, global layout
  index.js         ← marketing homepage
  [product].js     ← main product UI
  pricing.js       ← pricing + feedback form
  privacy.js       ← static legal page
  terms.js         ← static legal page
  blog/
    index.js       ← blog listing
    [slug].js      ← individual post (getStaticPaths + getStaticProps)
  api/
    [action].js    ← server-side AI call
lib/
  blog-posts.js    ← blog data (no CMS needed at MVP stage)
```

### Core data flow (stateless)
```
User input (client)
  → POST /api/[action] (serverless, validates + calls AI)
  → Groq API (returns JSON)
  → Parsed + validated on server
  → Returned to client
  → Displayed in UI, never persisted
```

**No database, no auth, no sessions at MVP.** Add persistence only when you have paying users who need it.

---

## AI integration pattern (Groq)

### API route template
```js
// pages/api/[action].js

const PROMPT_TEMPLATE = (input1, input2) => `...your prompt...`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { field1, field2 } = req.body ?? {}
  if (!field1?.trim() || !field2?.trim()) {
    return res.status(400).json({ error: 'Both fields are required.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'API key not configured.' })

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: PROMPT_TEMPLATE(field1, field2) }],
        temperature: 0.3,
        max_tokens: 8000,  // always set this — default truncates long outputs
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}))
      const msg = err?.error?.message || groqRes.statusText
      if (groqRes.status === 401) return res.status(401).json({ error: 'Invalid API key.' })
      if (groqRes.status === 429) return res.status(429).json({ error: 'Rate limit — try again shortly.' })
      return res.status(502).json({ error: `Groq error ${groqRes.status}: ${msg}` })
    }

    const data = await groqRes.json()
    const rawText = data?.choices?.[0]?.message?.content ?? ''
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let parsed
    try {
      parsed = JSON.parse(fixControlChars(cleaned))
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) return res.status(502).json({ error: 'Unexpected AI format. Please try again.' })
      parsed = JSON.parse(fixControlChars(match[0]))
    }

    return res.status(200).json({
      output1: typeof parsed.output1 === 'string' ? parsed.output1 : '',
      output2: Array.isArray(parsed.output2) ? parsed.output2 : [],
      score:   typeof parsed.score === 'number' ? Math.round(parsed.score) : 0,
    })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ error: `Something went wrong: ${err?.message || 'unknown'}` })
  }
}

// Always include this — Groq models sometimes write literal newlines inside JSON strings
function fixControlChars(str) {
  let out = '', inString = false, escaped = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (escaped) { out += ch; escaped = false; continue }
    if (ch === '\\' && inString) { out += ch; escaped = true; continue }
    if (ch === '"') { inString = !inString; out += ch; continue }
    if (inString) {
      if (ch === '\n') { out += '\\n'; continue }
      if (ch === '\r') { out += '\\r'; continue }
      if (ch === '\t') { out += '\\t'; continue }
      const code = ch.charCodeAt(0)
      if (code < 0x20) { out += '\\u' + code.toString(16).padStart(4, '0'); continue }
    }
    out += ch
  }
  return out
}
```

### Prompt engineering principles

Structure every prompt in this order:
1. **Role + goal** — who the AI is and what it must produce
2. **Input** — inject `${variable}` data early so the model reads it before instructions
3. **Step-by-step instructions** — one section per output section
4. **Honesty rules** — what it must never do (especially important for factual outputs)
5. **Output format** — exact JSON schema with field definitions
6. **Anti-AI-writing list** — banned words that signal AI-generated text

**Critical rules:**
- Always put `max_tokens: 8000` — without it, long outputs get silently truncated mid-JSON
- Use `temperature: 0.3` for factual/structured tasks, `0.6–0.7` for creative ones
- Tell the model to output **only** valid JSON — no markdown fences, no preamble
- Add a regex fallback (`cleaned.match(/\{[\s\S]*\}/)`) for when it wraps output anyway
- Run `fixControlChars()` before every `JSON.parse()` — models emit literal newlines in strings

**Prompt structure template:**
```
You are [role]. Your task is [goal].

[INPUT LABEL]:
${input1}

[INPUT LABEL 2]:
${input2}

━━━ STEP 1 — [ANALYSIS PHASE] ━━━
[What the model should figure out before writing]

━━━ STEP 2 — [WRITING RULES] ━━━
--- SECTION: [Name] ---
[Specific rules for this section]

━━━ HONESTY RULES ━━━
NEVER: [list]
YOU MAY: [list]

━━━ OUTPUT FORMAT ━━━
[Human-readable format spec if the output is text]

━━━ JSON OUTPUT ━━━
Respond ONLY with valid JSON — no markdown, no extra text.
{
  "field1": "...",
  "field2": ["..."],
  "score": 85,
  "improvements": ["specific change 1"],
  "gaps": ["gap 1 with suggestion"]
}
Field definitions: [one line per field]
```

---

## Styling system

### Design tokens (copy these into every new project and adjust)
```js
const tokens = {
  gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  gradientHero: 'linear-gradient(135deg, #667eea 0%, #764ba2 45%, #c471ed 75%, #f64f59 100%)',
  bgDark: '#0f0f1a',
  bgBody: '#fafafa',
  textPrimary: '#1a1a2e',
  textMuted: '#666',
  textSubtle: '#888',
  textFaint: '#aaa',
  borderLight: '#e8e8f0',
  accent: '#764ba2',
  accentLight: '#c4b5fd',
}
```

### Animation patterns (GPU-safe, reduced-motion aware)

Add to a `<style jsx global>` block in `pages/index.js` or `styles/globals.css`:

```css
/* Entrance: staggered fade-up */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Floating element (hero card, product preview) */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}

/* Scroll reveal */
@keyframes revealUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal-card { opacity: 0; }
.reveal-card.revealed {
  animation: revealUp 0.55s ease forwards;
  animation-delay: var(--delay, 0ms);  /* set --delay per card */
}

/* Always include this */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; opacity: 1 !important; transform: none !important; }
}
```

**Scroll reveal hook (no dependencies):**
```js
function useVisible(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, visible]
}
```

**Usage:**
```jsx
const [cardsRef, cardsVisible] = useVisible()
// ...
<div ref={cardsRef}>
  {items.map((item, i) => (
    <div
      className={`reveal-card ${cardsVisible ? 'revealed' : ''}`}
      style={{ '--delay': `${i * 80}ms` }}
    />
  ))}
</div>
```

---

## Analytics (PostHog)

### Setup in `pages/_app.js`
```js
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      person_profiles: 'identified_only',
    })
    const handleRouteChange = () => posthog.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [])
  return <Component {...pageProps} />
}
```

### Event tracking rules
- Thin wrapper: `const track = (name, props) => posthog?.capture?.(name, props)`
- **Never send PII** — no email, name, CV text, IP, or free-text user input
- **Bucket continuous values** — text lengths → `small/medium/large/xlarge`, scores → `low/mid/high`
- Truncate error messages to 80 chars before sending
- Track the full funnel: `[action]_started`, `[action]_succeeded`, `[action]_failed`

---

## Contact form (Web3Forms)

**Always submit client-side.** Web3Forms free tier returns 403 from Vercel serverless functions.

```jsx
async function handleSubmit(e) {
  e.preventDefault()
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
      subject: 'New message from [product]',
      name,
      email,
      message,
    }),
  })
  const data = await res.json()
  if (data.success) { /* show success */ }
}
```

---

## PDF handling

### Parse (client-side, no server cost)
```js
async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lineMap = new Map()
    content.items.forEach(item => {
      const y = Math.round(item.transform[5])
      lineMap.set(y, (lineMap.get(y) || '') + item.str + ' ')
    })
    const sorted = [...lineMap.entries()].sort((a, b) => b[0] - a[0])
    pages.push(sorted.map(([, t]) => t.trim()).join('\n'))
  }
  return pages.join('\n\n').trim()
}
```

### Export (dynamic import avoids SSR crash)
```js
async function handleDownload(text) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  // ... build PDF
  doc.save('output.pdf')
}
```

---

## Blog (no CMS needed at MVP)

### Data file: `lib/blog-posts.js`
```js
export const posts = [
  {
    slug: 'my-first-article',
    title: 'Article Title',
    description: 'Meta description — 150 chars, used in <meta> and OG tags.',
    date: '2026-05-01',
    readTime: '5 min read',
    cover: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      emoji: '📝',
      alt: 'Alt text for the cover',
    },
    content: [
      { type: 'p', text: 'Paragraph text.' },
      { type: 'h2', text: 'Section heading' },
      { type: 'ul', items: ['Bullet 1', 'Bullet 2'] },
      { type: 'ol', items: ['Step 1', 'Step 2'] },
      { type: 'cta' },  // renders the product CTA block
    ],
  },
]

export function getPostBySlug(slug) {
  return posts.find(p => p.slug === slug) || null
}
```

### `pages/blog/[slug].js` — key patterns
```js
export async function getStaticPaths() {
  return { paths: posts.map(p => ({ params: { slug: p.slug } })), fallback: false }
}
export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return { notFound: true }
  return { props: { post } }
}
```

---

## SEO checklist

Every page needs:
```jsx
<Head>
  <title>Page Title | Product Name</title>
  <meta name="description" content="150 chars max" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/logo.png" type="image/png" />
  <link rel="canonical" href="https://yourdomain.com/path" />
  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourdomain.com/path" />
  <meta property="og:title" content="Page Title | Product Name" />
  <meta property="og:description" content="150 chars max" />
  <meta property="og:image" content="https://yourdomain.com/og-image.png" />
  <meta property="og:site_name" content="Product Name" />
  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Page Title | Product Name" />
  <meta name="twitter:description" content="150 chars max" />
  <meta name="twitter:image" content="https://yourdomain.com/og-image.png" />
</Head>
```

Homepage also needs JSON-LD:
```jsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Product Name",
  "url": "https://yourdomain.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "...",
}) }} />
```

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

`public/sitemap.xml` — update manually or generate at build time. Include all static pages + blog posts.

---

## Vercel deployment

1. Push repo to GitHub
2. Import into Vercel — it auto-detects Next.js
3. Add env vars in Vercel → Settings → Environment Variables
4. **Env var changes require a redeploy** — they don't apply to existing builds
5. Custom domain: Vercel → Settings → Domains → add and verify

---

## Pitfalls we hit (don't repeat)

| Problem | Root cause | Fix |
|---|---|---|
| `JSON.parse` fails with "Bad control character" | Groq model writes literal `\n` inside JSON string values | Always run `fixControlChars()` before parsing |
| AI output cuts off mid-CV | No `max_tokens` set — Groq default is too low | Always set `max_tokens: 8000` (or higher for long outputs) |
| Older work experience dropped | Prompt said "cut irrelevant bullets" — model cut entire roles | Be explicit: "include every role, just condense less-relevant ones to 2–3 bullets" |
| Web3Forms returns 403 | Free tier blocks server-side HTTP requests | Submit directly from the browser, not from an API route |
| jsPDF crashes on first load | SSR tries to run browser-only code | Always `await import('jspdf')` inside a click handler, never at module level |
| AI uses banned AI-sounding words | Default model behaviour | Add explicit banned-word list to the prompt |
| ATS score bar shows 94% immediately | No animation | Use `@keyframes` fill animation + `animation-delay` |

---

## When to add more infrastructure

| Trigger | What to add |
|---|---|
| First paying user | Stripe (one-time payment or subscription) |
| Users want to save work | Supabase (Postgres + auth) or Vercel KV |
| Email list | Resend or ConvertKit — add after successful action |
| High Groq costs | Switch heavy tasks to batched/async, or add rate limiting per IP |
| Multiple AI models | Abstract the AI call behind an internal `callAI(prompt, options)` function |
| Internationalisation | next-i18next — add early, painful to retrofit |
