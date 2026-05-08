import type { EmailConfig, EmailTemplate, EmailVariables } from "./types";

export class EmailTemplates {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  private getBaseStyles() {
    return {
      container: `
        max-width: 600px;
        margin: 0 auto;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #ffffff;
      `,
      header: `
        background: ${this.config.brandColor};
        color: white;
        padding: 30px 40px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      `,
      logo: `
        max-height: 40px;
        margin-bottom: 10px;
      `,
      brandName: `
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      `,
      content: `
        padding: 40px;
        background: #ffffff;
      `,
      heading: `
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0 0 20px 0;
      `,
      paragraph: `
        font-size: 16px;
        line-height: 1.8;
        color: #555;
        margin: 0 0 16px 0;
      `,
      button: {
        primary: `
          display: inline-block;
          background: ${this.config.brandColor};
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: all 0.3s ease;
        `,
        secondary: `
          display: inline-block;
          background: #6c757d;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        `,
        success: `
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        `,
        warning: `
          display: inline-block;
          background: #ffc107;
          color: #212529;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        `,
        danger: `
          display: inline-block;
          background: #dc3545;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        `
      },
      footer: `
        background: #f8f9fa;
        padding: 30px 40px;
        text-align: center;
        border-radius: 0 0 8px 8px;
        color: #6c757d;
        font-size: 14px;
      `,
      socialLinks: `
        margin: 20px 0;
      `,
      socialLink: `
        display: inline-block;
        margin: 0 10px;
        color: ${this.config.brandColor};
        text-decoration: none;
      `,
      unsubscribe: `
        color: #6c757d;
        font-size: 12px;
        text-decoration: underline;
      `
    };
  }

