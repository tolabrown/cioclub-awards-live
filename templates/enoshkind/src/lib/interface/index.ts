import type { User } from "$lib/auth";

export interface iMeta {
  title: string;
  keywords: string[];
  description: string;
  ogimage: string;
  link: string;
}

export interface iDrizzle {
  createdAt: Date;
  updatedAt?: Date;
  version?: number;
  id: string;
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
  bio?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

export type StatusType = "error" | "success";

export type iResult = {
  status: StatusType;
  message: string;
  data?: any
}

// ... existing content ... (actually I'll just append it or insert it)
export interface iActivityLog extends iDrizzle {
  user?: string | iUser | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface iFetchMeta {
  total: number;
  meta: {
    cursor: string;
    more: boolean;
    size: number;
  };
  data: any[];
  lastIndex?: number;
}

export interface iPatient extends iDrizzle {
  user: string | User;
  location: string;
  culturalBackground: string;
}

export interface iHealthTracking extends iDrizzle {
  user: string | User;
  trackingDate: Date;
  // Vitals
  systolic?: number | null;
  diastolic?: number | null;
  heartRate?: number | null;
  weight?: number | null;
  // Labs
  bloodSugarFasting?: number | null;
  bloodSugarRandom?: number | null;
  hba1c?: number | null;
  cholesterol?: number | null;
  creatinine?: number | null;
  egfr?: number | null;
  // Wellness
  moodRating?: number | null;
  energyLevel?: number | null;
  notes?: string | null;
}
export interface iDoctorAvailability extends iDrizzle {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface iDoctor extends iDrizzle {
  name: string;
  specialty: string;
  rating?: string | number;
  reviews?: number;
  image?: string | null;
  available?: string | null;
  price: number;
  bio?: string | null;
  availability?: iDoctorAvailability[];
}

export interface iConsultation extends iDrizzle {
  userId: string;
  doctorId?: string | iDoctor | null;
  type: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  paid: boolean;
  reason?: string | null;
  adminFee?: number | null;
}

export interface iLabTestOrder extends iDrizzle {
  userId: string;
  testType: string;
  status: string;
  technicianName?: string | null;
  technicianPhone?: string | null;
  scheduledCollection?: Date | null;
  pdfUrl?: string | null;
  paid: boolean;
}

export interface iLabResult extends iDrizzle {
  orderId: string;
  overallScore?: number;
  metrics?: string | any;
  recommendations?: string | any;
}

export interface iPrescription extends iDrizzle {
  userId: string;
  medicationName: string;
  dosage: string;
  instructions?: string | null;
  prescribedBy?: string | null;
  status: string;
  autoRefill?: boolean;
}

export interface iPharmacyOrder extends iDrizzle {
  userId: string;
  pharmacyName: string;
  status: string;
  totalAmount: number;
  paid: boolean;
}

export interface iInsurancePolicy extends iDrizzle {
  userId: string;
  provider: string;
  policyNumber: string;
  status?: string | null;
  annualCoverage?: number;
  usedCoverage?: number;
}

export interface iFile extends iDrizzle {
  remoteId: string;
  url: string;
  size: number;
  type?: string | null;
  name?: string | null;
}

export interface iEducation extends iDrizzle {
  title: string;
  category: string;
  duration?: string | null;
  image?: string | iFile | null;
  premium?: boolean | null;
  content?: string | null;
  videoUrl?: string | null;
  type?: string | null;
  user?: string | iUser | null;
  tags?: string[] | null;
  metadata?: any | null;
}

export interface iEducationFilters {
  category?: string;
  type?: string;
  search?: string;
}
