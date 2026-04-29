const PROMPT_TEMPLATE = (cv, jobDescription) => `You are an expert CV and hiring consultant with deep experience in ATS optimization and recruiter expectations.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE RULES — never break these
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Do NOT invent or fabricate any experience, skills, achievements, or metrics
- You may rephrase, restructure, and prioritize content, but everything must remain truthful
- Align the candidate's experience with the language, keywords, and priorities in the job description
- Optimize for ATS by incorporating relevant keywords naturally — prefer the JD's exact phrasing
- Emphasize impact, outcomes, and measurable results where possible using existing information only
- You may suggest a quantified achievement only if it can be reasonably inferred from the existing CV text — never fabricate a number

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT TO DO — section by section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

--- PROFESSIONAL SUMMARY ---
Rewrite the summary to speak directly to this role:
- Open with who this person is + their most relevant strength for this specific JD
- Reference their strongest, most relevant achievement (quantified if supported by the CV)
- Close by connecting their background to the role's core challenge or mission
- No generic openers ("Results-driven", "Dynamic leader", "Passionate about", "Seasoned")
- Max 75 words, no bullets, flowing prose only

--- WORK EXPERIENCE ---
For each role:
- Reorder bullets so the most JD-relevant experience appears first
- Reframe bullets to highlight: relevant skills, business impact, leadership, ownership, and cross-functional work
- Mirror the JD's exact language where it truthfully describes what the candidate did
- Use strong action verbs: Led, Built, Engineered, Delivered, Scaled, Launched, Drove, Designed, Automated, Negotiated, Reduced, Streamlined, Overhauled, Expanded
- Never use: "responsible for", "helped with", "worked on", "assisted", "involved in", "contributed to", "supported"
- Trim each role to 3–5 bullets; the most recent or most relevant role may have up to 6
- Cut bullets with zero relevance to this role

--- JOB TITLES ---
Adjust a job title only if it genuinely clarifies scope without inflating seniority (e.g. "Engineer" → "Backend Engineer" if the CV content supports it). Never promote a title.

--- EDUCATION ---
Keep concise: degree, institution, year. Add relevant coursework only if it directly matches a JD requirement.

--- SKILLS ---
- Lead with JD-required skills the candidate genuinely has, in JD priority order
- Group using the JD's own category language where possible
- Remove skills with zero relevance to this role
- Maximum 4 categories, 8 skills each

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE & STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Professional, concise, and impactful
- Strong action verbs throughout
- No fluff, no generic statements, no buzzwords unless they appear in the original CV

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
- [Bullet — action verb, what, impact/result]
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
  "improvements": ["Specific change 1", "Specific change 2"],
  "gaps": ["Gap 1: what the role needs that is weak or missing, and a honest suggestion to address it"]
}

Field definitions:
- tailoredCV: the complete rewritten CV following the format spec above
- keywords: ATS keywords from the JD that appear in the rewritten CV — use the JD's exact phrasing; never list a skill absent from the original CV
- matchScore: honest 0–100 ATS score reflecting real keyword and competency alignment between the rewritten CV and the JD
- improvements: 4–6 specific named changes — e.g. "Moved AWS experience to top bullet under TechCorp — JD prioritises cloud infrastructure" not "Updated skills section"
- gaps: 2–5 items where the JD requires something weak or absent in the CV — for each gap state what is missing and give an honest, actionable suggestion to address it without fabricating experience`

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

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' })
      }
      parsed = JSON.parse(match[0])
    }

    return res.status(200).json({
      tailoredCV: typeof parsed.tailoredCV === 'string' ? parsed.tailoredCV : '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      matchScore: typeof parsed.matchScore === 'number' ? Math.round(parsed.matchScore) : 0,
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
    })
  } catch (err) {
    console.error('Tailor API error:', err)
    return res.status(500).json({ error: `Something went wrong: ${err?.message || 'unknown error'}` })
  }
}
