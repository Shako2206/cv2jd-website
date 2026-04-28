# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local dev server at localhost:3000
npm run build    # Production build (run before committing to catch errors)
npm run start    # Serve the production build locally
```

No linter or test suite is configured. Always run `npm run build` before pushing — it catches type errors and page-level issues.

## Architecture

**Next.js 14 (Pages Router) deployed on Vercel.** No app directory, no server components. All pages use `pages/` convention with `styled-jsx` inline styles (no CSS modules, no Tailwind).

### Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `pages/index.js` | Marketing homepage (static) |
| `/tailor` | `pages/tailor.js` | Main product — CV tailoring UI |
| `/pricing` | `pages/pricing.js` | Pricing info + feedback form |
| `/privacy` | `pages/privacy.js` | Privacy Policy (static) |
| `/terms` | `pages/terms.js` | Terms of Service (static) |
| `/api/tailor` | `pages/api/tailor.js` | Server-side route — calls Groq API |

### Core data flow

```
User pastes CV + JD
  → pages/tailor.js (client)
  → POST /api/tailor (server, requires GROQ_API_KEY)
  → Groq API (llama-3.3-70b-versatile)
  → Returns { tailoredCV, keywords, matchScore, improvements }
  → Displayed in tabs; never persisted anywhere
```

The feedback form on `/pricing` submits **directly from the browser** to Web3Forms (not via an API route). This is intentional — Web3Forms free tier blocks server-side submissions.

### Analytics

PostHog is initialised in `pages/_app.js` with privacy-preserving settings (`autocapture: false`, `disable_session_recording: true`, `person_profiles: 'identified_only'`, EU region). Custom events are fired from `pages/tailor.js` via a thin `track()` wrapper around `posthog.capture()`.

Events: `tailor_started`, `tailor_succeeded`, `tailor_failed`, `cv_copied`, `cv_downloaded`, `feedback_submitted` (👍/👎 widget under results).

Event properties use **bucketed values only** — CV/JD sizes are `small/medium/large/xlarge`, never raw character counts. Error messages are truncated to 80 chars. No PII is ever sent.

### Styling conventions

- All styles are inline (`style={{ }}`) or `styled-jsx` (`<style jsx global>`) — no external CSS files except `styles/globals.css` (resets + 3 keyframe animations)
- Design tokens used throughout: gradient `linear-gradient(135deg, #667eea, #764ba2)`, dark bg `#0f0f1a`, body text `#1a1a2e`, muted `#666/#888/#aaa`
- Responsive breakpoints handled via `@media (max-width: 768px)` in `<style jsx global>` blocks with named className overrides

### PDF handling

PDF upload is parsed entirely **client-side** using `pdfjs-dist`. The worker script is loaded from Cloudflare CDN (`cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`). The parsed text is then used exactly like manually pasted CV text.

PDF download uses `jsPDF` imported dynamically (`await import('jspdf')`) to avoid SSR issues.

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `GROQ_API_KEY` | `pages/api/tailor.js` (server-side) | Required. From console.groq.com |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | `pages/pricing.js` (client-side) | Required. From web3forms.com. Public by design. |
| `NEXT_PUBLIC_POSTHOG_KEY` | `pages/_app.js` (client-side) | Required. Starts with `phc_`. EU region key. |
| `NEXT_PUBLIC_POSTHOG_HOST` | `pages/_app.js` (client-side) | Set to `https://eu.i.posthog.com` |

Local: create `.env.local` (already gitignored). Production: set in Vercel dashboard → Settings → Environment Variables, then **redeploy** (env var changes don't apply to existing builds).

## Key decisions & constraints

- **No CV storage** — CV and JD text is never written to any database, file, or log. This is a core privacy promise.
- **No accounts** — fully stateless from the user's perspective
- **No cookies** — PostHog configured cookieless; no consent banner needed
- **Groq model**: `llama-3.3-70b-versatile` at `temperature: 0.4`. The prompt is in `pages/api/tailor.js` as `PROMPT_TEMPLATE`. The AI must return a JSON object with keys `tailoredCV`, `keywords`, `matchScore`, `improvements`. The API route has JSON recovery logic (regex fallback) for when the model wraps output in markdown fences.
- **Web3Forms free tier**: requires client-side submission. A server-side API route was removed because Web3Forms returned 403 from Vercel functions.
- **`@google/generative-ai`** in `package.json` is a leftover dependency from a previous Gemini integration — safe to remove if cleaning up.

## Planned next (Phase 2)

- Opt-in JD sharing: checkbox on tailor form → anonymised JD + match score stored in Vercel KV or Supabase → feeds prompt iteration
- Email capture: opt-in "weekly interview tips" after successful tailoring (ConvertKit or Resend)
