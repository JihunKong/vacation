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
          name: user.name || user.email.split('@')[0],
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
            // 데이터베이스의 최신 role 정보로 세션 업데이트
            session.user.role = user.role
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
    async signIn({ user, account, profile }) {
      // Allow all sign-ins to proceed
      // User creation/linking will be handled in jwt callback
      console.log("SignIn attempt:", { 
        provider: account?.provider, 
        email: user?.email,
        profile: profile
      })
      
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { studentProfile: true }
          })
          
          // Create user if doesn't exist
          if (!dbUser) {
            console.log("Creating new user for:", user.email)
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
            console.log("User created successfully:", dbUser.id)
          } else if (!dbUser.studentProfile) {
            // Create profile if missing
            console.log("Creating profile for existing user:", dbUser.id)
            await prisma.studentProfile.create({
              data: { userId: dbUser.id }
            })
          }
          
          // Explicitly return true for successful Google sign-in
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          // Return string error message for better debugging
          return `/auth/error?error=DatabaseError`
        }
      }
      
      // Allow credentials sign-in
      return true
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}