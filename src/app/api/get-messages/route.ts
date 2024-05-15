import mongoose from "mongoose";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 },
      );
    }

    console.log("user", user); // TODO: remove

    return Response.json(
      {
        success: true,
        messages: user[0].messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("fail to get messages", error);
    return Response.json(
      {
        success: false,
        message: "fail to get messages",
      },
      { status: 500 },
    );
  }
}
