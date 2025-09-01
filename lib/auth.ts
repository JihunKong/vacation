import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // Remove adapter when using JWT strategy - causes issues with OAuth
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // First time JWT creation (sign in)
        if (account.provider === "google") {
          // For Google OAuth, find user by email
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.email = dbUser.email
          }
        } else {
          // For credentials provider
          token.id = user.id
          token.role = (user as any).role || "STUDENT"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        if (token.id) {
          session.user.id = token.id as string
          session.user.role = token.role as string
          
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { studentProfile: true }
          })
          
          if (user) {
            session.user.hasProfile = !!user.studentProfile
            // Ensure profile exists for Google OAuth users
            if (!user.studentProfile && user.email) {
              await prisma.studentProfile.create({
                data: { userId: user.id }
              })
              session.user.hasProfile = true
            }
          }
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { studentProfile: true }
          })
          
          // Create user if doesn't exist
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                role: "STUDENT",
                studentProfile: {
                  create: {}
                }
              },
              include: { studentProfile: true }
            })
          } else if (!dbUser.studentProfile) {
            // Create profile if missing
            await prisma.studentProfile.create({
              data: { userId: dbUser.id }
            })
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}