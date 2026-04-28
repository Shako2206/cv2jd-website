const PROMPT_TEMPLATE = (cv, jobDescription) => `You are a strict CV editor. Your job is to restructure and rephrase the candidate's existing CV to better align with the job description — using ONLY information already present in the original CV. You are an editor, not a writer.

ABSOLUTE RULE: Every fact, tool, technology, metric, achievement, responsibility, and claim in your output must already exist in the original CV. Do not add anything new. If you are unsure whether something is in the CV, leave it out.

WHAT YOU ARE ALLOWED TO DO:
1. Write a Professional Summary (3–4 lines) using ONLY facts already in the CV — the person's current title, years of experience, and skills that appear in the CV. Do not add anything that isn't there.
2. Reorder bullet points within each role so the most JD-relevant bullets come first.
3. Rephrase existing bullets with stronger action verbs — but only to describe what is already stated. Do not change what happened, only how it is expressed.
4. Reorder or restructure the Skills section so JD-relevant skills (that exist in the CV) appear first.
5. Remove or shorten bullet points that are not relevant to this role.

WHAT YOU MUST NEVER DO:
- Do not add any tool, technology, platform, or framework not mentioned in the original CV.
- Do not add any metric, percentage, or number not in the original CV.
- Do not add any project, responsibility, or role that is not in the original CV.
- Do not add words like "at scale", "cross-functional", "enterprise", "agile", "microservices", etc. unless they appear in the original CV.
- Do not infer or assume anything. Only use what is explicitly written.

VERIFICATION STEP: Before finalising each bullet point or sentence, check that every specific claim it makes exists in the original CV. If it does not, revert to the original wording or remove the bullet.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

Respond ONLY with a valid JSON object (no markdown fences) with exactly these keys:
- "tailoredCV": the edited CV as a plain text string (use \\n for line breaks). ATS-friendly — no tables, graphics, or special characters.
- "keywords": array of strings — terms that (a) appear in the job description AND (b) are genuinely present in the original CV and have been moved to a more prominent position. Do not list skills that were not in the original CV.
- "matchScore": integer 0–100 — realistic ATS alignment score based only on what is genuinely in the CV
- "improvements": array of strings — each item must name one specific structural change: which section or bullet was moved/rephrased and why. Example: "Moved 'AWS Lambda' to the top bullet under TechCorp — the JD prioritises cloud infrastructure." Do not list vague changes like "Updated summary".`

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
        temperature: 0.2,
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
