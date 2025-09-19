import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/db/prisma";
import { PERMISSION_GROUPS } from "@/constants/permissions";
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và password là bắt buộc");
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              employee: {
                include: { job: true },
              },
            },
          });

          if (!user) {
            throw new Error("Email hoặc password không đúng");
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Email hoặc password không đúng");
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            employee: user.employee,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log(
      //   "=== JWT CALLBACK ===",
      //   JSON.stringify({ token, user }, null, 2)
      // );
      const positionId = user?.employee?.positionId || null;
      if (positionId) {
        const userPosition = await prisma.positions.findUnique({
          where: { id: positionId },
        });
        token.position = userPosition;
        if (userPosition) {
          const permissions =
            PERMISSION_GROUPS[
              userPosition.roleName as keyof typeof PERMISSION_GROUPS
            ] || [];
          token.permissions = Array.from(permissions);
        }
      }
      // Persist user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.employee = user.employee;
      }
      console.log("JWT callback - token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log(
        "=== SESSION CALLBACK ===",
        JSON.stringify({ session, token }, null, 2)
      );
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.employee = token.employee;
        session.user.permissions = token.permissions || [];
        session.user.position = token.position || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret:
    process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "your-secret-key",
};
