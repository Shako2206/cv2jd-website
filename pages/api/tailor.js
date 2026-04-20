import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert CV/resume writer and ATS optimisation specialist. Your task is to tailor the provided CV to maximise alignment with the given job description while maintaining authenticity and factual accuracy.

When rewriting, you must:
1. Analyse the job description for key requirements, skills, and keywords
2. Restructure and rewrite the CV to highlight the most relevant experience and skills
3. Incorporate important keywords naturally throughout (especially in the summary and bullet points)
4. Use strong action verbs and quantify achievements wherever the original data supports it
5. Ensure strict ATS-friendly formatting: no tables, columns, graphics, or special characters
6. Reframe existing experience to match the language and priorities of the target role
7. Preserve all factual information — do not invent roles, skills, or achievements

Respond ONLY with a valid JSON object (no markdown, no code fences) with exactly these keys:
- "tailoredCV": the complete rewritten CV as a plain text string (use \\n for line breaks)
- "keywords": an array of strings — the most important keywords/phrases incorporated
- "matchScore": an integer 0–100 representing estimated ATS alignment
- "improvements": an array of strings — concise descriptions of the key changes made`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { cv, jobDescription } = req.body ?? {}

  if (!cv?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'Both cv and jobDescription are required.' })
  }

  if (cv.length > 50000 || jobDescription.length > 20000) {
    return res.status(400).json({ error: 'Input too large. Please shorten your CV or job description.' })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nORIGINAL CV:\n${cv}`,
              cache_control: { type: 'ephemeral' },
            },
          ],
        },
      ],
    })

    const rawText = message.content.find(b => b.type === 'text')?.text ?? ''

    // Strip any accidental markdown fences before parsing
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // Fallback: try to extract a JSON object from the response
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        return res.status(502).json({ error: 'AI returned an unexpected format. Please try again.' })
      }
      parsed = JSON.parse(match[0])
    }

    // Normalise types so the frontend never breaks
    const tailoredCV = typeof parsed.tailoredCV === 'string' ? parsed.tailoredCV : ''
    const keywords = Array.isArray(parsed.keywords) ? parsed.keywords : []
    const matchScore = typeof parsed.matchScore === 'number' ? Math.round(parsed.matchScore) : 0
    const improvements = Array.isArray(parsed.improvements) ? parsed.improvements : []

    return res.status(200).json({ tailoredCV, keywords, matchScore, improvements })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ error: 'Invalid API key. Check your ANTHROPIC_API_KEY environment variable.' })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' })
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `AI service error (${err.status}). Please try again.` })
    }
    console.error('Tailor API error:', err)
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' })
  }
}
