import type { EmailConfig, iEmailMeta } from "$lib/authentication/types";
import { EMAIL_WEBHOOK } from "$env/static/private";
import { getPasswordResetTemplate } from "./email-templates";
import { Constants } from "$lib/constants";


export const sendEmailAction = async (emailMeta: iEmailMeta) => {
  const { to, subject, meta: { description, link } } = emailMeta;
  const emailConfig: EmailConfig = {
    brandName: Constants.BRANDNAME,
    brandColor: Constants.BRANDCOLOR,
    brandLogo: Constants.BRANDLOGO,
    supportEmail: Constants.SUPPORTEMAIL,
    websiteUrl: Constants.BRANDWEBSITE,
    socialLinks: {
      x: "https://twitter.com/RCNLagos?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
      facebook: "https://facebook.com/RCNLagos/?_rdc=1&_rdr",
      instagram: "https://www.instagram.com/rcnlagos/?hl=en",
      youtube: "https://www.youtube.com/channel/UC1ySHTn2eyeNEtYpB3-ZILw",
      telegram: "https://t.me/rcnlagos",
      whatsapp: "https://api.whatsapp.com/send?phone=+2348186253251&text=Hello"
    },
    socialLinkImages: {
      x: "https://rda.rcnlagos.org/some/x.png",
      facebook: "https://rda.rcnlagos.org/some/facebook.png",
      instagram: "https://rda.rcnlagos.org/some/instagram.png",
      youtube: "https://rda.rcnlagos.org/some/youtube.png",
      telegram: "https://rda.rcnlagos.org/some/telegram.png",
      whatsapp: "https://rda.rcnlagos.org/some/whatsapp.png"
    }
  };
  
  const body = await getPasswordResetTemplate(emailConfig, { userEmail: to, resetLink: link })

  const payload = { to, subject, body, from: emailConfig.supportEmail }
  // const emailService = new EmailService(emailConfig);

  try {

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }

    const response = await fetch(EMAIL_WEBHOOK, options)

    if (response.ok) {
      const data = await response.json()
      console.log(data)
    } 
    return { success: true }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false }
  }
}
