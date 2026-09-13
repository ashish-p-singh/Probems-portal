import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            government: true,
            university: true,
            faculty: true,
            industry: true,
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus || 'APPROVED',
          // Government
          department: user.government?.department || user.university?.department || user.faculty?.department || undefined,
          jurisdiction: user.government?.jurisdiction || undefined,
          authority: user.government?.authority || undefined,
          designation: user.government?.designation || user.university?.designation || user.faculty?.designation || undefined,
          // University / Faculty
          university: user.university?.university || user.faculty?.university || undefined,
          discipline: user.university?.department || user.faculty?.department || undefined,
          expertise: user.faculty?.expertise || undefined,
          // Industry
          sector: user.industry?.sector || undefined,
          company: user.industry?.company || undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.accountStatus = (user as any).accountStatus
        token.department = (user as any).department
        token.jurisdiction = (user as any).jurisdiction
        token.authority = (user as any).authority
        token.designation = (user as any).designation
        token.university = (user as any).university
        token.discipline = (user as any).discipline
        token.expertise = (user as any).expertise
        token.sector = (user as any).sector
        token.company = (user as any).company
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.accountStatus = token.accountStatus as string
        session.user.department = token.department as string
        session.user.jurisdiction = token.jurisdiction as string | undefined
        session.user.authority = token.authority as string | undefined
        session.user.designation = token.designation as string | undefined
        session.user.university = token.university as string | undefined
        session.user.discipline = token.discipline as string | undefined
        session.user.expertise = token.expertise as string | undefined
        session.user.sector = token.sector as string | undefined
        session.user.company = token.company as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

