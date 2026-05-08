import { env } from "$env/dynamic/private";
import { COMPANY_INFO, SITE_NAME, SITE_URL } from "$lib/constants/index";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  async send(options: EmailOptions) {
    const webhook = env.EMAIL_WEBHOOK;
    if (!webhook) {
      console.error("EMAIL_WEBHOOK is not defined in environment variables");
      return { success: false, error: "Configuration error" };
    }

    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Email webhook failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
  },

  generateTemplate(title: string, content: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #1f2937; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">${SITE_NAME}</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #111827; font-size: 22px; margin-top: 0;">${title}</h2>
            ${content}
          </div>
          <div style="background-color: #f3f4f6; padding: 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p><strong>${SITE_NAME}</strong></p>
            <p>${COMPANY_INFO.address}</p>
            <p>${COMPANY_INFO.phone} | ${COMPANY_INFO.email}</p>
            <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  async sendContactConfirmation(name: string, email: string, subject: string, message: string) {
    const adminHtml = this.generateTemplate(
      "New Contact Inquiry",
      `
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-top: 20px; background-color: #f9fafb;">
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      `
    );

    const userHtml = this.generateTemplate(
      "We've Received Your Message",
      `
      <p>Hello ${name},</p>
      <p>Thank you for reaching out to us. We have received your message regarding <strong>"${subject}"</strong> and our team will get back to you within 24 hours.</p>
      <p>Here is a copy of your message:</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-top: 20px; background-color: #f9fafb; font-style: italic;">
        "${message}"
      </div>
      <p>Best regards,<br/>The ${SITE_NAME} Team</p>
      `
    );

    // Send to admin
    await this.send({
      to: COMPANY_INFO.adminEmail,
      subject: `[Support] New Inquiry: ${subject}`,
      html: adminHtml,
    });

    // Send to user
    await this.send({
      to: email,
      subject: `We've received your inquiry - ${SITE_NAME}`,
      html: userHtml,
    });
  },

  async sendTransactionNotification(userEmail: string, orderDetails: {
    id: string;
    orderNumber: string;
    total: string;
    deliveryMethod?: 'shipping' | 'pickup';
    pickupDetails?: string | null;
    shippingAddress?: {
      fullName: string;
      addressLine1?: string;
      city?: string;
      state?: string;
      phone: string;
    };
  }) {
    const isPickup = orderDetails.deliveryMethod === 'pickup';

    const deliverySection = isPickup
      ? `
        <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px solid #e5e7eb;">
          <h4 style="color: #111827; margin: 0 0 8px 0;">📍 Pickup Order</h4>
          <p style="margin: 0; color: #374151;"><strong>Pickup Details:</strong></p>
          <p style="margin: 8px 0 0 0; color: #4b5563; white-space: pre-wrap;">${orderDetails.pickupDetails}</p>
        </div>
      `
      : `
        <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px solid #e5e7eb;">
          <h4 style="color: #111827; margin: 0 0 8px 0;">🚚 Delivery Address</h4>
          <p style="margin: 0; color: #4b5563;">
            ${orderDetails.shippingAddress?.fullName}<br/>
            ${orderDetails.shippingAddress?.addressLine1 || ''}<br/>
            ${orderDetails.shippingAddress?.city || ''}, ${orderDetails.shippingAddress?.state || ''}<br/>
            Phone: ${orderDetails.shippingAddress?.phone}
          </p>
        </div>
      `;

    const customerHtml = this.generateTemplate(
      "Your Order Confirmation",
      `
      <p>Thank you for your purchase! Your order <strong>#${orderDetails.orderNumber}</strong> has been received and is being processed.</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-top: 20px; background-color: #f9fafb;">
        <h3 style="margin-top: 0;">Order Summary</h3>
        <p>Order Number: <strong>#${orderDetails.orderNumber}</strong></p>
        <p>Total Amount: <strong>${orderDetails.total}</strong></p>
        <p>Delivery Method: <strong>${isPickup ? '📍 Pickup' : '🚚 Shipping'}</strong></p>
        <p>Status: <span style="color: #374151; font-weight: bold;">Processing</span></p>
      </div>
      ${deliverySection}
      <a href="${SITE_URL}/orders" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px;">View Your Orders</a>
      `
    );

    const adminHtml = this.generateTemplate(
      "New Order Received",
      `
      <p>A new order has been placed on ${SITE_NAME}.</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-top: 20px; background-color: #f9fafb;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p>Order Number: <strong>#${orderDetails.orderNumber}</strong></p>
        <p>Customer: <strong>${userEmail}</strong></p>
        <p>Total: <strong>${orderDetails.total}</strong></p>
        <p>Delivery Method: <strong style="color: #374151;">${isPickup ? '📍 PICKUP' : '🚚 Shipping'}</strong></p>
      </div>
      ${deliverySection}
      <a href="${SITE_URL}/admin/orders" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px;">View in Admin</a>
      `
    );

    await this.send({
      to: userEmail,
      subject: `Order Confirmation #${orderDetails.orderNumber} - ${SITE_NAME}`,
      html: customerHtml,
    });

    await this.send({
      to: COMPANY_INFO.adminEmail,
      subject: `${isPickup ? '[PICKUP] ' : ''}New Order #${orderDetails.orderNumber}`,
      html: adminHtml,
    });
  }
};

