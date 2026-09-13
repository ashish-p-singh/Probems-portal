import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'

function extractJson(text: string) {
  try {
    const cleaned = text.replace(/```(?:json)?/gi, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', err)
    return null
  }
}

export async function detectSimilarProblems(
  title: string,
  description: string,
  existingProblems: Array<{ title: string; referenceId: string; category: string }>
) {
  if (!existingProblems.length) return []
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const existingList = existingProblems.slice(0, 20).map(p => `- [${p.referenceId}] ${p.title} (${p.category})`).join('\n')
    const prompt = `You are detecting duplicate civic problem reports in India.

New Problem Title: "${title}"
New Problem Description: "${description}"

Existing Problems:
${existingList}

Identify which (if any) existing problems are similar or duplicates of the new one. Only flag genuinely similar problems. Respond ONLY with valid JSON:
{
  "similarProblems": [
    {"referenceId": "PRB-XXXX-XXXXX", "title": "...", "similarityReason": "brief reason"}
  ]
}
If none are similar, return {"similarProblems": []}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    return parsed?.similarProblems || []
  } catch (error) {
    console.error('AI similar problem detection error:', error)
    return []
  }
}

export async function generateDashboardInsights(
  problems: Array<{ status: string; category: string; severity?: string | null; location: string; createdAt: string }>
) {
  if (!problems.length) return null
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const summary = {
      total: problems.length,
      byStatus: problems.reduce((acc: Record<string, number>, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {}),
      byCategory: problems.reduce((acc: Record<string, number>, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc }, {}),
      bySeverity: problems.reduce((acc: Record<string, number>, p) => { if (p.severity) acc[p.severity] = (acc[p.severity] || 0) + 1; return acc }, {}),
    }
    const prompt = `You are an AI analyst for a civic problem management platform in India. Analyze this data and generate actionable dashboard insights.

Problem Data Summary:
${JSON.stringify(summary, null, 2)}

Generate 3 concise, actionable insights. Respond ONLY with valid JSON:
{
  "insights": [
    {
      "type": "warning|info|success|urgent",
      "title": "Short insight title",
      "description": "1-2 sentence actionable insight",
      "metric": "key number or percentage (optional)"
    }
  ],
  "overallHealth": "good|moderate|needs_attention",
  "topRecommendation": "Single most important action to take right now"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return extractJson(text)
  } catch (error) {
    console.error('AI insights error:', error)
    return null
  }
}

export async function chatWithAssistant(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  userRole: string = 'citizen'
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const systemContext = `You are SIH 26043 AI Assistant, a knowledgeable, helpful, and open-minded AI assistant for the SIH 26043 Civic Problem-to-Impact Platform Prototype.
You can answer ANY question the user asks—whether about civic issues, emergency protocols, Indian municipal administration, environmental protection, engineering solutions, constitution and laws, technology, research, education, or general daily knowledge and creative queries. You are not artificially limited to website navigation.

Current user role context: ${userRole}

Guidelines:
- Provide clear, direct, and actionable answers.
- If the question relates to civic problems, municipal corporations, panchayats, or university research, offer practical Indian context.
- If the question relates to emergency reports, clarify that life-safety threats are escalated with topmost priority, while routine maintenance issues must be reported as standard submissions.
- Maintain a warm, constructive, and empowering tone.`

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemContext }],
        },
        {
          role: 'model',
          parts: [{ text: 'Hello! I am your SIH 26043 AI Assistant for civic impact, emergency verification, and general queries. How can I help you today?' }],
        },
        ...history,
      ],
    })

    const result = await chat.sendMessage(message)
    return result.response.text()
  } catch (error) {
    console.error('AI chat error:', error)
    return 'I\'m having trouble connecting right now. Please try again in a moment.'
  }
}

export async function verifyEmergencyReport(
  title: string,
  description: string,
  location: string,
  emergencyReason?: string
): Promise<{
  isEmergency: boolean
  confidence: number
  reason: string
  suggestedCategory?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const prompt = `You are an acute emergency validation specialist for a critical civic response system in India.
Your task is to determine whether a citizen's problem report qualifies as a genuine LIFE-SAFETY OR CATASTROPHIC CIVIC EMERGENCY, or if it is a standard civic issue that should not bypass regular queues.

CRITERIA FOR EMERGENCY (isEmergency = true):
- Imminent or active threat to human life or bodily safety (e.g. fallen high-voltage power lines in standing water, gaping deep sinkhole in active traffic, collapsed or actively crumbling bridge/building, toxic chemical/gas leak, flash flood breach trapping residents, open uncovered storm manhole next to school with active current).
- Catastrophic infrastructure failure posing immediate widespread casualty risk.

CRITERIA FOR NON-EMERGENCY (isEmergency = false):
- Routine potholes, road resurfacing needs, speed breakers.
- Delayed municipal garbage or waste clearing.
- Burnt out streetlights or flickering lamps without live exposed bare wires.
- Water supply disruptions, low pressure, or routine leakages.
- Overgrown weeds, park maintenance, noise complaints, stray animals without active rabies/mauling.
- General administrative delays or paperwork grievances.

Report Details:
- Title: "${title}"
- Description: "${description}"
- Location: "${location}"
- Declared Emergency Reason: "${emergencyReason || 'None provided'}"

Analyze objectively. If this is merely an inconvenience or standard maintenance issue, you MUST set "isEmergency" to false and explain why clearly to the citizen.
Respond ONLY with valid JSON:
{
  "isEmergency": true,
  "confidence": 0.95,
  "reason": "Clear explanation of why this report does or does not meet emergency criteria.",
  "suggestedCategory": "INFRASTRUCTURE | ELECTRICITY | WATER_SUPPLY | SANITATION | ROAD_TRANSPORT | DRAINAGE_FLOODING | HEALTHCARE | OTHER"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    if (!parsed || typeof parsed.isEmergency !== 'boolean') {
      // Heuristic keyword validation if JSON parse is not clean
      const lower = (title + ' ' + description + ' ' + (emergencyReason || '')).toLowerCase()
      const urgentKeywords = ['electrocution', 'sparking wire', 'live wire', 'collapsed', 'gas leak', 'explosion', 'drowning', 'toxic gas', 'deadly', 'fatal']
      const matched = urgentKeywords.some(k => lower.includes(k))
      return {
        isEmergency: matched,
        confidence: 0.7,
        reason: matched
          ? 'Critical life-safety keywords verified in incident description.'
          : 'Report does not display acute life-safety emergency indicators. Please submit as a standard civic report.',
      }
    }
    return {
      isEmergency: parsed.isEmergency,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      reason: parsed.reason || (parsed.isEmergency ? 'Verified acute emergency threat.' : 'Standard civic maintenance issue.'),
      suggestedCategory: parsed.suggestedCategory,
    }
  } catch (error) {
    console.error('AI emergency verification error:', error)
    const lower = (title + ' ' + description + ' ' + (emergencyReason || '')).toLowerCase()
    const urgentKeywords = ['electrocution', 'sparking wire', 'live wire', 'collapsed', 'gas leak', 'explosion', 'drowning', 'toxic gas', 'deadly']
    const matched = urgentKeywords.some(k => lower.includes(k))
    return {
      isEmergency: matched,
      confidence: 0.6,
      reason: matched
        ? 'Emergency verified via safety protocol heuristic.'
        : 'Emergency criteria not met. Please uncheck emergency and submit as a standard report.',
    }
  }
}

export async function classifyProblem(
  title: string,
  description: string,
  location: string,
  affectedPopulation?: number | string | null,
  extraData?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const prompt = `You are an expert AI civic problem taxonomist and engineering evaluator in India. Analyze this citizen-reported problem and rich context data to categorize and assign priority.

Problem Title: ${title}
Description: ${description}
Location: ${location}
Estimated Affected Population: ${affectedPopulation || 'Unspecified'}
Additional Evidence/Context: ${extraData || 'None'}

Respond ONLY with valid JSON in this exact format:
{
  "category": "one of: INFRASTRUCTURE, SANITATION, WATER_SUPPLY, DRAINAGE_FLOODING, ROAD_TRANSPORT, ELECTRICITY, HEALTHCARE, EDUCATION, ENVIRONMENT, AGRICULTURE, DIGITAL_SERVICES, SAFETY_SECURITY, OTHER",
  "severity": "LOW, MEDIUM, HIGH, or CRITICAL",
  "department": "e.g. PWD, Water Supply & Sewerage Board, Municipal Sanitation, Electricity Board, Urban Development Authority",
  "recommendedDepartments": ["dept1", "dept2"],
  "recommendedUniversityDisciplines": ["discipline1", "discipline2", "discipline3"],
  "summary": "2-sentence technical summary of the problem and its root risk",
  "priorityScore": 75,
  "actionableSteps": ["step1", "step2", "step3"]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    if (!parsed) throw new Error('No JSON found in response')
    return parsed
  } catch (error) {
    console.error('AI classification error:', error)
    return null
  }
}

export async function recommendUniversity(
  problemTitle: string,
  category: string,
  disciplines: string[],
  location: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const prompt = `You are advising a government platform that connects civic problems to universities. 

Problem: ${problemTitle}
Category: ${category}
Required Disciplines: ${disciplines.join(', ')}
Location: ${location}

Suggest suitable university types/departments for this problem. Respond with valid JSON:
{
  "recommendedDepartments": ["dept1", "dept2"],
  "requiredExpertise": ["skill1", "skill2"],
  "projectComplexity": "LOW, MEDIUM, HIGH",
  "estimatedDuration": "e.g. 3-6 months",
  "reasoning": "Brief explanation of why these departments are needed"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    if (!parsed) throw new Error('No JSON found in response')
    return parsed
  } catch (error) {
    console.error('AI university matching error:', error)
    return null
  }
}

export async function recommendTeam(
  problemTitle: string,
  proposedSolution: string,
  disciplines: string[]
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const prompt = `You are advising a university team formation for a civic problem project.

Problem: ${problemTitle}
Proposed Solution Approach: ${proposedSolution}
Available Disciplines: ${disciplines.join(', ')}

Recommend an optimal multidisciplinary team composition. Respond with valid JSON:
{
  "teamComposition": [
    {"discipline": "name", "role": "their role", "responsibilities": "what they do", "headcount": 1}
  ],
  "totalTeamSize": 5,
  "facultyLeaderProfile": "suggested expertise profile for faculty leader",
  "reasoning": "Why this composition is ideal"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    if (!parsed) throw new Error('No JSON found in response')
    return parsed
  } catch (error) {
    console.error('AI team recommendation error:', error)
    return null
  }
}

export async function generateProgressSummary(
  problemTitle: string,
  currentStatus: string,
  completedMilestones: string[],
  pendingTasks: string[],
  govFeedback?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const prompt = `Generate a brief professional project progress summary for a civic problem-solving platform.

Problem: ${problemTitle}
Current Status: ${currentStatus}
Completed Milestones: ${completedMilestones.join(', ')}
Pending Tasks: ${pendingTasks.join(', ')}
Government Feedback: ${govFeedback || 'None yet'}

Write a concise 3-4 sentence progress summary suitable for a government/university audience. Be factual and professional. Do not fabricate data.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('AI progress summary error:', error)
    return null
  }
}

export async function generateImpactReport(
  problemTitle: string,
  solution: string,
  metrics: Array<{ metric: string; value: number; unit: string }>
) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const metricsText = metrics.map((m) => `${m.metric}: ${m.value} ${m.unit}`).join('\n')
    const prompt = `Generate a structured impact report for a civic problem that has been solved.

Original Problem: ${problemTitle}
Solution Implemented: ${solution}
Measured Impact Metrics:
${metricsText}

Write a professional impact report (150-200 words) covering: the intervention, measured outcomes, community benefit, and sustainability. Only reference the provided metrics — do not fabricate numbers.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('AI impact report error:', error)
    return null
  }
}

export async function generateWelcomeInsight(opts: {
  role: string
  name: string
  department?: string
  discipline?: string
  sector?: string
  company?: string
  university?: string
  problems: Array<{ status: string; category: string; title: string }>
}): Promise<{
  greeting: string
  insight: string
  priority?: string
  type: 'info' | 'success' | 'warning' | 'urgent'
} | null> {
  if (!opts.problems.length) return null
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL })
    const profile = [
      opts.department && `Department: ${opts.department}`,
      opts.discipline && `Discipline: ${opts.discipline}`,
      opts.sector && `Sector: ${opts.sector}`,
      opts.company && `Company: ${opts.company}`,
      opts.university && `University: ${opts.university}`,
    ].filter(Boolean).join(', ')

    const statusSummary = opts.problems.reduce((acc: Record<string, number>, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})

    const prompt = `You are an AI assistant for a civic problem platform in India. Generate a personalised welcome insight for a ${opts.role} user.

User: ${opts.name}
Profile: ${profile}
Their problems/items (${opts.problems.length} total):
${JSON.stringify(statusSummary, null, 2)}

Generate a warm, personalised, actionable insight. Respond ONLY with valid JSON:
{
  "greeting": "Short personalised greeting mentioning their specific domain",
  "insight": "1-2 sentence actionable insight about what they should focus on right now based on their data",
  "priority": "The single most important action they should take (short phrase, optional)",
  "type": "info | success | warning | urgent"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = extractJson(text)
    if (!parsed) return null
    return {
      greeting: parsed.greeting || `Welcome back, ${opts.name}`,
      insight: parsed.insight || '',
      priority: parsed.priority,
      type: parsed.type || 'info',
    }
  } catch (error) {
    console.error('AI welcome insight error:', error)
    return null
  }
}

