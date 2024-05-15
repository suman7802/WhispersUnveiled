import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  const { messageId } = params;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  try {
    const deletedMessage = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (deletedMessage.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: 'Message not found',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Message deleted',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('fail to delete messages', error);
    return Response.json(
      {
        success: false,
        message: 'fail to delete messages',
      },
      { status: 500 }
    );
  }
}
