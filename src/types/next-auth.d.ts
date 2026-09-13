import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      accountStatus?: string
      // Government
      department?: string
      jurisdiction?: string
      authority?: string
      designation?: string
      // University / Faculty
      university?: string
      discipline?: string
      expertise?: string
      // Industry
      sector?: string
      industryType?: string
      company?: string
      image?: string | null
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    accountStatus?: string
    department?: string
    jurisdiction?: string
    authority?: string
    designation?: string
    university?: string
    discipline?: string
    expertise?: string
    sector?: string
    industryType?: string
    company?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    accountStatus?: string
    department?: string
    jurisdiction?: string
    authority?: string
    designation?: string
    university?: string
    discipline?: string
    expertise?: string
    sector?: string
    industryType?: string
    company?: string
  }
}

