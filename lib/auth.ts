import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "gwe.go.kr", // 완도고등학교 도메인으로 제한
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile?.email?.endsWith("@gwe.go.kr") ?? false
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { studentProfile: true }
        })
        
        if (user) {
          session.user.id = user.id
          session.user.role = user.role
          session.user.hasProfile = !!user.studentProfile
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}