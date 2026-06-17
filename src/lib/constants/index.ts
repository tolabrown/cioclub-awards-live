import Logo from "$lib/components/icons/logo.svelte";
import type { iFetchMeta } from "$lib/interface";
import { FileText, LayoutDashboard, User, Users, Home, Book, Music, Heart, Globe, Lightbulb, Cross, Mail, ShieldCheck, MailSearch, Award, Trophy, Handshake, Building2, Activity } from "@lucide/svelte";

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  MEMBER_FREE = 'member_free',
  MEMBER_INDIVIDUAL = 'member_individual',
  MEMBER_CORPORATE = 'member_corporate',
  EXECUTIVE = 'executive',
  SPONSOR = 'sponsor',
  PARTNER = 'partner',
}

export enum Fields {
  USER = 'user',
  JURY = 'jury',
  GALLERY_MEDIA = 'gallery',
  NEWS = 'news',
  AWARDS_ENTRY = 'awards_entry',
  NOMINEE = 'nominee',
  SPONSORSHIP = 'sponsorship',
  AWARD_WINNER = 'award_winner',
  AWARDS_TEAM = 'awards_team'
}

export const MAX_ITEMS_PER_PAGE = 12;

export enum Constants {
  BRANDNAME = 'The CIO & C-Suite Club Africa',
  TAGLINE = 'Elite IT Network',
  CREDENTIAL = 'credential',
  GOOGLE = 'google',
  AFTERAUTH = '/dashboard',
  SUPPORTEMAIL = 'info@thecioclubafrica.com',
  BRANDWEBSITE = 'https://www.thecioclubafrica.com',
  FACEBOOK = 'https://www.facebook.com/thecioclubafrica?mibextid=LQQJ4d',
  TWITTER = 'https://x.com/thcioclubafrica?s=21',
  YOUTUBE = 'https://www.youtube.com/watch?v=E55bGJXLLM8',
  LINKEDIN = 'https://www.linkedin.com/company/the-cio-club-africa/',
  INSTAGRAM = 'https://www.instagram.com/thecioclubafrica?igsh=MzRlODBiNWFlZA==',
  SUPPORTPHONE = '+2348102668340',
  WHATSAPP = 'https://wa.me/2348102668340',
  ADESEWA_PHONE = '+2348102668340',
  ADESEWA_WHATSAPP = 'https://wa.me/2348102668340',
}

export type FileType = 'audio' | 'video' | 'file' | 'image';

// Site Meta for SEO/OG tags
export const SiteMeta = {
  title: 'The CIO & C-Suite Awards Africa',
  description: 'Driving digital transformation and excellence through collaboration and innovation for IT leaders in Africa.',
  keywords: ['CIO', 'IT Leadership', 'Africa', 'Digital Transformation', 'Tech Events'],
  ogimage: 'https://www.thecioclubafrica.com/screenshot-wide.webp',
  link: 'https://www.thecioclubafrica.com',
};

