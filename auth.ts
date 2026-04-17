import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { authConfig } from "@/auth.config";
import { clientPromise, connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Full auth instance — used by API routes, Server Components, and proxy.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await connectDB();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name ?? "",
            image: user.image ?? "",
            provider: "google",
            lastLogin: new Date(),
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
