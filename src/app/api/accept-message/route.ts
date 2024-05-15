import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth/[...nextauth]/options';

export async function POST(Request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      {status: 401}
    );
  }

  const userId = user._id;
  const {isAcceptingMessages} = await Request.json();

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {isAcceptingMessages},
      {new: true}
    );

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {status: 401}
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Messages status updated successfully',
        user,
      },
      {status: 200}
    );
  } catch (error) {
    console.error('fail to update messages status', error);
    return Response.json(
      {
        success: false,
        message: 'fail to update messages status',
      },
      {status: 500}
    );
  }
}

export async function GET(Request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      {status: 401}
    );
  }

  const userId = user._id;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {status: 401}
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: user.isAcceptingMessages,
        message: 'User found',
        user,
      },
      {status: 200}
    );
  } catch (error) {
    console.error('fail to get user', error);
    return Response.json(
      {
        success: false,
        message: 'fail to get user',
      },
      {status: 500}
    );
  }
}
