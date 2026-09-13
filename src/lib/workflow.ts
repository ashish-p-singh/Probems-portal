import { prisma } from '@/lib/prisma'

export type WorkflowStage = {
  key: string
  label: string
  description: string
  role: string
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { key: 'SUBMITTED', label: 'Problem Submitted', description: 'Citizen has raised the problem', role: 'CITIZEN' },
  { key: 'UNDER_VERIFICATION', label: 'Government Verification', description: 'Government is verifying the problem', role: 'GOVERNMENT' },
  { key: 'VERIFIED', label: 'Verified', description: 'Government has verified the problem', role: 'GOVERNMENT' },
  { key: 'UNDER_UNIVERSITY_REVIEW', label: 'University Review', description: 'University is reviewing the problem', role: 'UNIVERSITY' },
  { key: 'ACCEPTED', label: 'University Accepted', description: 'University has accepted the problem', role: 'UNIVERSITY' },
  { key: 'TEAM_FORMATION', label: 'Team Formation', description: 'University team is being formed', role: 'UNIVERSITY' },
  { key: 'SOLUTION_DEVELOPMENT', label: 'Solution Development', description: 'Team is developing the solution', role: 'FACULTY' },
  { key: 'SOLUTION_SUBMITTED', label: 'Solution Submitted', description: 'Solution submitted to government', role: 'FACULTY' },
  { key: 'GOVERNMENT_VALIDATION', label: 'Government Validation', description: 'Government is validating the solution', role: 'GOVERNMENT' },
  { key: 'APPROVED', label: 'Solution Approved', description: 'Government has approved the solution', role: 'GOVERNMENT' },
  { key: 'INDUSTRY_COLLABORATION', label: 'Industry Collaboration', description: 'Industry partners are collaborating', role: 'INDUSTRY' },
  { key: 'IMPLEMENTATION', label: 'Implementation', description: 'Solution is being implemented', role: 'INDUSTRY' },
  { key: 'PROBLEM_SOLVED', label: 'Problem Solved', description: 'Solution has been deployed', role: 'GOVERNMENT' },
  { key: 'IMPACT_MEASUREMENT', label: 'Impact Measurement', description: 'Measuring real-world impact', role: 'UNIVERSITY' },
  { key: 'SUSTAINABLE_IMPACT', label: 'Sustainable Impact', description: 'Sustained positive impact achieved', role: 'GOVERNMENT' },
]

export function getStageIndex(status: string): number {
  return WORKFLOW_STAGES.findIndex((s) => s.key === status)
}

export async function createAuditLog({
  problemId,
  projectId,
  userId,
  action,
  previousStatus,
  newStatus,
  remarks,
}: {
  problemId?: string
  projectId?: string
  userId: string
  action: string
  previousStatus?: string
  newStatus?: string
  remarks?: string
}) {
  return prisma.auditLog.create({
    data: {
      problemId,
      projectId,
      userId,
      action,
      previousStatus,
      newStatus,
      remarks,
    },
  })
}

export async function transitionProblemStatus(
  problemId: string,
  newStatus: string,
  userId: string,
  action: string,
  remarks?: string
) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } })
  if (!problem) throw new Error('Problem not found')

  const updated = await prisma.problem.update({
    where: { id: problemId },
    data: { status: newStatus as any },
  })

  await createAuditLog({
    problemId,
    userId,
    action,
    previousStatus: problem.status,
    newStatus,
    remarks,
  })

  return updated
}