// Awards page carousel content
export const AwardsHeroContent = [
  {
    subtitle: "Continental Excellence",
    title: "Leading The Next Africa",
    description: "Celebrating IT leadership across 15 African countries across different sectors. Discover the visionaries shaping the continent's digital future.",
    mobileImage: "/awards_hero_backgrounds/awards-0_1920x1080.webp",
    desktopImage: "/awards_hero_backgrounds/awards-0_1920x720.webp",
    primaryCta: { text: "Nominate Now", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
    secondaryCta: { text: "Sponsorship", href: "/awards/sponsorship" },
  },
  {
    subtitle: "Innovation & Leadership",
    title: "Rewarding Visionaries Across Africa",
    description: "Celebrating excellence across the continent's major economic hubs in Banking, Fintech & Financial Services, FMCG, and beyond.",
    mobileImage: "/awards_hero_backgrounds/awards-1_1920x1080.webp",
    desktopImage: "/awards_hero_backgrounds/awards-1_1920x720.webp",
    primaryCta: { text: "View Categories", href: "/awards/categories" },
    secondaryCta: { text: "Nominate Now", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  },
];

export const AwardCategories = [
  { id: 1, title: "Fintech & Financial Services", description: "Recognizing excellence and innovation in financial technology and services across Africa.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 2, title: "E-commerce", description: "Celebrating pioneers in digital retail and online marketplace solutions.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 3, title: "Healthtech", description: "Honoring digital solutions transforming healthcare delivery and accessibility.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 4, title: "Agritech", description: "Recognizing technology-driven innovations in agriculture and food security.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 5, title: "Cleantech / Energy", description: "Celebrating sustainable technology and digital innovation in the energy sector.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 6, title: "AI & Data", description: "Honoring excellence in artificial intelligence and data-driven transformation.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 7, title: "Education", description: "Recognizing digital pioneers in EdTech and lifelong learning initiatives.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 8, title: "Media", description: "Celebrating digital transformation in broadcasting, publishing, and digital media.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 9, title: "Telecommunication", description: "Honoring leadership in connectivity and telecom infrastructure innovation.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
  { id: 10, title: "Technology Services", description: "Recognizing excellence in IT consulting, managed services, and software delivery.", href: "https://zfrmz.com/ehOL2qeENHenXNdwxiLi" },
];

export const ClubHeroContent = [
  {
    subtitle: "Premier IT Leadership Platform",
    title: "The CIO & C-Suite Club Africa",
    description: "Empowering Africa's digital leadership through strategic collaboration, world-class networking, and groundbreaking innovation.",
    mobileImage: "/club_hero_backgrounds/cio_0_1920x1080.webp",
    desktopImage: "/club_hero_backgrounds/cio_0_1920x720.webp",
    primaryCta: { text: "Explore Membership", href: "/membership" },
    secondaryCta: { text: "About the Club", href: "/about" },
  },
  {
    subtitle: "Digital Transformation Think-Tank",
    title: "Driving Policy and Innovation",
    description: "Bridging the gap between theory and practice. We provide strategic insights that shape the digital landscape of the continent.",
    mobileImage: "/club_hero_backgrounds/cio_1_1920x1080.webp",
    desktopImage: "/club_hero_backgrounds/cio_1_1920x720.webp",
    primaryCta: { text: "Read Insights", href: "/news" },
    secondaryCta: { text: "Our Mission", href: "/about#mission" },
  },
  {
    subtitle: "High-Impact Networking",
    title: "Scale Your Strategic Impact",
    description: "Join a peer network of strategic leaders. Gain exclusive access to research, networking, and leadership development programs.",
    mobileImage: "/club_hero_backgrounds/cio_2_1920x1080.webp",
    desktopImage: "/club_hero_backgrounds/cio_2_1920x720.webp",
    primaryCta: { text: "Join the Community", href: "/membership/" },
    secondaryCta: { text: "Upcoming Events", href: "/events" },
  },
];

export const HomepageContent = {
  hero: {
    subtitle: 'Premier IT Leadership Platform',
    title: 'The CIO Club Africa',
    description: 'Empowering Africa\'s digital leadership through strategic collaboration, world-class networking, and groundbreaking innovation.',
    primaryCta: { text: 'Explore More', href: '/membership' },
    secondaryCta: { text: 'Watch Video', href: '/#video' },
    loggedInCta: { text: 'Member Portal', href: '/dashboard' },
  },
  mission: {
    tag: 'Our Mission',
    title: 'Driving Continental Transformation',
    description: 'A premier community for C-level executives driving digital transformation across the African continent. We bridge the gap between policy and practice through shared expertise and collective action.',
    cta: { text: 'Read Our Story', href: '/about' },
    imageUrl: '/team/abiola_laseinde.webp',
  },
  pillars: [
    {
      title: 'Advocacy',
      description: 'Policy influence and representation at the highest levels of governance.',
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Think-Tank',
      description: 'Strategic insights and collaborative policy whitepapers for digital growth.',
      icon: 'Lightbulb',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Empowerment',
      description: 'Next-gen leadership coaching and high-impact networking events.',
      icon: 'Heart',
      color: 'text-accent-gold',
      bgColor: 'bg-accent-gold/10'
    },
    {
      title: 'Research & Development',
      description: 'Exploring future-tech frontiers and disruptive innovation frameworks.',
      icon: 'Globe',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ],
  stats: [
    { value: '500+', label: 'Members', emoji: '👥', gradient: 'from-blue-600 to-indigo-600' },
    { value: '15+', label: 'African Countries', emoji: '🌍', gradient: 'from-green-600 to-emerald-600' },
    { value: '20+', label: 'Annual Events', emoji: '📅', gradient: 'from-orange-600 to-red-600' },
    { value: '100+', label: 'Tech Partners', emoji: '🤝', gradient: 'from-purple-600 to-pink-600' },
  ],
  testimonials: [],
};

// Utility function for background images
export const getStyle = (imageUrl: string) => `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`;

export const documentationRoles = [Role.ADMIN, Role.EDITOR, Role.USER, Role.MEMBER_FREE, Role.MEMBER_INDIVIDUAL, Role.MEMBER_CORPORATE, Role.EXECUTIVE, Role.SPONSOR, Role.PARTNER];
export const dashboardRoles = [Role.ADMIN, Role.EDITOR, Role.MEMBER_FREE, Role.MEMBER_INDIVIDUAL, Role.MEMBER_CORPORATE, Role.EXECUTIVE, Role.SPONSOR, Role.PARTNER];
export const usersRoles = [Role.ADMIN];
export const profileRoles = [Role.ADMIN, Role.EDITOR, Role.USER, Role.MEMBER_FREE, Role.MEMBER_INDIVIDUAL, Role.MEMBER_CORPORATE, Role.EXECUTIVE, Role.SPONSOR, Role.PARTNER];
export const homeRoles = [Role.ADMIN, Role.EDITOR, Role.USER, Role.MEMBER_FREE, Role.MEMBER_INDIVIDUAL, Role.MEMBER_CORPORATE, Role.EXECUTIVE, Role.SPONSOR, Role.PARTNER];
export const membersRoles = [Role.EDITOR, Role.MEMBER_FREE, Role.MEMBER_INDIVIDUAL, Role.MEMBER_CORPORATE, Role.EXECUTIVE, Role.SPONSOR, Role.PARTNER];

export const roles = [
  { label: 'Admin', value: Role.ADMIN },
  { label: 'Editor', value: Role.EDITOR },
  { label: 'User', value: Role.USER },
  { label: 'Member (Free)', value: Role.MEMBER_FREE },
  { label: 'Member (Individual)', value: Role.MEMBER_INDIVIDUAL },
  { label: 'Member (Corporate)', value: Role.MEMBER_CORPORATE },
  { label: 'Executive', value: Role.EXECUTIVE },
  { label: 'Sponsor', value: Role.SPONSOR },
  { label: 'Partner', value: Role.PARTNER },
];

export const getNavigation = (reference: string) => {
  const isActive = (url: string) => reference === url;

  return {
    teams: [
      {
        name: Constants.BRANDNAME,
        logo: Logo,
        plan: "Elite IT Network",
        url: "/"
      },
    ],
    navPlatform: [
      {
        title: "Dashboard",
        url: "/dashboard",
        roles: dashboardRoles,
        icon: LayoutDashboard,
        isActive: isActive("/dashboard"),
      },
      {
        title: "Users",
        url: "/users",
        roles: usersRoles,
        icon: User,
        isActive: isActive("/users"),
      },
      {
        title: "Profile",
        url: "/profile",
        roles: profileRoles,
        icon: User,
        isActive: isActive("/profile"),
      },
      {
        title: "Community",
        url: "/community",
        roles: profileRoles,
        icon: Users,
        isActive: isActive("/community"),
      },
      {
        title: "Member Directory",
        url: "/members",
        roles: membersRoles,
        icon: Users,
        isActive: isActive("/members"),
      },
    ],
    navAdmin: [
      {
        title: "Dashboard",
        url: "/admin",
        roles: adminRoles,
        icon: ShieldCheck,
        isActive: isActive("/admin"),
      },
      {
        title: "Admin",
        url: "/admin/pages",
        roles: adminRoles,
        icon: LayoutDashboard,
        isActive: isActive("/admin/pages"),
      },
      {
        title: "Contacts",
        url: "/admin/contacts",
        roles: adminRoles,
        icon: MailSearch,
        isActive: isActive("/admin/contacts"),
      },
      {
        title: "Members",
        url: "/admin/members",
        roles: adminRoles,
        icon: Users,
        isActive: isActive("/admin/members"),
      },
      {
        title: "Corporations",
        url: "/corporate",
        roles: adminRoles,
        icon: Building2,
        isActive: isActive("/corporate"),
      },
      {
        title: "Nominees",
        url: "/admin/nominees",
        roles: adminRoles,
        icon: Award,
        isActive: isActive("/admin/nominees"),
      },
      {
        title: "Award Entries",
        url: "/admin/awardsentry",
        roles: adminRoles,
        icon: Trophy,
        isActive: isActive("/admin/awardsentry"),
      },
      {
        title: "Sponsorship",
        url: "/admin/sponsorship",
        roles: adminRoles,
        icon: Handshake,
        isActive: isActive("/admin/sponsorship"),
      },
      {
        title: "Activity Log",
        url: "/admin/logs",
        roles: adminRoles,
        icon: Activity,
        isActive: isActive("/admin/logs"),
      },
    ],
    publicNav: [
      { name: 'Home', href: '/', icon: Home },
      { name: 'About', href: '/about', icon: Users },
      { name: 'Membership', href: '/membership', icon: Heart },
      { name: 'Events', href: '/events', icon: Lightbulb },
      { name: 'Awards', href: '/awards', icon: Music },
      { name: 'Partnerships', href: '/partnerships', icon: Globe },
      { name: 'Contact', href: '/contact', icon: Mail },
    ],
    privateNav: [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Community', href: '/community', icon: Users },
    ],
  };
};

export const adminRoles = [Role.ADMIN];

export const emptyMetalist: iFetchMeta = {
  total: 0,
  meta: { cursor: '', more: false, size: 0 },
  data: []
};

export const EDITABLE_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/awards', name: 'Awards' },
  { path: '/membership', name: 'Membership' },
  { path: '/events', name: 'Events' },
  { path: '/partnerships', name: 'Partnerships' },
  { path: '/contact', name: 'Contact' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/news', name: 'News' },
  { path: '/team', name: "Our Team" },
  { path: '/donate', name: 'Donate' },
];
