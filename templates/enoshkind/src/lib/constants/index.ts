import Logo from "$lib/components/icons/logo.svelte";
import { FileText, LayoutDashboard, User, Users, Settings, Activity, Bot, Stethoscope, BookOpen, Rocket, Baby, Target, Utensils, Gamepad2, Heart, TrendingUp, Calendar, Footprints, Droplets, Moon, Zap, Smile, Pill, Trophy, Circle, Save, ShieldCheck } from "@lucide/svelte";
import type { ComponentType } from "svelte";

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Constants {
  BRANDNAME = 'Enoshkind',
  BRANDLOGO = 'https://enoshkind.com/logo-light.svg',
  BRANDCAPTION = 'AI-Powered Health Intelligence',
  BRANDCOLOR = '#008236',
  SUPPORTEMAIL = 'support@chanieldigitalhealth.com',
  BRANDWEBSITE = "https://enoshkind.com",
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
  AFTERAUTH = '/dashboard'
}

export const adminRoles = [Role.ADMIN];

export const MAX_ITEMS_PER_PAGE = 28;

export const emptyMetalist = {
  total: 0,
  meta: {
    cursor: '',
    more: false,
    size: 0
  },
  data: []
};

export interface NavItem {
  title: string;
  url: string;
  roles: Role[];
  icon?: any;
  isActive?: boolean;
}

export interface NavGroup {
  title: string;
  icon?: any;
  items: NavItem[];
}

// Extended Navigation structure matching template
export const getNavigation = (reference: string, isDoctor: boolean = false) => {
  const isActive = (url: string) => reference === url;
  const isMainActive = (url: string) => reference.includes(url);

  const data = {
    teams: [
      {
        name: Constants.BRANDNAME,
        logo: Logo, // Replace with branding logo component if available
        plan: "Health Intelligence",
        url: "/"
      },
    ],
    navMain: [
      {
        title: "HEALTH ESSENTIALS",
        icon: Activity,
        items: [
          {
            title: "Health Overview",
            url: "/dashboard",
            roles: [Role.ADMIN, Role.USER],
            icon: LayoutDashboard,
            isActive: isActive("/dashboard"),
          },
          {
            title: "Daily Tracking",
            url: "/tracking",
            roles: [Role.ADMIN, Role.USER],
            icon: FileText,
            isActive: isActive("/tracking")
          },
          {
            title: "Vital Monitoring",
            url: "/vitals",
            roles: [Role.ADMIN, Role.USER],
            icon: Activity,
            isActive: isActive("/vitals")
          },
          {
            title: "AI Health Buddy",
            url: "/ai-buddy",
            roles: [Role.ADMIN, Role.USER],
            icon: Bot,
            isActive: isActive("/ai-buddy"),
          }
        ]
      },
      {
        title: "CARE & SUPPORT",
        icon: Stethoscope,
        items: [
          {
            title: "Telemedicine",
            url: "/telemedicine",
            roles: [Role.ADMIN, Role.USER],
            icon: Stethoscope,
            isActive: isActive("/telemedicine")
          },
          {
            title: "Dietitian Support",
            url: "/diet-tracking",
            roles: [Role.ADMIN, Role.USER],
            icon: Utensils,
            isActive: isActive("/diet-tracking")
          },
          // {
          //   title: "Laboratory & DNA",
          //   url: "/lab-tests",
          //   roles: [Role.ADMIN, Role.USER],
          //   icon: Droplets,
          //   isActive: isActive("/lab-tests")
          // }
        ]
      },
      {
        title: "COMMUNITY & EDUCATION",
        icon: Users,
        items: [
          {
            title: "Health Education",
            url: "/education",
            roles: [Role.ADMIN, Role.USER],
            icon: BookOpen,
            isActive: isActive("/education")
          },
          {
            title: "Community Cycles",
            url: "/community",
            roles: [Role.ADMIN, Role.USER],
            icon: Users,
            isActive: isActive("/community")
          }
        ]
      },
      {
        title: "MARKETPLACE",
        icon: Pill,
        items: [
          {
            title: "Drugs & Devices",
            url: "/marketplace",
            roles: [Role.ADMIN, Role.USER],
            icon: Pill,
            isActive: isActive("/marketplace")
          }
        ]
      },
      {
        title: "PRACTITIONER PORTAL",
        icon: Stethoscope,
        items: isDoctor
          ? [
            {
              title: "Doctor Dashboard",
              url: "/telemedicine/doctor",
              roles: [Role.ADMIN, Role.USER],
              icon: LayoutDashboard,
              isActive: isActive("/telemedicine/doctor")
            },
            {
              title: "My Availability",
              url: "/telemedicine/doctor/availability",
              roles: [Role.ADMIN, Role.USER],
              icon: Calendar,
              isActive: isActive("/telemedicine/doctor/availability")
            }
          ]
          : [
            {
              title: "Become a Doctor",
              url: "/telemedicine/onboarding",
              roles: [Role.ADMIN, Role.USER],
              icon: Rocket,
              isActive: isActive("/telemedicine/onboarding")
            }
          ]
      },
      {
        title: "ACCOUNT",
        icon: Settings,
        items: [
          {
            title: "Profile",
            url: "/profile",
            roles: [Role.ADMIN, Role.USER],
            icon: User,
            isActive: isActive("/profile"),
          },
          {
            title: "Users",
            url: "/users",
            roles: [Role.ADMIN],
            icon: Users,
            isActive: isActive("/users"),
          },
          {
            title: "Education Repository",
            url: "/admin/education",
            roles: [Role.ADMIN],
            icon: BookOpen,
            isActive: isMainActive("/admin/education"),
          },
          {
            title: "Doctor Approvals",
            url: "/admin/approvals",
            roles: [Role.ADMIN],
            icon: ShieldCheck,
            isActive: isActive("/admin/approvals"),
          },
          {
            title: "Doctors List",
            url: "/admin/doctors",
            roles: [Role.ADMIN],
            icon: Stethoscope,
            isActive: isActive("/admin/doctors"),
          },
          {
            title: "Settings",
            url: "/settings",
            roles: [Role.ADMIN],
            icon: Settings,
            isActive: isActive("/settings"),
          },
        ]
      }
    ],
  };

  return data;
}
