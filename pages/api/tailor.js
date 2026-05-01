const PROMPT_TEMPLATE = (cv, jobDescription) => `You are an expert CV strategist and senior hiring consultant. Your job is to produce the strongest honest version of this candidate's CV for this specific role.

Priority order when making any decision: Accuracy > Relevance > Impact > ATS > Brevity.
When in doubt between a more impressive but less accurate claim and a less impressive but accurate one — always choose accuracy.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DOMAIN VOCABULARY ANALYSIS (do this first)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before rewriting, identify 3–6 vocabulary gaps: places where the CV uses the candidate's natural language but the JD uses different language for the same concept. These are translation opportunities — not fabrications.

Example: CV says "machine learning models" → JD says "predictive analytics" → use the JD's language throughout.
Example: CV says "managed a team" → JD says "cross-functional leadership" → adopt the JD's framing.

You will output these as a vocabularyMap in the JSON. Apply all vocabulary swaps throughout the rewritten CV.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — REWRITE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HONESTY — never break these:
- Never invent or fabricate any experience, skill, achievement, or metric
- Never add a role, project, or technology not in the original CV
- Never inflate a job title or claim a number not supported by the original text
- Reframe how things are described — never change what happened

--- PROFESSIONAL SUMMARY ---
- Open with who this person is + their most relevant strength for this specific JD
- Reference their strongest, most relevant achievement (quantified only if the CV supports it)
- Close by connecting their background to the role's core challenge
- No generic openers: "Results-driven", "Dynamic", "Passionate about", "Seasoned", "Dedicated"
- Max 75 words, prose only, no bullets

--- WORK EXPERIENCE ---
Include every role from the original CV — never omit a job entirely.
- Reorder bullets so the most JD-relevant experience appears first
- Mirror the JD's vocabulary where it truthfully describes what the candidate did (use your vocabulary map)
- Strong action verbs only: Led, Built, Engineered, Delivered, Scaled, Launched, Drove, Designed, Automated, Negotiated, Reduced, Streamlined, Overhauled, Expanded, Implemented, Deployed, Optimised
- Banned weak openers: "responsible for", "helped with", "worked on", "assisted", "involved in", "contributed to", "supported"
- Most recent / most relevant role: 4–6 bullets. Supporting roles: 3–4 bullets. Older roles: 2–3 bullets.

--- BULLET QUALITY RULES ---
Formula: strong action verb → what you did → concrete result or scale
✓ GOOD: "Reduced deployment time by 60% by containerising the pipeline with Docker"
✗ WEAK: "Worked on improving deployment processes"
- Always end bullets with a concrete result, metric, or named output — NEVER end with a vague "-ing" phrase like "...improving efficiency", "...advancing the team", "...enabling growth"
- If a number exists in the original CV, use it prominently
- Vary bullet length — mix short punchy bullets (10–14 words) with detailed ones (20–28 words)

--- EDUCATION ---
Degree, institution, year. Add relevant coursework only if it directly matches a JD requirement.

--- SKILLS ---
- Lead with JD-required skills the candidate genuinely has
- Group using the JD's own category language where possible
- Remove skills irrelevant to this role
- Maximum 4 categories, 8 skills each

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — LANGUAGE QUALITY (apply to every sentence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These words and phrases are dead giveaways of AI-written text. Never use them:

Banned words: delve, tapestry, multifaceted, pivotal, realm, synergy, paradigm, holistic, nuanced, foster, embark, spearhead, cornerstone, leverage (as a verb), utilize, harness, cutting-edge, groundbreaking, innovative (unless quoting the JD), robust (use "strong" or "reliable"), comprehensive (use "thorough" or "broad"), meticulous (use "careful" or "precise"), seamlessly, notably, meticulously, thereby, subsequently

Banned phrases: "proven track record", "passionate about", "demonstrated ability to", "strong foundation in", "well-versed in", "adept at", "at the forefront of", "in today's rapidly evolving"

Positive markers of human writing (aim for these):
- Named entities: tool names, method names, team names, products
- Front-loaded specifics: lead with the concrete thing, not the framing
- Use the JD's own vocabulary — not generic synonyms
- Short connector words: "so", "but", "then" — not "consequently", "however", "additionally"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED CV FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This output feeds a PDF renderer — exact formatting is mandatory.

[Full Name]
[email · phone · city · LinkedIn]

PROFESSIONAL SUMMARY
[flowing prose, max 75 words, no bullets]

WORK EXPERIENCE

[Job Title]
[Company Name · Start Year – End Year]
- [Bullet — action verb, what, concrete result]
- [Bullet]
- [Bullet]

[Job Title]
[Company Name · Start Year – End Year]
- [Bullet]
- [Bullet]

EDUCATION

[Degree Title]
[Institution · Year]

SKILLS

[Category]: skill1, skill2, skill3
[Category]: skill1, skill2

MANDATORY FORMATTING RULES:
- Section headers: ALL CAPS only (PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS)
- Bullets: "- " (dash + space). Never use *, •, numbers, or any other marker
- Company line format: "Name · Start Year – End Year" using the middle dot · as separator
- Job title on its own line BEFORE the company line
- No markdown, no **bold**, no ###headers, no HTML tags
- One blank line between sections; no blank lines between bullets within the same role
- Contact details on one line immediately after the name with no blank line between them

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with a valid JSON object — no markdown fences, no extra text, just the JSON.

{
  "tailoredCV": "full CV text using the format above, \\n for line breaks",
  "keywords": ["term1", "term2"],
  "matchScore": 85,
  "vocabularyMap": [
    {"cvSays": "machine learning models", "jdSays": "predictive analytics", "why": "JD uses this term 4 times in requirements"}
  ],
  "improvements": ["Specific change 1", "Specific change 2"],
  "gaps": ["Gap 1: what the role needs that is weak or missing, and an honest suggestion to address it"]
}

Field definitions:
- tailoredCV: complete rewritten CV following the format spec above
- keywords: ATS keywords from the JD that appear in the rewritten CV — use the JD's exact phrasing; never list a skill absent from the original CV
- matchScore: honest 0–100 ATS score reflecting real keyword and competency alignment between the rewritten CV and this JD
- vocabularyMap: 3–6 vocabulary swaps applied — where the CV used one term and you adopted the JD's language instead. Each entry: cvSays (what the original CV said), jdSays (what this JD calls it), why (one sentence on why this swap helps)
- improvements: 4–6 specific named changes made — e.g. "Moved AWS experience to top bullet under TechCorp — JD prioritises cloud infrastructure" not "Updated skills section"
- gaps: 2–5 honest gaps — what the JD requires that is weak or absent in the CV, with an actionable suggestion to address each without fabricating experience`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cv, jobDescription } = req.body ?? {}

  if (!cv?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'Both cv and jobDescription are required.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'API key not configured — add GROQ_API_KEY in your Vercel project settings under Environment Variables, then redeploy.' })
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: PROMPT_TEMPLATE(cv, jobDescription) }],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.json().catch(() => ({}))
      const errMsg = errBody?.error?.message || groqRes.statusText
      console.error('Groq API error:', groqRes.status, errMsg)
      if (groqRes.status === 401) {
        return res.status(401).json({ error: `Invalid API key — check your GROQ_API_KEY in Vercel environment variables.` })
      }
      if (groqRes.status === 429) {
        return res.status(429).json({ error: `Rate limit hit — please wait a moment and try again.` })
      }
      return res.status(502).json({ error: `Groq API error ${groqRes.status}: ${errMsg}` })
    }

    const data = await groqRes.json()
    const rawText = data?.choices?.[0]?.message?.content ?? ''

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    // Escape any literal control characters inside JSON string values.
    // The model sometimes outputs real newlines/tabs inside strings instead of \n/\t.
    function fixControlChars(str) {
      let out = ''
      let inString = false
      let escaped = false
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

    let parsed
    try {
      parsed = JSON.parse(fixControlChars(cleaned))
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' })
      }
      parsed = JSON.parse(fixControlChars(match[0]))
    }

    return res.status(200).json({
      tailoredCV: typeof parsed.tailoredCV === 'string' ? parsed.tailoredCV : '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      matchScore: typeof parsed.matchScore === 'number' ? Math.round(parsed.matchScore) : 0,
      vocabularyMap: Array.isArray(parsed.vocabularyMap) ? parsed.vocabularyMap : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
    })
  } catch (err) {
    console.error('Tailor API error:', err)
    return res.status(500).json({ error: `Something went wrong: ${err?.message || 'unknown error'}` })
  }
}
