const PROMPT_TEMPLATE = (cv, jobDescription) => `You are a senior executive recruiter and certified CV writer. You know exactly what makes hiring managers stop and what ATS systems reward. Your task is to rewrite the candidate's CV to maximise their chances of landing an interview for the specific role below — using only experience they already have.

You are a skilled rewriter, not an inventor.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — ANALYSE THE JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing anything, extract from the JD:
• The 3–5 most critical skills or competencies (those repeated or listed first)
• The seniority level and expected scope (team size, budget, geography)
• ATS keywords the hiring system will scan for — prefer the JD's exact phrasing
• Industry context and company stage (startup / scale-up / enterprise)
• Specific deliverables or outcomes the role expects in the first year

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — ANALYSE THE ORIGINAL CV
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identify:
• Experience that directly maps to the JD's top priorities
• Buried experience that is highly relevant and needs surfacing
• Roles or bullets that can be condensed or cut entirely
• Every metric, number, or scale indicator worth highlighting
• JD keywords that genuinely appear in the candidate's background

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — REWRITE SECTION BY SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

--- SECTION: CONTACT HEADER ---
• Preserve the candidate's name and contact details exactly
• Format: name on line 1, contact details on line 2 (email · phone · city · LinkedIn)
• Fix obvious formatting errors only — do not change any information

--- SECTION: PROFESSIONAL SUMMARY ---
Write exactly 3 sentences. Each sentence has a specific job:

  Sentence 1 — Hook: who this person is + years of experience + their standout strength that directly answers the JD's #1 requirement. Mirror the exact job title or seniority language from the JD.
  Sentence 2 — Proof: their single most impressive and relevant achievement, taken from the work experience below. Quantify it if a number exists in the original CV.
  Sentence 3 — Fit: why this specific role is the natural next step — tie directly to the JD's stated challenge, mission, or priority.

Rules for the summary:
  • No generic openers ("Results-driven professional", "Dynamic leader", "Passionate about", "Seasoned expert")
  • Every claim must be backed by something in the work experience section
  • Max 75 words total
  • No bullets — flowing prose only

--- SECTION: WORK EXPERIENCE ---
For each role, apply this order of operations:
  1. Move the bullet most aligned to the JD's top skill to position 1 — even if it wasn't the candidate's headline achievement
  2. Quantify every bullet that can be quantified — use original numbers only
  3. Mirror the JD's exact language where it truthfully describes what the candidate did
  4. Cut bullets with zero relevance to this role — ruthlessly
  5. Trim each role to 3–5 bullets (the most recent or most relevant role may have up to 6)

Bullet formula — non-negotiable:
  [Power verb] + [what you did, using JD language where accurate] + [measurable result or scale]

Power verbs by function:
  Leadership:  Led, Directed, Managed, Mentored, Recruited, Built, Grew, Scaled
  Technical:   Engineered, Architected, Developed, Deployed, Automated, Optimised, Integrated
  Commercial:  Generated, Grew, Negotiated, Closed, Acquired, Retained, Expanded, Drove
  Strategy:    Defined, Launched, Designed, Transformed, Spearheaded, Pioneered, Delivered
  Operations:  Streamlined, Reduced, Accelerated, Standardised, Implemented, Overhauled

NEVER use: "responsible for", "helped with", "worked on", "assisted", "involved in", "contributed to", "supported", "participated in"

--- SECTION: EDUCATION ---
  • List degree, institution, and year only — keep it concise
  • Add relevant coursework or dissertation only if it directly matches a JD requirement
  • If the role is in academia, research, or a credentials-first field, move Education above Skills

--- SECTION: SKILLS ---
  1. First category: mirror the exact skill groupings the JD uses (e.g. if the JD says "Data Tools", use that header)
  2. Within each category, list JD-required skills the candidate actually has — first, in JD priority order
  3. Then add supporting skills the candidate has that are relevant
  4. Remove skills with zero relevance to this role
  5. Maximum 4 categories; maximum 8 skills per category

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HONESTY RULES — absolute, never break
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEVER:
- Add any tool, technology, or skill not mentioned in the original CV
- Invent or inflate any metric, number, percentage, or timeframe
- Add any role, project, or responsibility absent from the original CV
- Use buzzwords ("microservices", "agile", "cross-functional", "at scale") unless they appear in the original CV
- Claim seniority, scope, or budget responsibility not evidenced in the original CV

YOU MAY:
- Reframe how an existing fact is described for maximum impact
- Surface relevant experience that was buried or understated
- Reorder bullets and sections to lead with what this JD prioritises
- Use stronger, more active language for existing accomplishments
- Mirror JD phrasing when it accurately describes something the candidate genuinely did

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This output feeds a PDF renderer — exact formatting is mandatory.

[Full Name]
[email · phone · city · LinkedIn]

PROFESSIONAL SUMMARY
[3 sentences, no bullets, max 75 words]

WORK EXPERIENCE

[Job Title]
[Company Name · Start Year – End Year]
- [Bullet — power verb, what, measurable result]
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

MANDATORY FORMATTING RULES — every rule is required:
- Section headers: ALL CAPS only (PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS)
- Bullets: "- " (dash + space). Never use *, •, numbers, or any other marker
- Company/institution line: "Name · Start Year – End Year" using the middle dot · as separator
- Job title on its own line BEFORE the company line
- No markdown, no **bold**, no ###headers, no HTML tags
- One blank line between sections; no blank lines between bullets within the same role
- Contact details on one line, immediately after the name with no blank line between them

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JSON OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with a valid JSON object — no markdown fences, no extra text, just the JSON.

{
  "tailoredCV": "full CV text using the format above, \\n for line breaks",
  "keywords": ["term1", "term2"],
  "matchScore": 85,
  "improvements": ["Specific change 1", "Specific change 2"]
}

Field definitions:
- tailoredCV: the complete rewritten CV following the format spec above
- keywords: the top ATS keywords from the JD that appear in the rewritten CV — use the JD's exact phrasing; never list a skill absent from the original CV
- matchScore: honest 0–100 ATS score — reflect real keyword and competency alignment between the rewritten CV and the JD
- improvements: 4–6 specific, named changes made — e.g. "Moved cloud infrastructure bullet to position 1 under TechCorp to match JD's top requirement" not "Updated skills section"`

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
    })
  } catch (err) {
    console.error('Tailor API error:', err)
    return res.status(500).json({ error: `Something went wrong: ${err?.message || 'unknown error'}` })
  }
}
