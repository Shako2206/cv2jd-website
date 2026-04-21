const PROMPT_TEMPLATE = (cv, jobDescription) => `You are a ruthlessly effective CV tailoring specialist. Your job is NOT to clean or polish the CV — it is to AGGRESSIVELY rewrite it so it mirrors the exact language, skills, and priorities of the job description.

STEP 1 — Extract from the job description:
- Every required skill, tool, technology, and methodology mentioned
- The exact words and phrases the employer uses (e.g. if they say "cross-functional collaboration", use that exact phrase)
- The seniority signals and responsibilities they care most about

STEP 2 — Rewrite the CV with these non-negotiable rules:
1. ADD a Professional Summary at the top (3-4 lines) that reads like it was written for THIS specific job — use the job title and mirror the JD's language directly
2. REWRITE every bullet point in Work Experience to reflect the JD's priorities. If the candidate did something relevant, describe it using the JD's exact terminology. Expand thin bullet points into strong achievement statements.
3. REORDER bullet points so the most relevant ones appear first in each role
4. INJECT keywords from the JD into the Skills section — reorganise skills to lead with what the JD asks for
5. SHORTEN or REMOVE sections and bullet points that are completely irrelevant to this role
6. USE the job description's language throughout — if the JD says "microservices", use "microservices" not "distributed systems"

Rules:
- Keep all facts accurate — do not invent roles, companies, dates, or qualifications
- You MAY rephrase, reframe, reorder, expand, or condense existing content
- ATS-friendly plain text only (no tables, columns, graphics)
- Strong action verbs on every bullet point
- If a number or metric exists in the original, keep it; if it can be reasonably inferred, add it

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

Respond ONLY with a valid JSON object (no markdown fences) with exactly these keys:
- "tailoredCV": complete rewritten CV as a plain text string (use \\n for line breaks)
- "keywords": array of strings — the key terms from the JD that were woven in
- "matchScore": integer 0–100 — estimated ATS alignment after tailoring
- "improvements": array of strings — the specific changes made and why`

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
        temperature: 0.4,
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
