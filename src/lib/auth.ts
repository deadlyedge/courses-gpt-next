import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"

import { prisma } from "@/lib/db"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      credits: number
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    credits: number
  }
}

export const authOptions = {
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      const db_user = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      })
      if (db_user) {
        token.id = db_user.id
        token.credits = db_user.credits
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id
        // session.user.name = token.name
        // session.user.email = token.email
        // session.user.image = token.picture
        session.user.credits = token.credits
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: PrismaAdapter(prisma),
  providers: [
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
} satisfies NextAuthOptions

export const getAuthSession = () => {
  return getServerSession(authOptions)
}
