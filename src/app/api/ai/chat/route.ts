import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { chatWithAssistant } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const session = await auth()
  // Allow unauthenticated access so anyone on the landing page can use the chatbot
  const userRole = (session?.user as any)?.role || 'visitor'

  const { message, history = [] } = await req.json()
  if (!message?.trim()) return Response.json({ error: 'message required' }, { status: 400 })

  const reply = await chatWithAssistant(message, history, userRole)
  return Response.json({ reply })
}
