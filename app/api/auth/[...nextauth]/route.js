import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Please provide email and password');
        }

        await dbConnect();

        // Seed default citizen user for demonstration if none exist
        const citizenCount = await User.countDocuments({ role: 'citizen' });
        if (citizenCount === 0) {
          const hashedPass = await bcrypt.hash('Citizen@WardConnect2026', 10);
          await User.create({
            name: 'Faheem A V',
            email: 'citizen@wardconnect.gov',
            password: hashedPass,
            phone: '5550192834',
            role: 'citizen',
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            createdAt: new Date(),
          });
        }

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error('No account found with this email.');
        }

        if (user.role !== 'citizen') {
          throw new Error('This login is for citizens only.');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('Incorrect password. Please try again.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || '',
          role: user.role,
          phone: user.phone || '',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'citizen';
        token.id = user.id;
        token.phone = user.phone || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.phone = token.phone || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'wardconnect_nextauth_secret_2026',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
