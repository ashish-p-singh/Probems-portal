'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HistoryItem {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

const QUICK_PROMPTS = [
  'How do I report a problem?',
  'What happens after I submit?',
  'What categories exist?',
  'How long does resolution take?',
]

export function AIChatbot() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **SIH 26043 AI**, your assistant for the SIH 26043 platform prototype. I can help you report civic problems, verify emergencies, understand the workflow, or answer any platform questions. How can I help?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages])

  const buildHistory = (msgs: Message[]): HistoryItem[] => {
    return msgs.slice(1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: buildHistory(messages),
        }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: "👋 Hi! I'm **SIH 26043 AI**. How can I help you today?",
    }])
  }

  // Simple markdown bold renderer
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open AI chat"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">SIH 26043 AI</p>
              <p className="text-xs text-indigo-200">Powered by Gemini · Always here to help</p>
            </div>
            <button onClick={reset} className="text-indigo-200 hover:text-white" title="Reset chat">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts (only shown at start) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 hover:border-indigo-200 rounded-full px-3 py-1.5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 focus-within:border-indigo-300 focus-within:bg-white transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
