import resend from '@/lib/resend';
import ApiResponse from '@/types/apiResponse';
import VerificationEmail from '../../emails/VerificationEmail';

export default async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      react: VerificationEmail({username, otp: verifyCode}),
    });
    return {
      message: 'Verification email sent',
      success: true,
    };
  } catch (error) {
    console.error('Error sending verification email: ', error);
    return {
      message: 'Error sending verification email',
      success: false,
    };
  }
}
