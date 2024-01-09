import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log(`!!oauth signin user==>${user.email}~~~~~~~~`);
      console.log(`!!oauth signin user==>${user.name}~~~~~~~~`);
      console.log(`!!oauth signin user==>${user.image}~~~~~~~~`);

      return true;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log(`!!oauth refresh~~~~~~~~`);
      return token;
    },
  },
  secret: process.env.JWT_SECRET,
});
