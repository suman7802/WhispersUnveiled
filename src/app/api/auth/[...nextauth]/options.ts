import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import {NextAuthOptions as nextAuthOption} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: nextAuthOption = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: {label: 'Email', type: 'text'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          const user = await UserModel.findOne({
            $or: [{email: credentials.identifier}, {username: credentials.identifier}],
          });

          if (!user) throw new Error('No user found');
          if (!user.isVerified) throw new Error('Please verify your account');

          const validPassword = await bcrypt.compare(credentials.password, user.password);

          if (!validPassword) throw new Error('Invalid password');

          return user;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.username = user?.username;
        token._id = user._id?.toString();
        token.isVerified = user?.isVerified;
        token.isAcceptingMessages = user?.isAcceptingMessages;
      }
      return token;
    },

    async session({session, token}) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },
  pages: {signIn: '/sign-in'},
  session: {strategy: 'jwt'},
  secret: process.env.JWT_SECRET,
};
