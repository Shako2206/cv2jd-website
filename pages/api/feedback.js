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

    const data = await response.json()

    if (!data.success) {
      return res.status(502).json({ error: 'Could not send feedback. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Feedback error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
