import { env } from '$env/dynamic/private';
import { Constants } from '$lib/constants';

interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static webhookUrl = env.EMAIL_WEBHOOK;
  private static fromEmail = Constants.SUPPORTEMAIL as string;
  private static brandName = Constants.BRANDNAME as string;
  private static brandWebsite = Constants.BRANDWEBSITE as string;
  private static themeColor = '#db2777'; // pink-600

  private static async send(payload: EmailPayload): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('[Email Service] EMAIL_WEBHOOK not set. Logging email content instead:');
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    console.log(`[Email Service] Attempting to send email to: ${payload.to}`);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      console.log(`[Email Service] Email sent successfully to: ${payload.to}`);
    } catch (error) {
      console.error('[Email Service] Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send Magic Link Email
   */
  static async sendMagicLink(to: string, url: string): Promise<void> {
    const subject = `Your magic sign-in link for ${this.brandName}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 40px 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
             <h1 style="color: ${this.themeColor}; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">${this.brandName}</h1>
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700;">Secure Sign In</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Click the button below to sign in to your ${this.brandName} account. This link is valid for a limited time.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${url}" style="background-color: ${this.themeColor}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.2);">Sign In to edniesal</a>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">If you didn't request this email, you can safely ignore it.</p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordReset(to: string, url: string): Promise<void> {
    const subject = `Reset your password - ${this.brandName}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 40px 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
             <h1 style="color: ${this.themeColor}; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">${this.brandName}</h1>
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We received a request to reset your password. Click the button below to choose a new secure password.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${url}" style="background-color: ${this.themeColor}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.2);">Reset My Password</a>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">If you didn't request this, your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Welcome Email
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = `Welcome to ${this.brandName}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 40px 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
             <h1 style="color: ${this.themeColor}; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">${this.brandName}</h1>
        </div>
        <h2 style="color: #111827; font-size: 22px; font-weight: 700;">Welcome, ${name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We're excited to have you join ${this.brandName}. Your account has been successfully created.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">You can now access exclusive content, join our events, and more directly from your dashboard.</p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${this.brandWebsite}/dashboard" style="background-color: ${this.themeColor}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.2);">Go to Dashboard</a>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">If you have any questions, feel free to reply to this email.</p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Payment Confirmation
   */
  static async sendPaymentConfirmation(to: string, details: {
    name: string;
    eventTitle: string;
    amount: number;
    paymentRef: string;
    date: string;
  }): Promise<void> {
    const subject = `Registration Confirmed: ${details.eventTitle}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 40px 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
             <h1 style="color: ${this.themeColor}; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">${this.brandName}</h1>
        </div>
        <h2 style="color: #111827; font-size: 22px; font-weight: 700;">Registration Confirmed</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${details.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your payment for <strong>${details.eventTitle}</strong> has been successfully processed.</p>
        
        <div style="background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 16px; padding: 24px; margin: 32px 0;">
          <h3 style="margin: 0 0 16px 0; color: #be185d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Transaction Details</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <p style="margin: 0; font-size: 14px;"><span style="color: #9ca3af;">Amount:</span> <strong style="color: #111827;">$${details.amount}</strong></p>
            <p style="margin: 0; font-size: 14px;"><span style="color: #9ca3af;">Reference:</span> <span style="font-family: monospace; font-weight: 600;">${details.paymentRef}</span></p>
            <p style="margin: 0; font-size: 14px;"><span style="color: #9ca3af;">Date:</span> <strong style="color: #111827;">${details.date}</strong></p>
          </div>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We look forward to seeing you at the event. Please keep this email for your records.</p>
        
        <div style="margin: 32px 0; text-align: center;">
          <a href="${this.brandWebsite}/ladies-in-tech" style="background-color: ${this.themeColor}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">View Event Details</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    // Send to recipient
    await this.send({ from: this.fromEmail, to, subject, html });

    // Send internal notification to support
    await this.send({
      from: this.fromEmail,
      to: this.fromEmail,
      subject: `[Internal] Payment Confirmed: ${details.name} - ${details.eventTitle}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 20px;">
          <h2 style="color: #db2777;">New Event Registration</h2>
          <p>A new registration has been completed successfully.</p>
          <ul>
            <li><strong>Customer:</strong> ${details.name} (${to})</li>
            <li><strong>Event:</strong> ${details.eventTitle}</li>
            <li><strong>Amount:</strong> $${details.amount}</li>
            <li><strong>Ref:</strong> ${details.paymentRef}</li>
          </ul>
          <hr/>
          ${html}
        </div>
      `
    });
  }

  /**
   * General Transactional Email
   */
  static async sendTransactional(to: string, subject: string, description: string, ctaText?: string, ctaLink?: string): Promise<void> {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 40px 20px;">
        <div style="margin-bottom: 32px; text-align: center;">
             <h1 style="color: ${this.themeColor}; font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: -0.025em;">${this.brandName}</h1>
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">${description}</p>
        ${ctaText && ctaLink ? `
        <div style="margin: 32px 0; text-align: center;">
          <a href="${ctaLink}" style="background-color: ${this.themeColor}; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">${ctaText}</a>
        </div>` : ''}
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }
}
