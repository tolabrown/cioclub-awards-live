import { env } from "$env/dynamic/private";
import transporter from "./nodemailer";
import type { EmailConfig, EmailTemplate, EmailVariables, SendEmailOptions } from "./types";
import { EmailTemplates } from "./email-templates";

export class EmailService {
  private templates: EmailTemplates;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.templates = new EmailTemplates(config);
  }

  async send(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const html = this.templates.generateHtml(options.template, options.variables);
      const subject = this.templates['replaceVariables']
        ? this.templates['replaceVariables'](options.template.subject, options.variables || {})
        : options.template.subject;

      const mailOptions = {
        from: `${this.config.brandName} <${env.NODEMAILER_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject,
        html,
        attachments: options.attachments
      };

      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Pre-built templates for common use cases
  static templates = {
    welcome: (userName: string, activationUrl: string): EmailTemplate => ({
      subject: "Welcome to {{brandName}}! 🎉",
      preheader: "Get started with your new account",
      heading: "Welcome aboard, {{userName}}! 👋",
      content: [
        `<p>We're thrilled to have you join the {{brandName}} community!</p>`,
        `<p>To get started, please verify your email address by clicking the button below:</p>`
      ],
      cta: {
        text: "Verify Email Address",
        url: activationUrl,
        style: "primary"
      },
      footer: {
        customText: `<p>Welcome to the family! If you need any help getting started, we're here for you.</p>`
      }
    }),

    verifyEmail: (verificationUrl: string, expiryHours: number = 24): EmailTemplate => ({
      subject: "Verify Your Email Address - {{brandName}}",
      preheader: "Please confirm your email address to complete your registration",
      heading: "Please Verify Your Email Address ✉️",
      content: [
        `<p>Hi {{userName}},</p>`,
        `<p>Thanks for signing up with {{brandName}}! To complete your registration and secure your account, please verify your email address.</p>`,
        `<p>Click the button below to verify your email. This verification link will expire in ${expiryHours} hours for security purposes.</p>`,
        `<p><strong>If you didn't create an account with us, please ignore this email.</strong></p>`
      ],
      cta: {
        text: "Verify Email Address",
        url: verificationUrl,
        style: "primary"
      },
      footer: {
        customText: `
          <p>Having trouble with the button above? Copy and paste the following link into your browser:</p>
          <p><a href="${verificationUrl}" style="color: #6c757d; font-size: 12px; word-break: break-all;">${verificationUrl}</a></p>
        `
      }
    }),

    passwordReset: (resetUrl: string, expiryHours: number = 24): EmailTemplate => ({
      subject: "Reset Your Password - {{brandName}}",
      preheader: "Reset your password securely",
      heading: "Password Reset Request 🔐",
      content: [
        `<p>We received a request to reset your password for your {{brandName}} account.</p>`,
        `<p>Click the button below to create a new password. This link will expire in ${expiryHours} hours.</p>`,
        `<p><strong>If you didn't request this reset, you can safely ignore this email.</strong></p>`
      ],
      cta: {
        text: "Reset Password",
        url: resetUrl,
        style: "warning"
      }
    }),

    orderConfirmation: (orderNumber: string, orderTotal: string, trackingUrl?: string): EmailTemplate => ({
      subject: "Order Confirmed #{{orderNumber}} - {{brandName}}",
      preheader: "Your order has been confirmed and is being processed",
      heading: "Order Confirmed! 📦",
      content: [
        `<p>Thanks for your order! We've received your payment and are preparing your items.</p>`,
        `<p><strong>Order #:</strong> {{orderNumber}}</p>`,
        `<p><strong>Total:</strong> {{orderTotal}}</p>`,
        ...(trackingUrl ? [`<p>You can track your order using the link below:</p>`] : [])
      ],
      cta: trackingUrl ? {
        text: "Track Your Order",
        url: trackingUrl,
        style: "success"
      } : undefined
    }),

    orderReceipt: (orderDetails: {
      orderNumber: string;
      orderDate: string;
      items: Array<{
        name: string;
        quantity: number;
        price: string;
      }>;
      subtotal: string;
      tax?: string;
      shipping?: string;
      total: string;
      billingAddress?: string;
      shippingAddress?: string;
      paymentMethod?: string;
    }): EmailTemplate => ({
      subject: "Receipt for Order #{{orderNumber}} - {{brandName}}",
      preheader: "Your order receipt and invoice details",
      heading: "Order Receipt 🧾",
      content: [
        `<p>Hi {{customerName}},</p>`,
        `<p>Thank you for your purchase! Here's your receipt for order #{{orderNumber}}.</p>`,
        
        // Order Summary Table
        `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">`,
        `<h3 style="margin: 0 0 15px 0; color: #333;">Order Summary</h3>`,
        `<p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>`,
        `<p style="margin: 5px 0;"><strong>Order Date:</strong> {{orderDate}}</p>`,
        `</div>`,

        // Items Table
        `<div style="margin: 30px 0;">`,
        `<h3 style="color: #333; margin-bottom: 15px;">Items Ordered</h3>`,
        `<table style="width: 100%; border-collapse: collapse; background: white;">`,
        `<thead>`,
        `<tr style="background: #f8f9fa;">`,
        `<th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>`,
        `<th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>`,
        `<th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>`,
        `</tr>`,
        `</thead>`,
        `<tbody>`,
        ...orderDetails.items.map(item => 
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${item.name}</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.price}</td>
          </tr>`
        ),
        `</tbody>`,
        `</table>`,
        `</div>`,

        // Totals
        `<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">`,
        `<table style="width: 100%; max-width: 300px; margin-left: auto;">`,
        `<tr><td style="padding: 5px 0;"><strong>Subtotal:</strong></td><td style="text-align: right; padding: 5px 0;">{{subtotal}}</td></tr>`,
        ...(orderDetails.tax ? [`<tr><td style="padding: 5px 0;">Tax:</td><td style="text-align: right; padding: 5px 0;">{{tax}}</td></tr>`] : []),
        ...(orderDetails.shipping ? [`<tr><td style="padding: 5px 0;">Shipping:</td><td style="text-align: right; padding: 5px 0;">{{shipping}}</td></tr>`] : []),
        `<tr style="border-top: 2px solid #333; font-weight: bold; font-size: 18px;">`,
        `<td style="padding: 10px 0;">Total:</td><td style="text-align: right; padding: 10px 0;">{{total}}</td>`,
        `</tr>`,
        `</table>`,
        `</div>`,

        // Addresses (if provided)
        ...(orderDetails.billingAddress || orderDetails.shippingAddress ? [
          `<div style="margin: 30px 0;">`,
          `<div style="display: flex; gap: 20px;">`,
          ...(orderDetails.billingAddress ? [
            `<div style="flex: 1;">`,
            `<h4 style="color: #333; margin-bottom: 10px;">Billing Address</h4>`,
            `<p style="font-size: 14px; line-height: 1.5; color: #666;">{{billingAddress}}</p>`,
            `</div>`
          ] : []),
          ...(orderDetails.shippingAddress ? [
            `<div style="flex: 1;">`,
            `<h4 style="color: #333; margin-bottom: 10px;">Shipping Address</h4>`,
            `<p style="font-size: 14px; line-height: 1.5; color: #666;">{{shippingAddress}}</p>`,
            `</div>`
          ] : []),
          `</div>`,
          `</div>`
        ] : []),

        // Payment Method (if provided)
        ...(orderDetails.paymentMethod ? [
          `<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">`,
          `<p style="margin: 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>`,
          `</div>`
        ] : []),

        `<p style="margin-top: 30px;">Questions about your order? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>`
      ],
      cta: {
        text: "View Order Details",
        url: "{{orderUrl}}",
        style: "primary"
      },
      footer: {
        customText: `
          <p>Keep this receipt for your records. You can also download a PDF copy from your account dashboard.</p>
          <p>Thank you for choosing {{brandName}}!</p>
        `
      }
    }),

    notification: (title: string, message: string, actionUrl?: string, actionText?: string): EmailTemplate => ({
      subject: "{{title}} - {{brandName}}",
      heading: "{{title}}",
      content: `<p>{{message}}</p>`,
      cta: actionUrl && actionText ? {
        text: actionText,
        url: actionUrl,
        style: "primary"
      } : undefined
    })
  };
}