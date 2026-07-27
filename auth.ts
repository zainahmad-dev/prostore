import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import { cookies } from 'next/headers';
import { compareSync } from 'bcrypt-ts-edge';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET!,
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database. Emails are stored lower-cased, so normalise the
        // input to keep sign-in case-insensitive.
        const user = await prisma.user.findFirst({
          where: {
            email: (credentials.email as string)?.toLowerCase(),
          },
        });

        // Check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Set the user ID from the token. With the JWT strategy the token is the
      // only source of truth here - the `user` argument is undefined, so it must
      // not be read (doing so threw on every profile update).
      (session.user as unknown as { id?: string }).id = token.sub as string;
      (session.user as unknown as { role?: string }).role = token.role as string;
      (session.user as unknown as { name?: string }).name = token.name as string;
      if (token.email) {
        (session.user as unknown as { email?: string }).email =
          token.email as string;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token
      if (user) {
        (token as unknown as Record<string, unknown>).id = (user as unknown as { id: string }).id;
        (token as unknown as Record<string, unknown>).role = (user as unknown as { role?: string }).role as string | undefined;

        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // Update database to reflect the token name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        (token as unknown as Record<string, unknown>).name = session.user.name;
      }
      if (session?.user?.email && trigger === 'update') {
        (token as unknown as Record<string, unknown>).email =
          session.user.email;
      }

      return token;
    },
  },
});