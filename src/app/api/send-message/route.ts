import dbConnect from '@/lib/dbConnect';
import UserModel, {MessageModel} from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();

  const {username, message} = await request.json();
  try {
    const user = await UserModel.findOne({username});
    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {status: 404}
      );
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: 'User is not accepting messages',
        },
        {status: 400}
      );
    }

    const newMessage = new MessageModel({
      message,
      cratedAt: new Date(),
    });

    user.messages.push(newMessage);
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Message sent',
      },
      {status: 200}
    );
  } catch (error) {
    console.error('fail to send message', error);
    return Response.json(
      {
        success: false,
        message: 'fail to send message',
      },
      {status: 500}
    );
  }
}
