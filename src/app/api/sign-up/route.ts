import bcryptjs from "bcryptjs";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const verifiedUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (verifiedUserName) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 },
      );
    }

    const existingUser = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUser) {
      if (existingUser.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 },
        );
      } else {
        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await existingUser.save();

        return Response.json(
          {
            success: true,
            message:
              "Verification code sent to your email. Please verify your account first",
          },
          { status: 200 },
        );
      }
    } else {
      const newUser = new UserModel({
        email,
        username,
        verifyCode,
        password: await bcryptjs.hash(password, 10),
        verifyCodeExpiry: new Date(Date.now() + 60 * 60 * 1000),
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error register user", error);
    return Response.json(
      {
        success: false,
        message: "Error register user",
      },
      { status: 500 },
    );
  }
}
