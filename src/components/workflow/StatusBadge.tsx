const statusConfig: Record<string, { label: string; className: string }> = {
  // Problem statuses
  SUBMITTED: { label: 'Submitted', className: 'badge-submitted' },
  UNDER_VERIFICATION: { label: 'Under Verification', className: 'badge-pending' },
  ADDITIONAL_INFO_REQUIRED: { label: 'Info Required', className: 'badge-pending' },
  VERIFIED: { label: 'Verified', className: 'badge-verified' },
  REJECTED_BY_GOVT: { label: 'Rejected', className: 'badge-rejected' },
  UNDER_UNIVERSITY_REVIEW: { label: 'University Review', className: 'badge-info' },
  REJECTED_BY_UNIVERSITY: { label: 'Rejected', className: 'badge-rejected' },
  ACCEPTED: { label: 'Accepted', className: 'badge-verified' },
  TEAM_FORMATION: { label: 'Team Formation', className: 'badge-info' },
  SOLUTION_DEVELOPMENT: { label: 'In Development', className: 'badge-progress' },
  SOLUTION_SUBMITTED: { label: 'Solution Submitted', className: 'badge-info' },
  GOVERNMENT_VALIDATION: { label: 'Govt Validation', className: 'badge-pending' },
  APPROVED: { label: 'Approved', className: 'badge-verified' },
  INDUSTRY_COLLABORATION: { label: 'Industry Collab', className: 'badge-progress' },
  IMPLEMENTATION: { label: 'Implementation', className: 'badge-progress' },
  PROBLEM_SOLVED: { label: 'Problem Solved', className: 'badge-verified' },
  IMPACT_MEASUREMENT: { label: 'Impact Measurement', className: 'badge-info' },
  SUSTAINABLE_IMPACT: { label: 'Sustainable Impact', className: 'badge-verified' },
  // Task statuses
  TODO: { label: 'To Do', className: 'badge-submitted' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-progress' },
  REVIEW: { label: 'Review', className: 'badge-pending' },
  COMPLETED: { label: 'Completed', className: 'badge-verified' },
  // Generic
  PENDING: { label: 'Pending', className: 'badge-pending' },
  ACTIVE: { label: 'Active', className: 'badge-progress' },
  DRAFT: { label: 'Draft', className: 'badge-submitted' },
  INTERESTED: { label: 'Interested', className: 'badge-info' },
  CONFIRMED: { label: 'Confirmed', className: 'badge-verified' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
  CHANGES_REQUESTED: { label: 'Changes Requested', className: 'badge-pending' },
  GOVERNMENT_APPROVED: { label: 'Gov. Approved', className: 'badge-verified' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'badge-submitted' }
  return <span className={config.className}>{config.label}</span>
}
