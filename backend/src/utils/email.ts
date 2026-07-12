import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  public static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In production, configure nodemailer or a service like SendGrid/Mailgun.
      // For this implementation, we will log it.
      logger.info(`📧 Email Sent Successfully to ${options.to}`);
      logger.debug(`Subject: ${options.subject}`);
      logger.debug(`Body: ${options.text}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      return false;
    }
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request — AssetFlow ERP',
      text: `Hello,\n\nYou requested a password reset. Please click on the link to reset your password: ${resetLink}\n\nThis link is valid for 1 hour.`,
      html: `<p>Hello,</p><p>You requested a password reset. Please click on the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link is valid for 1 hour.</p>`,
    });
  }

  public static async sendAssetAllocationEmail(
    email: string,
    employeeName: string,
    assetName: string,
    assetCode: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Asset Allocation Notification — AssetFlow ERP',
      text: `Hello ${employeeName},\n\nYou have been allocated a new asset:\n- Name: ${assetName}\n- Code: ${assetCode}\n\nPlease verify its condition in the app.`,
    });
  }
}

export default EmailService;
