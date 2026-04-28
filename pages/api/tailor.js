const PROMPT_TEMPLATE = (cv, jobDescription) => `You are an expert CV writer and career strategist. Your task is to produce the most compelling, interview-winning version of this candidate's CV for the specific role — using only the experience they already have.

GOAL: Make the candidate look as strong as possible for this job by surfacing what is in their CV and describing it in the most powerful way. You are a skilled rewriter, not an inventor.

━━━ WHAT YOU CAN DO ━━━

1. Write a sharp Professional Summary (3–4 sentences) that speaks directly to what this JD is looking for, using only facts from the original CV.
2. Rewrite existing bullet points with stronger, more impactful language — same facts, better framing.
3. Reorder bullets within each role so the most JD-relevant come first.
4. Restructure Skills to lead with what this role requires (only skills already in the CV).
5. Remove or condense experience that is not relevant to this role.

━━━ HOW TO WRITE BULLETS THAT WIN INTERVIEWS ━━━

Every bullet must follow this formula: strong action verb → what you did → the result or scale.

✓ GOOD: "Reduced API response time by 60% by refactoring the caching layer"
✗ WEAK: "Worked on improving API performance"

Rules:
- Always open with a powerful past-tense verb: Led, Built, Engineered, Delivered, Scaled, Launched, Drove, Designed, Implemented, Optimised, Reduced, Increased, Saved, Managed, Negotiated, Automated
- If a number or metric exists in the original CV, use it prominently
- Cut all weak openers: "responsible for", "assisted with", "helped to", "involved in", "worked on", "contributed to"
- Each bullet should make a hiring manager think "this person gets things done"

━━━ HONESTY RULES — never break these ━━━

- Never add a tool, technology, platform, or skill not in the original CV
- Never invent or inflate a metric, percentage, number, or timeframe
- Never add a role, project, or responsibility that is not in the original CV
- Never add a buzzword ("microservices", "agile", "at scale", "enterprise", "cross-functional") unless it appears in the original CV
- You may strengthen how something is described — you may not change what happened

━━━ REQUIRED OUTPUT FORMAT ━━━

This feeds directly into a PDF renderer — any deviation breaks the formatting.

[Full Name]
[email · phone · city · LinkedIn]

PROFESSIONAL SUMMARY
Compelling 3–4 sentence paragraph. No bullets. Speaks directly to this role.

WORK EXPERIENCE

[Job Title]
[Company Name · Start Year – End Year]
- Most impactful bullet — lead with result, open with action verb
- Second bullet
- Third bullet

[Previous Job Title]
[Company Name · Start Year – End Year]
- Bullet
- Bullet

EDUCATION

[Degree]
[Institution · Year]

SKILLS

[Category]: skill1, skill2, skill3
[Category]: skill1, skill2

FORMATTING RULES — every rule is mandatory:
- Section headers: ALL CAPS only (PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS)
- Bullets: start with "- " (dash space). Never use *, •, numbers, or any other marker
- Company/institution line: always in the format "Name · Year – Year" using the middle dot · as separator
- Job title goes on its own line BEFORE the company line
- No markdown, no **bold**, no ###headers, no HTML
- One blank line between sections, no blank lines within a job's bullets
- Contact details on one or two lines, immediately after the name

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

Respond ONLY with a valid JSON object — no markdown fences, no extra text, just the JSON.

{
  "tailoredCV": "full CV text using the format above, \\n for line breaks",
  "keywords": ["term1", "term2"],
  "matchScore": 85,
  "improvements": ["Specific change 1", "Specific change 2"]
}

Key definitions:
- tailoredCV: the complete rewritten CV following the format spec above
- keywords: JD terms that genuinely exist in the original CV and have been surfaced or made more prominent — never list a skill not in the original CV
- matchScore: honest 0–100 ATS score reflecting real alignment between the CV and JD
- improvements: specific, named changes — "Moved AWS experience to top bullet under TechCorp — JD prioritises cloud infrastructure" not "Updated skills section"`

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
