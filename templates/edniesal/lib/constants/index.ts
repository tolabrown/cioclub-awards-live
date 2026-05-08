import Logo from "$lib/components/icons/logo.svelte";
import type { iFetchMeta } from "$lib/interface";
import {
  FileText, LayoutDashboard, User, Users, Home, Book, Music,
  Heart, Globe, Lightbulb, Cross, Newspaper, Calendar, Handshake,
  Library, Trophy, GraduationCap, Ticket, FolderClosed, MessageSquare,
  UserPlus, Settings, Sparkles
} from "@lucide/svelte";

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export enum Fields { USER = 'user' }

export const MAX_ITEMS_PER_PAGE = 12;

export const EDITABLE_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Team', path: '/team' },
  { name: 'Ladies in Tech', path: '/ladies-in-tech' },
  { name: 'Contact', path: '/contact' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Cookie Policy', path: '/cookie-policy' },
  { name: 'Terms of Use', path: '/terms-of-use' },
];

export const Constants = {
  BRANDNAME: 'edniesal',
  TAGLINE: 'Consulting',
  CREDENTIAL: 'credential',
  GOOGLE: 'google',
  AFTERAUTH: '/dashboard',
  SUPPORTEMAIL: 'info@edniesalconsulting.com',
  BRANDWEBSITE: 'https://www.edniesalconsulting.com',
  PHONE: '+234 703 178 1142',
  ADDRESS: "L'Monarch plaza, 65C Opebi Road, Ikeja, Lagos, Nigeria",
  YEAR: 2024,
  ADESEWA_PHONE: '+2348102668340',
  ADESEWA_WHATSAPP: 'https://wa.me/2348102668340',
  CORDELIA_PHONE: '+2347069432878',
  CORDELIA_WHATSAPP: 'https://wa.me/2347069432878',
} as const;

export type FileType = 'audio' | 'video' | 'file' | 'image';

// Site Meta for SEO/OG tags
export const SiteMeta = {
  title: 'edniesal',
  description: 'Welcome to edniesal - Your trusted platform',
  keywords: ['edniesal', 'platform', 'app'],
  ogimage: 'https://edniesal.vercel.app/ogimage.webp',
  link: 'https://www.edniesalconsulting.com',
};

// Site stats placeholders (can be dynamic if needed)
export const SiteStats = [
  { value: '100+', label: 'Happy Clients', emoji: '👥', gradient: 'from-blue-500 to-indigo-500' },
  { value: '50+', label: 'Successful Projects', emoji: '🚀', gradient: 'from-amber-500 to-orange-500' },
  { value: '25+', label: 'Advisors & Experts', emoji: '✨', gradient: 'from-emerald-500 to-teal-500' },
];

// Utility function for background images
export const getStyle = (imageUrl: string) => `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;

export const adminRoles = [Role.ADMIN];

export const getNavigation = (reference: string) => {
  const isActive = (url: string) => reference === url;

  const data = {
    teams: [
      {
        name: "Edniesal",
        logo: Logo,
        plan: "Consulting",
        url: "/"
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        roles: [Role.ADMIN, Role.EDITOR, Role.USER],
        icon: LayoutDashboard,
        isActive: isActive("/dashboard"),
      },
      {
        title: "Admin Overview",
        url: "/admin",
        roles: [Role.ADMIN],
        icon: Settings,
        isActive: isActive("/admin"),
      },
      {
        title: "Pages",
        url: "/admin/pages",
        roles: [Role.ADMIN, Role.EDITOR],
        icon: FileText,
        isActive: reference.startsWith("/admin/pages"),
      },
      {
        title: "Inquiries",
        url: "#",
        roles: [Role.ADMIN],
        icon: MessageSquare,
        isActive: reference.startsWith("/admin/contacts") || reference.startsWith("/admin/memberships") || reference.startsWith("/admin/applications") || reference.startsWith("/admin/consultations"),
        items: [
          { title: "Contact Us", url: "/admin/contacts", isActive: isActive("/admin/contacts") },
          { title: "Consultations", url: "/admin/consultations", isActive: isActive("/admin/consultations") },
          { title: "Applications", url: "/admin/applications", isActive: isActive("/admin/applications") },
          { title: "Ladies in Tech", url: "/admin/ladies-in-tech", isActive: isActive("/admin/ladies-in-tech") },
        ]
      },
      {
        title: "Users",
        url: "/users",
        roles: [Role.ADMIN],
        icon: Users,
        isActive: isActive("/users"),
      },
      {
        title: "Profile",
        url: "/profile",
        roles: [Role.ADMIN, Role.EDITOR, Role.USER],
        icon: User,
        isActive: isActive("/profile"),
      },
    ],
    publicNav: [
      { name: 'Home', href: '/', icon: Home, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Services', href: '/services', icon: Book, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Team', href: '/team', icon: Users, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Ladies In Tech & Leadership', href: '/ladies-in-tech', icon: Heart, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'The CIO & C-Suite Awards', href: 'https://www.thecioclubafrica.com/awards', icon: Trophy, roles: [Role.ADMIN, Role.EDITOR, Role.USER], target: '_blank' },
      { name: 'Contact', href: '/contact', icon: Globe, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
    ],
    privateNav: [
      { name: 'Home', href: '/', icon: Home, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Services', href: '/services', icon: Book, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Team', href: '/team', icon: Users, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Ladies In Tech & Leadership', href: '/ladies-in-tech', icon: Heart, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'The CIO & C-Suite Awards', href: 'https://www.thecioclubafrica.com/awards', icon: Trophy, roles: [Role.ADMIN, Role.EDITOR, Role.USER], target: '_blank' },
      { name: 'Contact', href: '/contact', icon: Globe, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.EDITOR, Role.USER] },
    ],
  };

  return data;
};

export const emptyMetalist: iFetchMeta = {
  total: 0,
  meta: { cursor: '', more: false, size: 0 },
  data: []
};
