import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyRole } from '@/lib/notifications'
import { classifyProblem, verifyEmergencyReport } from '@/lib/ai'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const citizenId = searchParams.get('citizenId')
  const scope = searchParams.get('scope') // 'my' | 'community' | 'my_dept' | 'all'
  const category = searchParams.get('category')
  const isEmergencyOnly = searchParams.get('emergency') === 'true'

  const where: any = {}
  const role = session.user.role

  if (role === 'CITIZEN') {
    // Citizens: 'my' → only own problems; 'community' → all problems in the platform
    if (scope === 'community') {
      // No filter — they can see all community problems
    } else {
      // Default: personal problems only
      where.citizenId = session.user.id
    }
  } else if (role === 'GOVERNMENT') {
    // Government: filter by department relevance unless admin-override scope=all
    if (scope !== 'all') {
      const dept = (session.user.department || '').toLowerCase()
      if (dept) {
        const deptKeywords = dept.split(/[\s,&]+/).filter(Boolean)
        const categoryMap: Record<string, string[]> = {
          water: ['WATER_SUPPLY', 'DRAINAGE_FLOODING'],
          sanitation: ['SANITATION'],
          drainage: ['DRAINAGE_FLOODING'],
          road: ['ROAD_TRANSPORT', 'INFRASTRUCTURE'],
          transport: ['ROAD_TRANSPORT'],
          pwd: ['ROAD_TRANSPORT', 'INFRASTRUCTURE'],
          electricity: ['ELECTRICITY'],
          urban: ['INFRASTRUCTURE', 'SANITATION', 'WATER_SUPPLY', 'DRAINAGE_FLOODING', 'ROAD_TRANSPORT', 'ELECTRICITY', 'ENVIRONMENT'],
          development: ['INFRASTRUCTURE'],
          health: ['HEALTHCARE'],
          education: ['EDUCATION'],
          environment: ['ENVIRONMENT'],
          agriculture: ['AGRICULTURE'],
          revenue: ['INFRASTRUCTURE'],
        }
        const relevantCategories = deptKeywords.flatMap(k => categoryMap[k] || [])
        if (relevantCategories.length > 0) {
          where.OR = [
            { category: { in: relevantCategories } },
            { aiCategory: { in: relevantCategories } },
          ]
        }
      }
    }
    // citizenId filter still supported for admin lookup
    if (citizenId) where.citizenId = citizenId
  } else if (role === 'UNIVERSITY') {
    // University: see verified problems ready for university adoption as well as accepted/research stages
    where.status = { in: ['VERIFIED', 'UNDER_UNIVERSITY_REVIEW', 'ACCEPTED', 'TEAM_FORMATION', 'SOLUTION_DEVELOPMENT'] }
    const discipline = session.user.discipline || session.user.department
    if (discipline && scope !== 'all') {
      const disc = discipline.toLowerCase()
      where.OR = [
        { aiRecommendedDepts: { contains: disc } },
        { category: { in: getAllCategoriesForDiscipline(disc) } },
      ]
    }
  } else if (role === 'FACULTY') {
    // Faculty: only see problems linked to projects assigned to them
    const assignedProjects = await prisma.facultyLeaderAssignment.findMany({
      where: { facultyId: session.user.id },
      select: { project: { select: { problemId: true } } },
    })
    const problemIds = assignedProjects.map((a: any) => a.project.problemId).filter(Boolean)
    if (problemIds.length > 0) {
      where.id = { in: problemIds }
    } else {
      // No assigned projects yet — return empty
      where.id = 'none'
    }
  } else if (role === 'INDUSTRY') {
    // Industry: only see collaboration-stage problems, optionally filtered by sector
    where.status = { in: ['APPROVED', 'INDUSTRY_COLLABORATION', 'IMPLEMENTATION', 'PROBLEM_SOLVED', 'SUSTAINABLE_IMPACT'] }
    const sector = session.user.sector
    if (sector && scope !== 'all') {
      const sec = sector.toLowerCase()
      where.OR = [
        { aiRecommendedDepts: { contains: sec } },
        { category: { in: getAllCategoriesForSector(sec) } },
      ]
    }
  } else if (role === 'ADMIN') {
    // Admin: sees everything, optional citizenId filter
    if (citizenId) where.citizenId = citizenId
  }

  if (status && status !== 'ALL') where.status = status
  if (category && category !== 'ALL') where.category = category
  if (isEmergencyOnly) where.isEmergency = true

  const problems = await prisma.problem.findMany({
    where,
    include: {
      citizen: { select: { name: true, email: true } },
      verification: { select: { status: true, recommendedDept: true, govOfficer: { select: { name: true } } } },
      project: { select: { id: true, status: true, title: true } },
      communityConfirmations: session.user?.id
        ? { where: { citizenId: session.user.id }, select: { id: true } }
        : false,
      _count: { select: { evidence: true, communityConfirmations: true } },
    },
    orderBy: [
      { isEmergency: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Format with hasConfirmed helper
  const formatted = problems.map((p) => ({
    ...p,
    hasConfirmed: Array.isArray(p.communityConfirmations) && p.communityConfirmations.length > 0,
    confirmationCount: p._count?.communityConfirmations || 0,
  }))

  return Response.json(formatted)
}

// Helper: map discipline keywords to relevant problem categories
function getAllCategoriesForDiscipline(discipline: string): string[] {
  const d = discipline.toLowerCase()
  if (d.includes('civil') || d.includes('structural')) return ['INFRASTRUCTURE', 'ROAD_TRANSPORT', 'DRAINAGE_FLOODING']
  if (d.includes('computer') || d.includes('software') || d.includes('it') || d.includes('digital')) return ['DIGITAL_SERVICES', 'INFRASTRUCTURE']
  if (d.includes('environment') || d.includes('ecology')) return ['ENVIRONMENT', 'DRAINAGE_FLOODING', 'WATER_SUPPLY']
  if (d.includes('mechanical')) return ['INFRASTRUCTURE', 'ROAD_TRANSPORT']
  if (d.includes('electrical') || d.includes('electronic')) return ['ELECTRICITY', 'INFRASTRUCTURE']
  if (d.includes('medical') || d.includes('health') || d.includes('biomedical')) return ['HEALTHCARE']
  if (d.includes('agriculture') || d.includes('agri')) return ['AGRICULTURE', 'WATER_SUPPLY']
  if (d.includes('architecture') || d.includes('urban')) return ['INFRASTRUCTURE', 'SANITATION']
  if (d.includes('water') || d.includes('hydro')) return ['WATER_SUPPLY', 'DRAINAGE_FLOODING']
  // Default: return a broad set
  return ['INFRASTRUCTURE', 'SANITATION', 'WATER_SUPPLY', 'ROAD_TRANSPORT', 'ELECTRICITY', 'ENVIRONMENT']
}

// Helper: map industry sector keywords to relevant problem categories
function getAllCategoriesForSector(sector: string): string[] {
  const s = sector.toLowerCase()
  if (s.includes('tech') || s.includes('software') || s.includes('it')) return ['DIGITAL_SERVICES', 'INFRASTRUCTURE']
  if (s.includes('construct') || s.includes('infrastructure')) return ['INFRASTRUCTURE', 'ROAD_TRANSPORT', 'DRAINAGE_FLOODING']
  if (s.includes('health') || s.includes('pharma')) return ['HEALTHCARE']
  if (s.includes('agri') || s.includes('farm')) return ['AGRICULTURE', 'WATER_SUPPLY']
  if (s.includes('energy') || s.includes('power') || s.includes('electric')) return ['ELECTRICITY', 'ENVIRONMENT']
  if (s.includes('water') || s.includes('sanit')) return ['WATER_SUPPLY', 'SANITATION', 'DRAINAGE_FLOODING']
  if (s.includes('transport') || s.includes('logistic')) return ['ROAD_TRANSPORT', 'INFRASTRUCTURE']
  if (s.includes('environment') || s.includes('green')) return ['ENVIRONMENT', 'DRAINAGE_FLOODING']
  // Default: all collaboration-ready
  return ['INFRASTRUCTURE', 'SANITATION', 'WATER_SUPPLY', 'ROAD_TRANSPORT', 'ELECTRICITY', 'ENVIRONMENT', 'HEALTHCARE']
}



export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CITIZEN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      title,
      description,
      category,
      location,
      municipality,
      panchayat,
      district,
      state,
      affectedPopulation,
      evidence,
      latitude,
      longitude,
      isEmergency,
      emergencyReason,
    } = body

    if (!title || !description || !category || !location) {
      return Response.json({ error: 'Title, description, category, and location are required' }, { status: 400 })
    }

    // ─── EMERGENCY VERIFICATION GATEKEEPING ────────────────────────────────
    let verifiedEmergency = false
    let emergencyNote = ''

    if (isEmergency === true || isEmergency === 'true') {
      const emergencyResult = await verifyEmergencyReport(
        title.trim(),
        description.trim(),
        location.trim(),
        emergencyReason ? String(emergencyReason).trim() : undefined
      )

      if (!emergencyResult.isEmergency) {
        // Strict denial of non-emergency claims
        return Response.json(
          {
            error: 'Emergency Submission Denied: This report does not meet acute life-safety emergency criteria.',
            emergencyDenied: true,
            aiReason: emergencyResult.reason,
            suggestedCategory: emergencyResult.suggestedCategory || category,
          },
          { status: 422 }
        )
      }

      verifiedEmergency = true
      emergencyNote = emergencyResult.reason
    }

    // ─── AUTO AI ANALYSIS ──────────────────────────────────────────────────
    let aiResult: any = null
    try {
      aiResult = await classifyProblem(
        title.trim(),
        description.trim(),
        location.trim(),
        affectedPopulation,
        verifiedEmergency ? 'CRITICAL EMERGENCY: ' + (emergencyReason || '') : undefined
      )
    } catch (e) {
      console.warn('Auto AI analysis failed (falling back to user classification):', e)
    }

    // Default state to 'General' if empty so Prisma non-nullable field succeeds
    const resolvedState = (state && String(state).trim()) ? String(state).trim() : (district && String(district).trim() ? String(district).trim() : 'General')

    // Generate unique reference ID
    const count = await prisma.problem.count()
    const referenceId = `PRB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}-${Date.now().toString().slice(-4)}`

    const parsedLat = latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(String(latitude)) : null
    const parsedLng = longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(String(longitude)) : null
    const parsedPop = affectedPopulation !== undefined && affectedPopulation !== null && affectedPopulation !== '' ? parseInt(String(affectedPopulation)) : null

    // Determine final fields with AI enrichment
    const finalCategory = (aiResult?.category && aiResult.category !== 'OTHER') ? aiResult.category : category
    const finalSeverity = verifiedEmergency
      ? 'CRITICAL'
      : (aiResult?.severity || 'MEDIUM')

    const aiSuggestionsString = aiResult?.actionableSteps
      ? JSON.stringify(aiResult.actionableSteps)
      : (aiResult?.summary ? JSON.stringify([aiResult.summary]) : null)

    const problem = await prisma.problem.create({
      data: {
        referenceId,
        citizenId: session.user.id,
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        location: location.trim(),
        municipality: municipality ? String(municipality).trim() : null,
        panchayat: panchayat ? String(panchayat).trim() : null,
        district: district ? String(district).trim() : null,
        state: resolvedState,
        latitude: !isNaN(parsedLat as number) ? parsedLat : null,
        longitude: !isNaN(parsedLng as number) ? parsedLng : null,
        affectedPopulation: !isNaN(parsedPop as number) ? parsedPop : null,
        status: 'SUBMITTED',
        isEmergency: verifiedEmergency,
        emergencyReason: verifiedEmergency ? (emergencyReason || emergencyNote || 'AI-verified acute emergency') : null,
        aiCategory: aiResult?.category || finalCategory,
        aiSeverity: finalSeverity,
        aiRecommendedDepts: aiResult?.recommendedUniversityDisciplines ? JSON.stringify(aiResult.recommendedUniversityDisciplines) : null,
        aiSuggestions: aiSuggestionsString,
        evidence: Array.isArray(evidence) && evidence.length > 0 ? {
          create: evidence.map((e: any) => ({
            fileUrl: e.url || e.fileUrl || '',
            fileName: e.fileName || e.name || 'evidence',
            fileType: e.fileType || e.type || 'image/jpeg',
          }))
        } : undefined,
      },
      include: {
        evidence: true,
      }
    })

    // Notify government (non-blocking)
    try {
      if (verifiedEmergency) {
        await notifyRole(
          'GOVERNMENT',
          '🚨 CRITICAL EMERGENCY CIVIC INCIDENT',
          `URGENT ACTION REQUIRED: "${title}" in ${location}. AI-verified acute emergency. Priority response dispatched!`,
          'ALERT',
          `/problems/${problem.id}`
        )
      } else {
        await notifyRole(
          'GOVERNMENT',
          'New Civic Problem Submitted',
          `A citizen has reported: "${title}" in ${location}. Requires verification.`,
          'ACTION',
          `/problems/${problem.id}`
        )
      }
    } catch (e) {
      console.error('Notification failed (non-fatal):', e)
    }

    // Audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          problemId: problem.id,
          userId: session.user.id,
          action: verifiedEmergency ? '🚨 Critical Emergency Submitted & AI-Verified' : 'Problem Submitted',
          newStatus: 'SUBMITTED',
          remarks: verifiedEmergency
            ? `Emergency report verified by AI. Rationale: ${emergencyNote || emergencyReason || 'Life safety'}`
            : (aiResult ? `Auto AI classified as ${aiResult.category} (${aiResult.severity}).` : 'Submitted with manual classification.'),
        },
      })
    } catch (e) {
      console.error('Audit log failed (non-fatal):', e)
    }

    return Response.json(
      {
        ...problem,
        aiAnalysis: aiResult
          ? {
              success: true,
              category: finalCategory,
              severity: finalSeverity,
              summary: aiResult.summary,
              department: aiResult.department,
              actionableSteps: aiResult.actionableSteps || [],
              recommendedDepartments: aiResult.recommendedDepartments || [],
            }
          : {
              success: false,
              fallback: true,
              message: 'Auto-AI analysis was temporarily unavailable; manual classification was saved.',
            },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating problem:', error)
    return Response.json({ error: error.message || 'Failed to create problem' }, { status: 500 })
  }
}
