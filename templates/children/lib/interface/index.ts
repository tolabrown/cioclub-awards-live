export interface iMeta {
  title: string;
  keywords: string[];
  description: string;
  ogimage: string;
  link: string;
}

export interface iDrizzle {
  createdAt: Date;
  updatedAt: Date;
  version?: number;
  id: string;
}

export interface iFile extends iDrizzle {
  remoteId: string;
  url: string;
  size: number;
  type: string | null;
  name: string | null;
}

export interface iChild extends iDrizzle {
  name: string;
  dateOfBirth?: Date;
  gender?: string;
  ageGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  notes?: string;
  active: boolean;
  image?: string | iFile | null; // File ID for avatar OR populated file object
  parents?: Array<string | iParent>;
  files?: iFile[]; // Additional media files
}

export interface iParent extends iDrizzle {
  name: string;
  phone: string;
  email?: string;
  parentType: string; // father, mother, guardian
  children?: Array<iChild>; // Populated children data
}

export interface iParentChild extends iDrizzle {
  parentId: string;
  childId: string;
  isPrimary: boolean;
}

export interface iUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

export interface iTeacher {
  id: string;
  user?: string | iUser | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  birthDay?: string | null;
  image?: string | iFile | null;
  teacherType?: string | null;
  location?: string | null;
  capacity?: string | null;
  assignedClass?: string | null;
  note?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  files?: iFile[]; // Additional media files
}

export interface iScore extends iDrizzle {
  child: string | iChild; // ID when saving, object when fetching
  scoreType: string;
  points: number;
  ageAtSubmission: number;
  normalizedScore: number;
  submissionDate: string;
  notes?: string;
}

export interface iFetchMeta {
  meta: {
    cursor: string;
    more: boolean;
    size: number
  }
  data: any[]
  total: number;
  lastIndex?: number;
  distribution?: Record<string, number>;
}

export type FormatToken = 'YYYY' | 'mm' | 'MMMM' | 'MMM' | 'DD' | 'dddd' | 'ddd' | 'HH' | 'hh' | 'ss' | 'a';

export type StatusType = "error" | "success";

export type iResult = {
  status: StatusType;
  message: string;
  data?: any
}

export interface iMeeting extends iDrizzle {
  type: string;
  datetime: Date;
  image?: string | iFile | null;
}

export interface iAttendee extends iDrizzle {
  meeting: string | iMeeting;
  child: string | iChild;
  notes?: string;
}

export interface iActivityLog extends iDrizzle {
  user?: string | iUser | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface iMemory extends iDrizzle {
  name: string;
  date: Date;
  location?: string | null;
  description?: string | null;
  coverImage?: string | iFile | null;
  files?: iFile[];
}
