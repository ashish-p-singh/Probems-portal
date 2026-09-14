import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // If user account is not approved, send back to login
  if (session.user.accountStatus && session.user.accountStatus !== 'APPROVED') {
    redirect('/login')
  }

  const role = session.user.role

  switch (role) {
    case 'CITIZEN':
      redirect('/citizen/dashboard')
    case 'GOVERNMENT':
      redirect('/government/dashboard')
    case 'UNIVERSITY':
      redirect('/university/dashboard')
    case 'FACULTY':
      redirect('/faculty/dashboard')
    case 'INDUSTRY':
      redirect('/industry/dashboard')
    case 'ADMIN':
      redirect('/admin/approvals')
    default:
      redirect('/login')
  }
}
