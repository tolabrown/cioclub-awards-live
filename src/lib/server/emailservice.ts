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
  private static fromEmail = Constants.SUPPORTEMAIL;
  private static brandName = Constants.BRANDNAME;

  private static async send(payload: EmailPayload): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('[Email Service] EMAIL_WEBHOOK not set. Logging email content instead:');
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    console.log(`[Email Service] Attempting to send email to: ${payload.to} via webhook: ${this.webhookUrl}`);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`[Email Service] Webhook response NOT OK. Status: ${response.status}, Text: ${response.statusText}`);
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      console.log(`[Email Service] Email sent successfully to: ${payload.to}. Webhook response status: ${response.status}`);
    } catch (error) {
      console.error('[Email Service] Exception occurred while sending email:', error);
      throw error;
    }
  }

  /**
   * Send Magic Link Email
   */
  static async sendMagicLink(to: string, url: string): Promise<void> {
    const subject = `Your magic sign-in link for ${this.brandName}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827; font-size: 24px; font-weight: 700;">Welcome to ${this.brandName}</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">Click the button below to sign in to your account. This link will expire shortly.</p>
        <div style="margin: 32px 0;">
          <a href="${url}" style="background-color: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Sign In Now</a>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">If you didn't request this email, you can safely ignore it.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordReset(to: string, url: string): Promise<void> {
    const subject = `Reset your password for ${this.brandName}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827; font-size: 24px; font-weight: 700;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">We received a request to reset your password. Click the button below to choose a new one.</p>
        <div style="margin: 32px 0;">
          <a href="${url}" style="background-color: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">If you didn't request this, your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Membership Payment Confirmation
   */
  static async sendMembershipConfirmation(to: string, name: string, planName: string, amount: string): Promise<void> {
    const subject = `Welcome to the Club! Membership Confirmed`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827; font-size: 24px; font-weight: 700;">Membership Activation</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">Hello ${name},</p>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">Your payment for the <strong>${planName}</strong> membership has been successfully processed. Welcome to the elite network of African IT leaders!</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Transaction Details:</p>
          <p style="margin: 8px 0 0; font-weight: 600; font-size: 18px;">Amount: ${amount}</p>
          <p style="margin: 4px 0 0; color: #111827; font-size: 16px;">Plan: ${planName}</p>
        </div>
        <div style="margin: 32px 0;">
          <a href="${Constants.BRANDWEBSITE}/dashboard" style="background-color: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">We're excited to have you on board.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    // Send to recipient
    await this.send({ from: this.fromEmail, to, subject, html });
    // Send notification to support
    await this.send({
      from: this.fromEmail,
      to: this.fromEmail,
      subject: `[Internal Notification] Membership Confirmed: ${name}`,
      html: `<h3>Internal Transaction Notification</h3><p>User: ${name} (${to})</p><p>Plan: ${planName}</p><p>Amount: ${amount}</p><hr/>${html}`
    });
  }

  /**
   * Send Welcome Email
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = `Welcome to ${this.brandName}!`;
    const themeColor = '#d97706'; // Primary theme color from app.css
    const html = `
      <div style="font-family: 'Inter', 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: ${themeColor}; font-size: 28px; font-weight: 800; margin: 0;">Welcome aboard!</h1>
        </div>
        
        <p style="font-size: 18px; line-height: 1.6; color: #374151;">Hello ${name},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          We're thrilled to have you join <strong>${this.brandName}</strong>. You're now part of Africa's most elite network of IT leaders and C-suite executives.
        </p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${Constants.BRANDWEBSITE}/dashboard" style="background-color: ${themeColor}; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">Explore Your Dashboard</a>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          Your dashboard is your gateway to exclusive networking opportunities, strategic insights, and members-only events.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 32px;">
          Best Regards,<br/>
          <strong>The ${this.brandName} Team</strong>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;" />
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.<br/>
          Driving Digital Transformation Across Africa.
        </p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * Send Team Invitation Email
   */
  static async sendTeamInvitation(to: string, orgName: string, inviterName: string): Promise<void> {
    const subject = `You're invited to join ${orgName} on ${this.brandName}`;
    const themeColor = '#d97706';
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: ${themeColor}; font-size: 24px; font-weight: 800; margin: 0;">Team Invitation</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">Hello,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          <strong>${inviterName}</strong> has invited you to join the <strong>${orgName}</strong> team on <strong>${this.brandName}</strong>.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          As a team member, you'll gain access to exclusive corporate benefits, including member-only events, strategic insights, and premium networking.
        </p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${Constants.BRANDWEBSITE}/sign-up" style="background-color: ${themeColor}; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">Join the Team</a>
        </div>
        
        <p style="font-size: 14px; color: #9ca3af; text-align: center;">
          Note: Please use this email address (${to}) when signing up to automatically join the organization.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;" />
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.
        </p>
      </div>
    `;

    await this.send({ from: this.fromEmail, to, subject, html });
  }

  /**
   * General Transactional Email
   */
  static async sendTransactional(to: string, subject: string, description: string, ctaText?: string, ctaLink?: string): Promise<void> {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 700;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">${description}</p>
        ${ctaText && ctaLink ? `
        <div style="margin: 32px 0;">
          <a href="${ctaLink}" style="background-color: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">${ctaText}</a>
        </div>` : ''}
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
      </div>
    `;

    // Send to recipient
    await this.send({ from: this.fromEmail, to, subject, html });
    // Send notification to support
    await this.send({
      from: this.fromEmail,
      to: this.fromEmail,
      subject: `[Internal Notification] ${subject}`,
      html: `<h3>Internal Transaction Notification</h3><p>Recipient: ${to}</p><p>Description: ${description}</p><hr/>${html}`
    });
  }
}