  private replaceVariables(text: string, variables: EmailVariables = {}): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }

  private generateSocialLinks(): string {
    if (!this.config.socialLinks) return '';

    const styles = this.getBaseStyles();
    let socialHtml = `<div style="${styles.socialLinks}">`;

    Object.entries(this.config.socialLinks).forEach(([platform, url]) => {
      if (url) {
        socialHtml += `
          <a href="${url}" style="${styles.socialLink}">${platform.toUpperCase()}</a>
        `;
      }
    });

    socialHtml += '</div>';
    return socialHtml;
  }

  generateHtml(template: EmailTemplate, variables: EmailVariables = {}): string {
    const styles = this.getBaseStyles();
    const processedHeading = this.replaceVariables(template.heading, variables);
    const processedContent = Array.isArray(template.content) 
      ? template.content.map(p => this.replaceVariables(p, variables)).join('')
      : this.replaceVariables(template.content, variables);

    let ctaButton = '';
    if (template.cta) {
      const buttonStyle = styles.button[template.cta.style || 'primary'];
      const processedUrl = this.replaceVariables(template.cta.url, variables);
      const processedText = this.replaceVariables(template.cta.text, variables);
      
      ctaButton = `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${processedUrl}" style="${buttonStyle}">${processedText}</a>
        </div>
      `;
    }

    const footerText = template.footer?.customText 
      ? this.replaceVariables(template.footer.customText, variables)
      : `
        <p>You're receiving this email because you're a valued member of ${this.config.brandName}.</p>
        <p>If you have any questions, please contact us at <a href="mailto:${this.config.supportEmail}">${this.config.supportEmail}</a></p>
      `;

    const unsubscribeLink = template.footer?.unsubscribeUrl
      ? `<p><a href="${template.footer.unsubscribeUrl}" style="${styles.unsubscribe}">Unsubscribe from these emails</a></p>`
      : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.replaceVariables(template.subject, variables)}</title>
        ${template.preheader ? `<meta name="description" content="${this.replaceVariables(template.preheader, variables)}">` : ''}
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        ${template.preheader ? `
          <div style="display: none; max-height: 0; overflow: hidden;">
            ${this.replaceVariables(template.preheader, variables)}
          </div>
        ` : ''}
        
        <div style="${styles.container}">
          <!-- Header -->
          <div style="${styles.header}">
            ${this.config.brandLogo ? `<img src="${this.config.brandLogo}" alt="${this.config.brandName}" style="${styles.logo}">` : ''}
            <h1 style="${styles.brandName}">${this.config.brandName}</h1>
          </div>

          <!-- Content -->
          <div style="${styles.content}">
            <h2 style="${styles.heading}">${processedHeading}</h2>
            <div style="${styles.paragraph}">${processedContent}</div>
            ${ctaButton}
          </div>

          <!-- Footer -->
          <div style="${styles.footer}">
            ${footerText}
            ${this.generateSocialLinks()}
            ${unsubscribeLink}
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} ${this.config.brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const getPasswordResetTemplate = (emailConfig: EmailConfig, resetData:{userEmail: string, resetLink: string, userName?: string}) => {
  const { resetLink, userEmail, userName = 'User' } = resetData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Reset Your Password - ${emailConfig.brandName}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Client-specific styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .header img {
            max-width: 180px;
            height: auto;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .content h1 {
            color: #2d3748;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }
        
        .content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        
        .reset-button {
            display: inline-block;
            background-color: ${emailConfig.brandColor};
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        .reset-button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .security-info {
            background-color: #f7fafc;
            border-left: 4px solid #4299e1;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-info h3 {
            color: #2d3748;
            font-size: 18px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        
        .security-info p {
            margin: 0;
            font-size: 14px;
        }
        
        .footer {
            background-color: #2d3748;
            color: #a0aec0;
            padding: 40px 30px;
            text-align: center;
        }
        
        .footer p {
            margin: 0 0 20px 0;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .social-links {
            margin: 30px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            transition: transform 0.3s ease;
        }
        
        .social-links a:hover {
            transform: translateY(-2px);
        }
        
        .social-links img {
            width: 32px;
            height: 32px;
            border-radius: 4px;
        }
        
        .divider {
            border: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            
            .header, .content, .footer {
                padding: 30px 20px !important;
            }
            
            .content h1 {
                font-size: 24px !important;
            }
            
            .reset-button {
                display: block !important;
                text-align: center !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
        }
    </style>
</head>
<body>
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Reset your ${emailConfig.brandName} password securely
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <div class="email-container">
                    <!-- Header -->
                    <div class="header">
                        <img src="${emailConfig.brandLogo}" alt="${emailConfig.brandName}" style="max-width: 180px; height: auto;">
                    </div>
                    
                    <!-- Main Content -->
                    <div class="content">
                        <h1>Reset Your Password</h1>
                        
                        <p>Hi ${userName},</p>
                        
                        <p>We received a request to reset the password for your ${emailConfig.brandName} account associated with <strong>${userEmail}</strong>.</p>
                        
                        <p>Click the button below to create a new password:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" class="reset-button" style="background-color: ${emailConfig.brandColor}; color: #ffffff; text-decoration: none;">
                                Reset My Password
                            </a>
                        </div>
                        
                        <div class="security-info">
                            <h3>🔒 Security Information</h3>
                            <p><strong>This link will expire in 1 hour</strong> for your security. If you didn't request this password reset, you can safely ignore this email - your account remains secure.</p>
                        </div>
                        
                        <hr class="divider">
                        
                        <p style="font-size: 14px; color: #718096;">
                            If the button above doesn't work, copy and paste this link into your browser:<br>
                            <a href="${resetLink}" style="color: ${emailConfig.brandColor}; word-break: break-all;">${resetLink}</a>
                        </p>
                        
                        <p style="font-size: 14px; color: #718096;">
                            Need help? Contact our support team at <a href="mailto:${emailConfig.supportEmail}" style="color: ${emailConfig.brandColor};">${emailConfig.supportEmail}</a>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p>Stay connected with us:</p>
                        
                        <div class="social-links">
                            <a href="${emailConfig?.socialLinks?.facebook}"><img src="${emailConfig?.socialLinkImages?.facebook}" alt="Facebook"></a>
                            <a href="${emailConfig?.socialLinks?.x}"><img src="${emailConfig?.socialLinkImages?.x}" alt="X (Twitter)"></a>
                            <a href="${emailConfig?.socialLinks?.instagram}"><img src="${emailConfig?.socialLinkImages?.instagram}" alt="Instagram"></a>
                            <a href="${emailConfig?.socialLinks?.youtube}"><img src="${emailConfig?.socialLinkImages?.youtube}" alt="YouTube"></a>
                            <a href="${emailConfig?.socialLinks?.telegram}"><img src="${emailConfig?.socialLinkImages?.telegram}" alt="Telegram"></a>
                            <a href="${emailConfig?.socialLinks?.whatsapp}"><img src="${emailConfig?.socialLinkImages?.whatsapp}" alt="WhatsApp"></a>
                        </div>
                        
                        <p>
                            © ${new Date().getFullYear()} ${emailConfig.brandName}. All rights reserved.<br>
                            <a href="${emailConfig.websiteUrl}" style="color: #4299e1; text-decoration: none;">${emailConfig.websiteUrl}</a>
                        </p>
                        
                        <p style="font-size: 12px; margin-top: 20px;">
                            This email was sent to ${userEmail}. If you no longer wish to receive these emails, 
                            you can <a href="#" style="color: #4299e1;">update your preferences</a>.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

