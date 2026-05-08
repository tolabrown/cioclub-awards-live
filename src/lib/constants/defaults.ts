export const LIT_DEFAULT = {
  title: "Ladies In Tech | Edniesal Consulting",
  description: "The Ladies in Tech Network (LIT Network) is a platform dedicated to celebrating and empowering women in technology across Africa.",
  bannerImage: "/ladies_in_tech_1920x720.webp",
  content: "Providing a nurturing ecosystem where women in technology can thrive, innovate, and lead the digital transformation across Africa.",
  mission: "Our mission is to provide a nurturing ecosystem where women in technology can thrive, innovate, and lead the digital transformation across Africa through networking, mentorship, and empowerment.",
  policy: "We are committed to fostering an inclusive environment that promotes gender equality and professional growth for women in the technology sector.",
  pillars: [
    { icon: "Users", title: "Community", desc: "Building a supportive network of peers and mentors." },
    { icon: "Globe", title: "Global Reach", desc: "Connecting African tech talent with international opportunities." },
    { icon: "Sparkles", title: "Innovation", desc: "Encouraging unconventional thinking and digital solutions." }
  ]
};

export const MEMBERSHIP_DEFAULT = {
  hero: {
    badge: "Membership",
    title: "Join Africa's Elite IT Network",
    description: "Unlock exclusive opportunities, strategic insights, and a community of peers driving Africa's digital agenda."
  },
  tiers: [
    {
      name: "Student",
      id: "student",
      tagline: "Emerging Talent",
      price: "₦20k",
      period: "/year",
      amount: 20000,
      description: "For undergraduates or fresh graduates seeking exposure to the tech and leadership ecosystem.",
      features: [
        { text: "Internship opportunities", included: true },
        { text: "Career mentorship & webinars", included: true },
        { text: "Discounted program access", included: true },
        { text: "CSV & Tech exposure visits", included: true },
        { text: "Digital membership card", included: true }
      ],
      cta: "Join as Student",
      href: "#",
      popular: false,
      iconName: "GraduationCap",
      color: "slate-400"
    },
    {
      name: "Entry-Level",
      id: "entry-level",
      tagline: "Rising Professional",
      price: "₦50k",
      period: "/year",
      amount: 50000,
      description: "For young professionals with 1–3 years of experience in tech or business roles.",
      features: [
        { text: "Career-focused training", included: true },
        { text: "Partner event discounts", included: true },
        { text: "50% off Club programs", included: true },
        { text: "Community networking", included: true },
        { text: "Internal role recommendations", included: true },
        { text: "Lekki Colosseum discounts", included: true }
      ],
      cta: "Join Now",
      href: "#",
      popular: false,
      iconName: "Briefcase",
      color: "blue-500"
    },
    {
      name: "Executive",
      id: "executive",
      tagline: "Digital Leader",
      price: "₦200k",
      period: "/year",
      amount: 200000,
      description: "For mid to senior-level professionals, founders, and C-suite executives.",
      features: [
        { text: "Free/Discounted Flagship access", included: true },
        { text: "Executive retreats & private events", included: true },
        { text: "Media & Professional visibility", included: true },
        { text: "Strategic group discussions", included: true },
        { text: "Hotel & Golf club discounts", included: true },
        { text: "Lekki Colosseum discounts", included: true }
      ],
      cta: "Become an Executive",
      href: "#",
      popular: true,
      iconName: "Crown",
      color: "primary"
    },
    {
      name: "Corporate SME",
      id: "corporate-sme",
      tagline: "Business Growth",
      price: "₦500k",
      period: "/year",
      amount: 500000,
      description: "For SMEs looking to sponsor staff (3 members) and gain strategic visibility.",
      features: [
        { text: "Exhibition opportunities", included: true },
        { text: "Media feature/Podcast", included: true },
        { text: "Tier 1 vendor referrals", included: true },
        { text: "Bulk staff sponsorship (3)", included: true },
        { text: "Premium venue discounts", included: true }
      ],
      cta: "Register Organization",
      href: "#",
      popular: false,
      iconName: "Building2",
      color: "accent-gold"
    },
    {
      name: "Corporate Enterprise",
      id: "corporate-enterprise",
      tagline: "Institutional Legacy",
      price: "₦1m",
      period: "/year",
      amount: 1000000,
      description: "For large organizations driving innovation and strategic partnerships.",
      features: [
        { text: "Exhibition opportunities", included: true },
        { text: "Media feature/Podcast", included: true },
        { text: "Tier 1 vendor referrals", included: true },
        { text: "Bulk staff sponsorship (3)", included: true },
        { text: "Premium venue discounts", included: true }
      ],
      cta: "Register Organization",
      href: "#",
      popular: false,
      iconName: "Globe",
      color: "accent-gold"
    },
    {
      name: "Legacy Membership",
      id: "legacy",
      tagline: "Lifetime Recognition",
      price: "One-off",
      period: "Lifetime",
      amount: 0,
      description: "The highest recognition granted by the Club for individuals with exceptional contributions to technology leadership and digital transformation.",
      features: [
        { text: "Permanent membership status", included: true },
        { text: "No annual renewal fees", included: true },
        { text: "Founding/Distinguished Member", included: true },
        { text: "Exclusive advisory councils", included: true },
        { text: "Leadership Advisory Board", included: true },
        { text: "Public recognition at events", included: true }
      ],
      cta: "Apply for Legacy",
      href: "#",
      popular: false,
      iconName: "ShieldCheck",
      color: "indigo-600"
    }
  ],
  comparison: {
    title: "Tier Comparison",
    rows: [
      { label: "Community Access", value: "All Tiers", badge: true },
      { label: "Physical Events", value: "Individual+", badge: true },
      { label: "LITL Sessions", value: "Individual+", badge: true },
      { label: "Mentorship", value: "Individual", badge: false },
      { label: "Panel Discussions/Executive round table", value: "Executive & Above", badge: true },
      { label: "VIP Roundtables", value: "Corporate Only", badge: false },
      { label: "Voting Rights", value: "Individual", badge: false }
    ]
  },
  joinSteps: [
    { title: "Choose Category", desc: "Select the membership tier that aligns with your professional standing." },
    { title: "Submit Application", desc: "Fill out your professional profile. [Click here to start your application](#tiers)." },
    { title: "Payment & Verification", desc: "Secure payment of the annual fee via our verified gateway. Gain access to the member portal immediately." },
    { title: "Review Process", desc: "Our membership committee reviews applications to maintain community standards." },
    { title: "Onboarding", desc: "Receive your digital welcome pack and login to the member portal." }
  ],
  corporate: {
    title: "Corporate Memberships",
    description: "Interested in institutional packages for your entire technology leadership team? Unlock bulk benefits and strategic advisory seats.",
    cta: "Inquire About Corporate",
    contact: {
      phone: "+2348102668340",
      email: "info@thecioclubafrica.com",
      website: "www.thecioclubafrica.com"
    }
  }
};