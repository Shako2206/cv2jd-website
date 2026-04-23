export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, message } = req.body ?? {}

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  if (!process.env.WEB3FORMS_KEY) {
    return res.status(503).json({ error: 'Feedback service not configured.' })
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY,
        subject: 'cv2jd — New Feedback',
        name: name?.trim() || 'Anonymous',
        message: message.trim(),
        from_name: 'cv2jd Feedback',
      }),
    })

    if (response.status === 403) {
      console.error('Feedback error: Web3Forms returned 403 — check WEB3FORMS_KEY in Vercel environment variables.')
      return res.status(502).json({ error: 'Feedback service misconfigured. Please contact support.' })
    }

    if (!response.ok) {
      console.error('Feedback error: Web3Forms returned', response.status)
      return res.status(502).json({ error: 'Could not reach feedback service. Please try again.' })
    }

    const data = await response.json()

    if (!data.success) {
      console.error('Feedback error: Web3Forms success=false', data)
      return res.status(502).json({ error: 'Could not send feedback. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Feedback error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
