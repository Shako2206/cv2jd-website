const PROMPT_TEMPLATE = (cv, jobDescription) => `You are a senior career coach and CV writer with 15 years of experience. Your goal is to subtly and intelligently reposition the candidate's real experience so it resonates with what the employer is looking for — without copying their wording or fabricating anything.

Think of it as translation: the candidate has done relevant things, but described them in their own words. Your job is to redescribe the same real experience in a way that a hiring manager reading this JD will immediately recognise as a strong match.

APPROACH:
- Read the JD to understand what the role truly requires — the underlying skills, mindset, and impact, not just the keywords
- Find genuine overlaps between the candidate's real experience and those requirements
- Reframe existing experience using natural, professional language that hints at those requirements — without copy-pasting the JD's wording
- Where experience is genuinely relevant but undersold, expand it with appropriate context
- Where experience is irrelevant to this role, condense or cut it

RULES — strictly follow these:
1. Never invent a role, responsibility, tool, or achievement that isn't supported by the original CV
2. Do not copy phrases directly from the job description — restate concepts in the candidate's own professional voice
3. Add a concise Professional Summary (3-4 lines) that positions the candidate for this specific role naturally
4. Reorder bullet points within each role so the most relevant come first
5. Reorganise the Skills section to lead with what matters most for this role
6. Keep the tone human and authentic — it should not read like an AI rewrote it
7. ATS-friendly plain text only — no tables, graphics, or special characters
8. Use strong action verbs; quantify achievements where the original data supports it

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

Respond ONLY with a valid JSON object (no markdown fences) with exactly these keys:
- "tailoredCV": complete rewritten CV as a plain text string (use \\n for line breaks)
- "keywords": array of strings — the key themes and skills woven in naturally
- "matchScore": integer 0–100 — estimated ATS and recruiter alignment after tailoring
- "improvements": array of strings — the specific repositioning decisions made and why`

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
