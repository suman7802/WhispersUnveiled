import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import SendOTP from '@/helpers/SendOTP';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const validCode = user.verifyCode === code;
    const codeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (validCode && codeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!codeNotExpired) {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verifyCode = verifyCode;
      user.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const emailResponse = await SendOTP(user.email, username, verifyCode);

      if (emailResponse.accepted.includes(user.email)) {
        return Response.json(
          { success: false, message: 'Some thing went wrong please try later' },
          { status: 500 }
        );
      }

      return Response.json(
        {
          success: true,
          message: 'Verification code expired. New code sent to email',
        },
        { status: 200 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: 'Incorrect verification code',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json({ success: false, message: 'Error verifying user' }, { status: 500 });
  }
}
