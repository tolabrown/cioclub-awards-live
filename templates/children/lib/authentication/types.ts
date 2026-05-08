import type { FileType } from "$lib/constants";

export interface iEmailMeta {
  to: string,
  subject: string,
  meta: { description: string, link: string }
}

export type TField = 'term' | 'assignment' | 'submission' | 'class' | 'topic' | 'facilitator' | 'user' | 'student'

export interface iUpload {
	url: string;
	fileType: FileType;
	fileId: string;
}

export interface ImageKitResponse {
  fileId: string;
  name: string;
  size: number;
  versionInfo: Record<string, any>; // or define a more specific interface if you know the structure
  filePath: string;
  url: string;
  fileType: string;
  height: number;
  width: number;
  thumbnailUrl: string;
  AITags: string[] | null;
  description: string | null;
}

// If you want to be more specific about versionInfo, you could define it like this:
export interface ImageKitVersionInfo {
  id: string;
  name: string;
  // Add other version info properties as needed
}

// Then use it in the main interface:
export interface ImageKitResponseWithTypedVersion {
  fileId: string;
  name: string;
  size: number;
  versionInfo: ImageKitVersionInfo;
  filePath: string;
  url: string;
  fileType: string;
  height: number;
  width: number;
  thumbnailUrl: string;
  AITags: string[] | null;
  description: string | null;
}

export interface EmailConfig {
  brandName: string;
  brandColor: string;
  brandLogo?: string;
  supportEmail: string;
  websiteUrl: string;
  socialLinks?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
  };
  socialLinkImages?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
  };
}

export interface EmailTemplate {
  subject: string;
  preheader?: string;
  heading: string;
  content: string | string[];
  cta?: {
    text: string;
    url: string;
    style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  footer?: {
    unsubscribeUrl?: string;
    customText?: string;
  };
}

export interface EmailVariables {
  [key: string]: string | number | boolean;
}

export interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  template: EmailTemplate;
  variables?: EmailVariables;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  preheader?: string;
  heading: string;
  content: string | string[];
  cta?: {
    text: string;
    url: string;
    style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
  footer?: {
    unsubscribeUrl?: string;
    customText?: string;
  };
}

export interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  template: EmailTemplate;
  variables?: EmailVariables;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}