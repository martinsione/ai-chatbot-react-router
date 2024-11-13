import { compare } from 'bcrypt-ts';
import { User, Session } from '@auth/core/types';
import Credentials from '@auth/core/providers/credentials';
import { RemixAuth } from '@/app/(auth)/remix-auth';

import { getUser } from '@/db/queries';

interface ExtendedSession extends Session {
  user: User;
}

export const { handlers, auth, signIn, signOut } = RemixAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        let users = await getUser(email);
        if (users.length === 0) return null;
        let passwordsMatch = await compare(password, users[0].password!);
        if (passwordsMatch) return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
