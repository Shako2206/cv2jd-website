const PROMPT_TEMPLATE = (cv, jobDescription) => `You are an expert CV/resume writer and ATS optimisation specialist. Tailor the CV below to maximise alignment with the job description while keeping all facts accurate — do not invent roles or achievements.

Rules:
- ATS-friendly plain text only (no tables, columns, graphics, or special characters)
- Incorporate key job-description keywords naturally
- Use strong action verbs and quantify achievements where the original data supports it
- Reframe experience to match the language of the target role

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cv}

Respond ONLY with a valid JSON object (no markdown fences) with exactly these keys:
- "tailoredCV": complete rewritten CV as a plain text string (use \\n for line breaks)
- "keywords": array of strings — the key terms incorporated
- "matchScore": integer 0–100 — estimated ATS alignment
- "improvements": array of strings — the key changes made`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cv, jobDescription } = req.body ?? {}

  if (!cv?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'Both cv and jobDescription are required.' })
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'API key not configured — add GOOGLE_API_KEY in your Vercel project settings under Environment Variables, then redeploy.' })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT_TEMPLATE(cv, jobDescription) }] }],
          generationConfig: { temperature: 0.4 },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}))
      const errMsg = errBody?.error?.message || geminiRes.statusText
      console.error('Gemini API error:', geminiRes.status, errMsg)
      if (geminiRes.status === 401 || geminiRes.status === 403) {
        return res.status(401).json({ error: `Invalid API key: ${errMsg}` })
      }
      if (geminiRes.status === 429) {
        return res.status(429).json({ error: `Quota exceeded: ${errMsg}` })
      }
      return res.status(502).json({ error: `Gemini API error ${geminiRes.status}: ${errMsg}` })
    }

    const data = await geminiRes.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

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
