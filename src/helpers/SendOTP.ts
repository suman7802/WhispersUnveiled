import { google } from 'googleapis';
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const { USER_EMAIL, CLIENT_ID, REFRESH_TOKEN, CLIENT_SECRET } = process.env;

const { OAuth2 } = google.auth;

const createTransporter = async (): Promise<Transporter> => {
  const oauth2Client: OAuth2Client = new OAuth2(
    CLIENT_ID!,
    CLIENT_SECRET!,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  const { token, res } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    // @ts-ignore
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: USER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: token,
      expires: res ? res.data.expires_in : undefined,
    },
  });
};

const SendOTP = (email: string, username: string, verifyCode: string): Promise<SentMessageInfo> => {
  const emailConfig = {
    from: USER_EMAIL,
    subject: 'OTP Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #f60;">OTP Verification</h2>
        <p>Hello ${username},</p>
        <p>Your OTP is:</p>
        <p style="font-size: 24px; color: #f60;">${verifyCode}</p>
        <p>Expiring in 1 Hour...</p>
      </div>
    `,
    to: email,
  };

  return new Promise<SentMessageInfo>(async (resolve, reject) => {
    return await createTransporter().then((transporter) => {
      transporter.sendMail(emailConfig, (err, info) => {
        if (err) return reject(err);
        return resolve(info);
      });
    });
  });
};

export default SendOTP;
