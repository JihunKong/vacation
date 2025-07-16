import NextAuth from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      hasProfile: boolean
    } & DefaultSession["user"]
  }
}