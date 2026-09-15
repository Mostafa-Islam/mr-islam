import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { normalizePhone } from "./phone";

const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("AUTH: invalid input shape");
          return null;
        }

        // Students type 01224457318 or +201224457318 — same number,
        // different strings. Normalise so lookup always matches.
        const phone = normalizePhone(parsed.data.phone);

        const user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
          console.log("AUTH: no user found for", phone);
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) {
          console.log("AUTH: wrong password for", user.phone);
          return null;
        }

        if (user.status !== "ACTIVE") {
          console.log("AUTH: status is", user.status);
          return null;
        }

        console.log("AUTH: success —", user.name, user.role);

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id ?? "";
      session.user.role = token.role;
      session.user.status = token.status;
      return session;
    },
  },
});