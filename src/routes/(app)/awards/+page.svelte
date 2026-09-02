<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card";
  import {
    Trophy,
    Award,
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    ArrowUpRight,
    Globe,
    Shield,
    Lightbulb,
    Handshake,
    HelpCircle,
    Calendar,
    MapPin,
    Clock,
    Ticket,
    Sparkles,
    Building2,
    GraduationCap,
    PartyPopper,
    Mic,
    Crown,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { cn } from "$lib/utils";
  import AwardsHero from "$lib/components/sections/awards-hero.svelte";

  let { data } = $props();

  const stats = [
    { value: "7th", label: "Edition", desc: "Years of Continental Impact", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { value: "1,000+", label: "Executives", desc: "CIOs, CTOs & Leaders", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { value: "13", label: "Countries", desc: "Pan-African Representation", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { value: "1", label: "Night of Recognition", desc: "Gala & Awards Celebration", icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const whyAttendItems = [
    "Connect with 1,000+ verified members of Africa's technology leadership community",
    "Sit in on conference sessions and breakout rooms built for deeper industry conversations",
    "Explore exhibitions from leading technology brands and solution providers",
    "Celebrate the achievements of this year's honorees",
    "Network with peers, partners, and decision makers shaping enterprise tech across the continent",
  ];

  const eventHighlights = [
    {
      title: "Conference",
      desc: "Keynotes and panel discussions on the trends shaping enterprise technology in Africa.",
      icon: Users,
      badge: "Main Stage",
    },
    {
      title: "Breakout Rooms",
      desc: "Focused sessions for deeper conversations on specific industry topics. Participants of this get a certification.",
      icon: GraduationCap,
      badge: "Certification Included",
      highlight: true,
    },
    {
      title: "Exhibitions",
      desc: "Technology brands and solution providers showcasing their cutting-edge offerings.",
      icon: Building2,
      badge: "Tech Expo",
    },
    {
      title: "Awards Night",
      desc: "The evening celebration honoring this year's honorees across Africa.",
      icon: PartyPopper,
      badge: "Gala Dinner",
    },
  ];

  // ============================================
  // RECAP OF PREVIOUS EDITION DATA
  // ============================================

  const previousSpeakers = [
    {
      name: "Dele Adeyinka",
      role: "Chief Digital Officer",
      org: "Polaris Bank",
      topic: "Panel: Future of Digital Banking & Financial Inclusion",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773389151092-Dele%20Adeyinka%2C%20Chief%20Digital%20Officer%2C%20Polaris%20Bank.webp&version_id=null",
      badge: "Fintech Leader"
    },
    {
      name: "Olawale Noiki",
      role: "Partner & West Africa Leader",
      org: "Deloitte & Touche",
      topic: "Keynote: Enterprise Technology Leadership & Digital Governance",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773389286462-Olawale%20Noiki%2C%20Partner%20%26%20West%20Africa%20Leader%20Enterprise%20Technology%20%26%20Performance%2C%20Africa%20Consulting%20Services%2C%20Deloitte%20%26%20Touche.jpg.crdownload.webp&version_id=null",
      badge: "Strategy Keynote"
    },
    {
      name: "Ayotunde Coker",
      role: "Chief Executive Officer",
      org: "Open Access Data Centers",
      topic: "Panel: Data Center Infrastructure Driving Africa's AI Evolution",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314692707-ayotunde_coker.webp&version_id=null",
      badge: "Infrastructure Leader"
    },
    {
      name: "Taiwo Afolayan",
      role: "Head, Digital & E-Business Control",
      org: "Stanbic IBTC",
      topic: "Panel: Enterprise Cyber Resilience & Cloud Control",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773389453168-Taiwo%20Afolayan%2C%20%20Head%2C%20Digital%20%26%20E-Business%20Control%2C%20Stanbic%20IBTC.webp&version_id=null",
      badge: "Security Speaker"
    },
    {
      name: "Dr. Ademola Aladekomo",
      role: "Chairman",
      org: "Chams Group",
      topic: "Keynote: 3 Decades of Tech Innovation & Identity in Africa",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314573542-ademola_aladekomo.webp&version_id=null",
      badge: "Pioneer Keynote"
    },
    {
      name: "Ehia Erhaboh",
      role: "Co-Convener",
      org: "AI in Nigeria",
      topic: "Breakout: Practical Enterprise AI Adoption & High-ROI Use Cases",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773389177744-Ehia%20Erhaboh%2C%20Co-Convener%2C%20AI%20in%20Nigeria.webp&version_id=null",
      badge: "AI & Innovation"
    },
    {
      name: "Nicholas Bortey",
      role: "Founder & Technology Strategist",
      org: "Liranz Ghana",
      topic: "Session: Regional IT Integration & Cross-Border Scale",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1774379479372-nicholas_bortey.webp&version_id=null",
      badge: "Pan-African Leader"
    },
    {
      name: "Ade Bajomo",
      role: "President",
      org: "FinTech Association of Nigeria",
      topic: "Keynote: Capitalizing on African Digital Transformation",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314527410-ade_bajomo.webp&version_id=null",
      badge: "Keynote Speaker"
    }
  ];

  const previousSponsors = [
    {
      name: "FrieslandCampina",
      category: "Platinum Sponsor",
      sector: "FMCG / Nutrition",
      desc: "Empowering tech leadership & digital supply chain innovation across Africa.",
      logo: "/partners/friesland_campina_nin.webp",
      badge: "Platinum Partner"
    },
    {
      name: "Nigerian Breweries PLC",
      category: "Gold Sponsor",
      sector: "Manufacturing & Beverage",
      desc: "Championing industrial automation and digital factory transformation.",
      logo: "/partners/nigerian_breweries_plc.webp",
      badge: "Gold Partner"
    },
    {
      name: "Nestle Nigeria",
      category: "Corporate Partner",
      sector: "Food & Beverage",
      desc: "Driving enterprise sustainability and smart technology deployment.",
      logo: "/partners/nestle_nigeria.webp",
      badge: "Corporate Partner"
    },
    {
      name: "NBC (Coca-Cola Hellenic)",
      category: "Enterprise Partner",
      sector: "Bottling & Distribution",
      desc: "Supporting digital excellence and operational agility across Africa.",
      logo: "/partners/nbc.webp",
      badge: "Enterprise Partner"
    },
    {
      name: "UniCloud Africa",
      category: "Technology Sponsor",
      sector: "Cloud Infrastructure",
      desc: "Powering sovereign cloud solutions and data residency for African firms.",
      logo: "/partners/unicloud_africa.webp",
      badge: "Cloud Partner"
    },
    {
      name: "Guinness Nigeria (Diageo)",
      category: "Strategic Partner",
      sector: "Consumer Goods",
      desc: "Fostering inclusive tech leadership and executive networking platforms.",
      logo: "/partners/guinness_nigeria.webp",
      badge: "Strategic Partner"
    },
    {
      name: "Golden Penny Foods (FMN)",
      category: "Corporate Sponsor",
      sector: "Agro-Allied & FMCG",
      desc: "Enabling digital agricultural logistics and food supply resilience.",
      logo: "/partners/goldenpenny_foods.webp",
      badge: "Corporate Sponsor"
    },
    {
      name: "PFS (Payment Solutions)",
      category: "Fintech Sponsor",
      sector: "Financial Technology",
      desc: "Building secure, high-throughput financial switches for African banking.",
      logo: "/partners/pfs.webp",
      badge: "Fintech Partner"
    },
    {
      name: "SBC (Seven-Up Bottling Co.)",
      category: "Event Partner",
      sector: "Manufacturing",
      desc: "Supporting enterprise IT development and executive talent initiatives.",
      logo: "/partners/sbc.webp",
      badge: "Event Partner"
    }
  ];

  const previousWinners = [
    {
      name: "Shoyinka Shodunke",
      awardType: "Overall CIO of the Year",
      org: "MTN Nigeria Communications Plc",
      year: "2025",
      desc: "Recognized for continental leadership in 5G rollout, enterprise agility, and large-scale cloud modernization.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1771773757060-telecommunications_shoyinka_shodunke_ChiefInformationOfficerMTNNigeriaCommunicationsPlc.webp&version_id=null",
      badge: "CIO of the Year"
    },
    {
      name: "Ade Bajomo",
      awardType: "Special Recognition Award",
      org: "President, FinTech Association of Nigeria",
      year: "2025",
      desc: "Honored for pioneering financial technology architecture and open banking standards in West Africa.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314527410-ade_bajomo.webp&version_id=null",
      badge: "Special Recognition"
    },
    {
      name: "Busola Tejumola",
      awardType: "Digital Transformation Leader",
      org: "Executive Head, MultiChoice Group",
      year: "2025",
      desc: "Celebrated for broadcast technology innovation, OTT content delivery, and audience analytics scale.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314788106-busola_tejumola.webp&version_id=null",
      badge: "Digital Pioneer"
    },
    {
      name: "Ayotunde Coker",
      awardType: "Technology Ecosystem Award",
      org: "CEO, Open Access Data Centers",
      year: "2025",
      desc: "Pioneering hyperscale and edge data centre deployment across major commercial corridors in Africa.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314692707-ayotunde_coker.webp&version_id=null",
      badge: "Ecosystem Builder"
    },
    {
      name: "Agnes Gathaiya",
      awardType: "Pan-African Tech Leadership",
      org: "East Africa Technology Executive",
      year: "2025",
      desc: "Recognized for exemplary enterprise expansion, digital empowerment, and technology leadership in East Africa.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314658780-agnes_gathaiya.webp&version_id=null",
      badge: "Leadership Award"
    },
    {
      name: "Dr. Ademola Aladekomo",
      awardType: "Lifetime Achievement Award",
      org: "Chairman, Chams Group",
      year: "2025",
      desc: "Honoring over 3 decades of indigenous identity management, payment card systems, and tech infrastructure.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314573542-ademola_aladekomo.webp&version_id=null",
      badge: "Lifetime Honoree"
    },
    {
      name: "Markie Idowu",
      awardType: "Fintech Executive of the Year",
      org: "MD/CEO, Xpress Payment Solutions",
      year: "2025",
      desc: "Championing secure digital transactions, frictionless payment infrastructure, and financial inclusion.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314828189-markie_idowu.webp&version_id=null",
      badge: "Fintech Leader"
    },
    {
      name: "Mojisola Ologe",
      awardType: "Risk & Governance Honoree",
      org: "Chief Risk & Compliance Officer, Hydrogen",
      year: "2025",
      desc: "Recognized for setting benchmark risk frameworks and governance in digital payment architectures.",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1773314855100-mojisola_ologe.webp&version_id=null",
      badge: "Governance Award"
    }
  ];

  // ============================================
  // 2026 CONFERENCE SPEAKERS (KEYNOTE & PANELS)
  // ============================================

  const keynoteSpeakers = [
    {
      id: 1,
      title: "Opening Ministerial Keynote",
      role: "Ministerial Keynote Address",
      organization: "Federal Ministry of Communications, Innovation & Digital Economy",
      topic: "Pan-African Digital Sovereignty: Policy, Infrastructure & The Future Economy",
      category: "Government & Policy",
      badge: "Opening Keynote",
      placeholderIcon: Mic,
      gradient: "from-amber-500/20 via-primary/10 to-transparent",
      badgeColor: "bg-amber-500 text-slate-950",
    },
    {
      id: 2,
      title: "Banking & FinTech Keynote",
      role: "Financial Services Keynote Address",
      organization: "Leading Tier-1 Banking Institution & Financial Switch",
      topic: "The Future of Open Banking, AI-Driven Risk & Cross-Border Payments in Africa",
      category: "Fintech & Banking",
      badge: "Industry Keynote",
      placeholderIcon: Building2,
      gradient: "from-blue-500/20 via-primary/10 to-transparent",
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: 3,
      title: "Telecommunications & Cloud Keynote",
      role: "Chief Executive Keynote Address",
      organization: "Pan-African Telecommunications & Infrastructure Giant",
      topic: "Hyper-Connectivity: Expanding 5G, Terrestrial Fiber & Cloud Edge Across Africa",
      category: "Telecom & Cloud",
      badge: "Tech Visionary",
      placeholderIcon: Globe,
      gradient: "from-emerald-500/20 via-primary/10 to-transparent",
      badgeColor: "bg-emerald-500 text-slate-950",
    },
    {
      id: 4,
      title: "Enterprise AI & Cloud Keynote",
      role: "Global Technology Keynote Address",
      organization: "Multinational Enterprise Cloud & AI Provider",
      topic: "Scalable Enterprise AI: From Predictive Insights to Autonomous Operations",
      category: "Artificial Intelligence",
      badge: "Innovation Keynote",
      placeholderIcon: Sparkles,
      gradient: "from-purple-500/20 via-primary/10 to-transparent",
      badgeColor: "bg-purple-500 text-white",
    },
    {
      id: 5,
      title: "CIO Club Pan-African Keynote",
      role: "Convener & Board Keynote Address",
      organization: "The CIO Club Africa & Edniesal Consulting",
      topic: "Leading The Next Africa: Transforming C-Suite IT Leadership & Corporate Governance",
      category: "Executive Leadership",
      badge: "Closing Keynote",
      placeholderIcon: Trophy,
      gradient: "from-amber-500/25 via-primary/15 to-transparent",
      badgeColor: "bg-amber-500 text-slate-950",
    }
  ];

  const panelSessions = [
    {
      id: "panel-1",
      track: "Panel Session 01",
      title: "Fintech Evolution & High-Velocity Payment Infrastructure",
      desc: "Exploring real-time switches, digital currency settlement, fraud mitigation, and next-generation consumer banking.",
      icon: Handshake,
      moderator: "To Be Announced",
      panelists: ["Fintech CTO", "Digital Bank Head", "Payment Switch CEO", "Regulatory Leader"],
      badge: "Fintech Track",
      color: "border-blue-500/40 bg-blue-500/5"
    },
    {
      id: "panel-2",
      track: "Panel Session 02",
      title: "Cyber Resilience & Zero-Trust Architecture for Enterprise",
      desc: "Mitigating sophisticated threats, safeguarding critical sovereign infrastructure, and enforcing proactive cyber defense.",
      icon: Shield,
      moderator: "To Be Announced",
      panelists: ["Chief Information Security Officer", "Cloud Security Lead", "Enterprise Risk Director", "Compliance Head"],
      badge: "Cybersecurity Track",
      color: "border-emerald-500/40 bg-emerald-500/5"
    },
    {
      id: "panel-3",
      track: "Panel Session 03",
      title: "Data Sovereignty, AI Models & Hyperscale Infrastructure",
      desc: "Harnessing localized data centres, African language LLMs, and enterprise AI orchestration for scalable ROI.",
      icon: Sparkles,
      moderator: "To Be Announced",
      panelists: ["Chief Data Officer", "AI Research Lead", "Data Centre Executive", "Infrastructure Architect"],
      badge: "AI & Data Track",
      color: "border-purple-500/40 bg-purple-500/5"
    },
    {
      id: "panel-4",
      track: "Panel Session 04",
      title: "Executive Tech Leadership: Boardroom Alignment & ROI",
      desc: "Navigating IT budget optimization, C-Suite communication, executive talent retention, and agile digital strategy.",
      icon: Users,
      moderator: "To Be Announced",
      panelists: ["Group CIO", "Managing Director", "Chief Transformation Officer", "Board Advisor"],
      badge: "Leadership Track",
      color: "border-amber-500/40 bg-amber-500/5"
    }
  ];

  // ============================================
  // 2026 OFFICIAL SPONSORS (CONFIRMED)
  // ============================================

  const officialSponsors = [
    {
      name: "MTN",
      tier: "Headline Sponsor",
      sector: "Telecommunications & Connectivity",
      logo: "/partners/mtn.png",
      badge: "Headline Partner",
      desc: "Leading telecommunications and digital infrastructure powering enterprise connectivity across Africa."
    },
    {
      name: "Interswitch",
      tier: "Official Fintech Sponsor",
      sector: "Digital Payments & Switching",
      logo: "/partners/interswitch.png",
      badge: "Official Fintech Partner",
      desc: "Africa's leading integrated digital payments and commerce company driving electronic transactions."
    },
    {
      name: "FirstBank",
      tier: "Lead Financial Partner",
      sector: "Banking & Financial Services",
      logo: "/partners/firstbank.jpg",
      badge: "Lead Financial Partner",
      desc: "Premier banking institution with over 130 years of resilience, innovation, and digital banking leadership."
    }
  ];

  // Slideshow States
  let speakerIndex = $state(0);
  let sponsorIndex = $state(0);
  let winnerIndex = $state(0);

  let isSpeakerPaused = $state(false);
  let isSponsorPaused = $state(false);
  let isWinnerPaused = $state(false);

  const currentSpeaker = $derived(previousSpeakers[speakerIndex]);
  const currentSponsor = $derived(previousSponsors[sponsorIndex]);
  const currentWinner = $derived(previousWinners[winnerIndex]);

  onMount(() => {
    const speakerTimer = setInterval(() => {
      if (!isSpeakerPaused) {
        speakerIndex = (speakerIndex + 1) % previousSpeakers.length;
      }
    }, 4200);

    const sponsorTimer = setInterval(() => {
      if (!isSponsorPaused) {
        sponsorIndex = (sponsorIndex + 1) % previousSponsors.length;
      }
    }, 3800);

    const winnerTimer = setInterval(() => {
      if (!isWinnerPaused) {
        winnerIndex = (winnerIndex + 1) % previousWinners.length;
      }
    }, 4600);

    return () => {
      clearInterval(speakerTimer);
      clearInterval(sponsorTimer);
      clearInterval(winnerTimer);
    };
  });
</script>

<svelte:head>
  <title>The CIO & C-Suite Awards Africa 2026 | Awards Hub</title>
  <meta
    name="description"
    content="Join over 1,000 CIOs, C-Suite executives, and innovators for the 7th edition of the CIO & C-Suite Awards Africa on October 27, 2026 at Balmoral Convention Center."
  />
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
  <!-- Hero Section -->
  <AwardsHero items={data.content.hero} />

  <!-- Subheadline & Quick Banner Section -->
  <section class="py-12 bg-muted/30 border-b border-border/40">
    <div class="container mx-auto px-4 text-center max-w-4xl space-y-6">
      <div class="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
        <Calendar class="size-4" />
        <span>October 27, 2026</span>
        <span class="text-primary/40">•</span>
        <Clock class="size-4" />
        <span>12:00 PM WAT</span>
        <span class="text-primary/40">•</span>
        <MapPin class="size-4" />
        <span>Balmoral Convention Center, Victoria Island, Lagos</span>
      </div>

      <h2 class="text-2xl md:text-4xl font-bold tracking-tight leading-snug">
        Join over <span class="text-primary italic">1,000 CIOs, C-Suite executives</span>, and innovators as we celebrate the <span class="text-amber-500 underline decoration-amber-500/40 underline-offset-8">7th edition</span> of the CIO & C-Suite Awards Africa.
      </h2>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          href="https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026"
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          class="rounded-xl shadow-lg shadow-primary/20 font-bold px-8 h-12 gap-2 text-base"
        >
          <Ticket class="size-5" />
          Get your Ticket
          <ArrowRight class="size-4" />
        </Button>

        <Button
          href="#schedule"
          variant="outline"
          size="lg"
          class="rounded-xl font-bold px-8 h-12 gap-2 text-base border-border hover:bg-muted"
        >
          See Event Details
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="py-16 bg-background">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {#each stats as stat}
          <div class="p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-3 group">
            <div class={cn("size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", stat.bg, stat.color)}>
              <stat.icon class="size-7" />
            </div>
            <div class="space-y-1">
              <span class="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground block">
                {stat.value}
              </span>
              <span class="text-sm font-bold uppercase tracking-wider text-primary block">
                {stat.label}
              </span>
              <span class="text-xs text-muted-foreground font-medium block">
                {stat.desc}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Leading The Next Africa & Highlights -->
  <section class="py-20 bg-muted/20 relative overflow-hidden">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row gap-12 items-center">
        <div class="lg:w-1/2 space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Star class="size-4" />
            Leading The Next Africa
          </div>
          <h2 class="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Continental <span class="text-primary italic">Excellence</span>
          </h2>
          <p class="text-lg text-muted-foreground leading-relaxed font-medium">
            The CIO & C-Suite Conference & Awards Africa stands as the continent’s premier platform, celebrating visionary leadership and technological excellence. Now in its seventh year, this pan-African awards platform honors the brightest minds across 13+ countries, celebrating the IT leaders shaping the future of African technology and business.
          </p>
          <div class="pt-2">
            <Button
              href="https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026"
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
              class="rounded-xl shadow-lg shadow-primary/20 font-bold px-6 h-12"
            >
              Get your Ticket
              <ArrowRight class="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <a
          href="/awards/winners/{data.latestWinnerYear}"
          class="lg:w-1/2 w-full group block transition-transform active:scale-[0.98]"
        >
          <div class="aspect-video rounded-2xl overflow-hidden shadow-xl border-border border relative">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div class="rounded-full size-16 bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <ChevronRight class="size-8" />
              </div>
            </div>
            <img
              src={data.highlightWinner?.image?.url || "/images/awards_placeholder.webp"}
              alt={data.highlightWinner?.name || "Awards Highlight"}
              class="w-full h-full object-cover"
            />
            <div class="absolute bottom-6 left-6 z-20 space-y-2">
              <Badge class="bg-primary/90 text-primary-foreground font-bold px-4 py-1 rounded-lg">
                See Highlight
              </Badge>
              {#if data.highlightWinner}
                <div class="bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                  <p class="text-white font-bold text-sm tracking-tight">
                    {data.highlightWinner.name}
                  </p>
                  <p class="text-white/70 text-[10px] font-medium uppercase tracking-wider">
                    {data.highlightWinner.awardType}
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- Event Schedule Section -->
  <section id="schedule" class="py-24 bg-background border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary/30 text-primary">
          <Calendar class="size-3.5 mr-2" />
          Event Schedule
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Leadership, Innovation & Celebration
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          A packed itinerary designed for technical minds, industry leaders, and decision makers.
        </p>
      </div>

      <div class="space-y-12 max-w-5xl mx-auto">
        <!-- Main Event Card -->
        <Card class="rounded-3xl border-2 border-amber-500/30 bg-card overflow-hidden shadow-xl hover:shadow-2xl transition-all">
          <CardHeader class="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent p-8 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <Badge class="bg-amber-500 text-slate-950 font-bold px-3 py-1 text-xs uppercase tracking-wider rounded-md">
                Main Event
              </Badge>
              <h3 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight pt-2">
                October 27, 2026
              </h3>
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-1">
                Balmoral Convention Center, Victoria Island, Lagos
              </p>
            </div>
            <div class="inline-flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 bg-background px-4 py-2 rounded-xl border border-amber-500/30">
              <Trophy class="size-4" />
              Conference, Exhibitions & Awards Night
            </div>
          </CardHeader>
          <CardContent class="p-8 space-y-8">
            <p class="text-base text-muted-foreground leading-relaxed font-medium">
              A full day at the Balmoral Convention Center, Victoria Island, opening with a conference and breakout room sessions, running alongside exhibitions from leading technology brands, and closing with the awards night honoring the leaders driving digital transformation across Africa.
            </p>

            <div class="grid md:grid-cols-2 gap-6 pt-4">
              {#each eventHighlights as item}
                <div class={cn("p-6 rounded-2xl border transition-all space-y-3", item.highlight ? "border-amber-500/50 bg-amber-500/5 shadow-md" : "border-border/60 bg-muted/30")}>
                  <div class="flex items-center justify-between">
                    <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon class="size-6" />
                    </div>
                    <Badge variant={item.highlight ? "default" : "outline"} class={cn("font-bold text-[10px] uppercase tracking-wider", item.highlight && "bg-amber-500 text-slate-950 border-0")}>
                      {item.badge}
                    </Badge>
                  </div>
                  <h5 class="text-lg font-bold text-foreground">{item.title}</h5>
                  <p class="text-sm text-muted-foreground leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>

  <!-- Conference Speakers Section -->
  <section id="speakers" class="py-24 bg-gradient-to-b from-background via-muted/20 to-background border-t border-border/40 relative overflow-hidden">
    <div class="absolute top-1/4 -left-40 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 -right-40 size-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="container mx-auto px-4 relative z-10 max-w-7xl">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-20">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary/30 text-primary bg-primary/5">
          <Mic class="size-3.5 mr-2" />
          Conference Speakers
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Distinguished Speakers & Thought Leaders
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          Hear from visionary policymakers, C-Suite leaders, and tech pioneers shaping the next era of enterprise technology across Africa.
        </p>
      </div>

      <!-- 1. Keynote Speakers -->
      <div class="space-y-8 mb-24">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/60">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
              <Sparkles class="size-4" />
              Main Stage Headliners
            </div>
            <h3 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              1. Keynote Speakers
            </h3>
          </div>
          <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            5 Featured Keynote Addresses
          </p>
        </div>

        <!-- 5 Keynote Speaker Boxes Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {#each keynoteSpeakers as keynote}
            <div class="group relative rounded-3xl border-2 border-border/70 bg-card p-6 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-b {keynote.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div class="relative z-10 space-y-5">
                <!-- Header Badge & Number -->
                <div class="flex items-center justify-between">
                  <Badge class="{keynote.badgeColor} font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 shadow-sm">
                    {keynote.badge}
                  </Badge>
                  <span class="text-xs font-mono font-extrabold text-muted-foreground/60">
                    0{keynote.id}
                  </span>
                </div>

                <!-- Avatar / Placeholder Frame -->
                <div class="relative aspect-square rounded-2xl bg-muted/60 border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-center p-4 group-hover:border-amber-500/40 transition-colors">
                  <div class="size-14 rounded-2xl bg-background/80 border border-border/60 flex items-center justify-center text-primary shadow-inner mb-2 group-hover:scale-110 transition-transform">
                    <keynote.placeholderIcon class="size-7 text-amber-500" />
                  </div>
                  <Badge variant="outline" class="text-[9px] font-bold uppercase tracking-widest bg-background/60 border-primary/20 text-primary">
                    To Be Announced
                  </Badge>
                </div>

                <!-- Content Details -->
                <div class="space-y-2">
                  <h4 class="text-base font-extrabold text-foreground leading-snug group-hover:text-amber-500 transition-colors">
                    {keynote.title}
                  </h4>
                  <p class="text-xs font-semibold text-primary line-clamp-1">
                    {keynote.role}
                  </p>
                  <p class="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {keynote.organization}
                  </p>
                </div>
              </div>

              <!-- Topic Banner Footer -->
              <div class="relative z-10 pt-4 mt-4 border-t border-border/40">
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles class="size-3 text-amber-500" /> Session Topic:
                </p>
                <p class="text-xs font-semibold text-foreground/90 line-clamp-2 leading-relaxed italic">
                  "{keynote.topic}"
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 2. Panel Speakers & Discussions -->
      <div class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/60">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500">
              <Users class="size-4" />
              Executive Breakout Sessions
            </div>
            <h3 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              2. Panel Speakers & Deep-Dive Tracks
            </h3>
          </div>
          <p class="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Interactive Cross-Industry Discussions
          </p>
        </div>

        <!-- Panel Sessions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each panelSessions as panel}
            <div class="rounded-3xl border-2 {panel.color} bg-card p-6 lg:p-8 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <panel.icon class="size-6" />
                    </div>
                    <div>
                      <span class="text-xs font-extrabold uppercase tracking-wider text-primary block">
                        {panel.track}
                      </span>
                      <h4 class="text-xl font-extrabold text-foreground tracking-tight">
                        {panel.title}
                      </h4>
                    </div>
                  </div>
                  <Badge variant="outline" class="font-bold text-[10px] uppercase tracking-wider shrink-0">
                    {panel.badge}
                  </Badge>
                </div>

                <p class="text-sm text-muted-foreground leading-relaxed font-medium">
                  {panel.desc}
                </p>

                <!-- Panelists Placeholder Slots -->
                <div class="pt-2 space-y-2.5">
                  <p class="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Users class="size-3.5 text-primary" /> Panel Composition (4 Panellists):
                  </p>
                  <div class="grid grid-cols-2 gap-2.5">
                    {#each panel.panelists as p}
                      <div class="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                        <div class="size-7 rounded-lg bg-background border border-border/60 flex items-center justify-center text-muted-foreground shrink-0 text-[10px] font-bold">
                          TBA
                        </div>
                        <span class="text-xs font-semibold text-foreground/90 truncate">
                          {p}
                        </span>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                <span class="text-muted-foreground">
                  Moderator: <span class="text-foreground">{panel.moderator}</span>
                </span>
                <span class="inline-flex items-center gap-1 text-primary">
                  Main Stage / Breakout
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Why Attend Section -->
  <section class="py-24 bg-muted/20 border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-primary/30 text-primary">
          <Sparkles class="size-3.5 mr-2" />
          Event Benefits
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Why Attend?
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          Experience an unparalleled ecosystem of technology leadership, insights, and celebration.
        </p>
      </div>

      <!-- 5 Benefit Buckets Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {#each whyAttendItems as benefit, index}
          <div class="p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col justify-start group">
            <div class="space-y-4">
              <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg group-hover:scale-110 transition-transform">
                0{index + 1}
              </div>
              <p class="text-base text-foreground font-semibold leading-relaxed">
                {benefit}
              </p>
            </div>
          </div>
        {/each}
      </div>

      <!-- Distinct CTA Standout Banner Underneath the 5 Points -->
      <div class="mt-12 max-w-6xl mx-auto">
        <div class="p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div class="space-y-2 text-center md:text-left z-10">
            <Badge class="bg-slate-950 text-amber-400 font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
              Limited Seats Available
            </Badge>
            <h3 class="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950">
              Reserve Your Place
            </h3>
            <p class="text-base text-slate-900 font-medium max-w-xl">
              Join 1,000+ technology decision-makers for Africa's most prestigious tech gathering.
            </p>
          </div>

          <div class="z-10 shrink-0">
            <Button href="https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026" target="_blank" rel="noopener noreferrer" size="lg" class="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-8 h-14 rounded-2xl gap-3 shadow-lg text-base">
              <Ticket class="size-5" />
              Get your Ticket
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Official Sponsors Section -->
  <section class="py-20 bg-muted/30 border-t border-border/40 relative overflow-hidden">
    <div class="container mx-auto px-4 max-w-7xl mb-12">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
        <div class="space-y-2">
          <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10">
            <Handshake class="size-3.5 mr-2" />
            2026 Official Sponsors
          </Badge>
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Our Official Sponsors
          </h2>
          <p class="text-base text-muted-foreground font-medium max-w-2xl">
            Proudly supported by Africa's premier financial institutions, digital switching pioneers, and telecommunications leaders.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <Button href="/awards/sponsorship" variant="outline" size="sm" class="rounded-xl font-bold gap-2 text-xs">
            <Building2 class="size-4 text-primary" />
            Become a Sponsor
            <ArrowUpRight class="size-3.5" />
          </Button>
        </div>
      </div>

      <!-- 3 Confirmed Sponsors Featured Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {#each officialSponsors as sponsor}
          <div class="rounded-3xl border-2 border-border/80 bg-card p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-300 space-y-6 group">
            <div class="space-y-5">
              <!-- Tier Badge -->
              <div class="flex items-center justify-between">
                <Badge class="bg-primary/10 text-primary border border-primary/20 font-extrabold text-[10px] uppercase tracking-wider">
                  {sponsor.tier}
                </Badge>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  2026 Partner
                </span>
              </div>

              <!-- High-Contrast Logo Container -->
              <div class="h-28 bg-white dark:bg-white/95 rounded-2xl p-4 flex items-center justify-center border border-border/40 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  class="max-h-20 w-auto max-w-[85%] object-contain filter drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              <!-- Details -->
              <div class="space-y-2">
                <h3 class="text-xl font-extrabold text-foreground">
                  {sponsor.name}
                </h3>
                <p class="text-xs font-semibold text-primary">
                  {sponsor.sector}
                </p>
                <p class="text-xs text-muted-foreground font-medium leading-relaxed">
                  {sponsor.desc}
                </p>
              </div>
            </div>

            <!-- Footer Badge -->
            <div class="pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-bold">
              <span class="text-muted-foreground">Official Status:</span>
              <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Star class="size-3 fill-emerald-500 text-emerald-500" />
                Confirmed Sponsor
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Infinite Scrolling Horizontal Marquee Carousel -->
    <div class="relative w-full overflow-hidden py-4 group border-t border-border/30 bg-muted/20">
      <!-- Gradient Fade Edges -->
      <div class="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background via-background/60 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/60 to-transparent z-10 pointer-events-none"></div>

      <div class="animate-marquee flex gap-8 items-center">
        {#each [...officialSponsors, ...officialSponsors, ...officialSponsors, ...officialSponsors] as sponsor, idx}
          <div class="shrink-0 w-64 md:w-72 p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group/card">
            <div class="size-16 bg-white dark:bg-white/95 rounded-xl p-2 shrink-0 flex items-center justify-center border border-border/40 shadow-inner">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                class="max-h-12 w-auto max-w-[85%] object-contain filter drop-shadow-sm group-hover/card:scale-105 transition-transform"
                loading="lazy"
              />
            </div>
            <div class="overflow-hidden space-y-0.5">
              <span class="text-xs font-extrabold text-foreground truncate block">
                {sponsor.name}
              </span>
              <span class="text-[10px] font-bold text-primary truncate block">
                {sponsor.tier}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Venue Section -->
  <section class="py-24 bg-background border-t border-border/40">
    <div class="container mx-auto px-4 max-w-5xl">
      <Card class="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-2xl">
        <div class="grid lg:grid-cols-12 items-center">
          <div class="lg:col-span-7 p-8 lg:p-12 space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <MapPin class="size-4" />
              Event Venue
            </div>
            <div class="space-y-2">
              <h3 class="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                Balmoral Convention Center
              </h3>
              <p class="text-xl font-bold text-primary">
                Victoria Island, Lagos
              </p>
            </div>
            <p class="text-base text-muted-foreground leading-relaxed font-medium">
              A landmark venue for a landmark night. Full address and access details will be shared upon registration.
            </p>
            <div class="pt-2">
              <Button href="https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026" target="_blank" rel="noopener noreferrer" size="lg" class="rounded-xl shadow-lg shadow-primary/20 font-bold px-8 h-12 gap-2">
                <Ticket class="size-5" />
                Get your Ticket
                <ArrowRight class="size-4" />
              </Button>
            </div>
          </div>

          <div class="lg:col-span-5 relative min-h-[300px] lg:h-full bg-muted">
            <img
              src="/awards_hero_backgrounds/awards-0_1920x1080.webp"
              alt="Balmoral Convention Center"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
              <div class="text-white space-y-1">
                <p class="font-extrabold text-lg">Victoria Island, Lagos</p>
                <p class="text-xs text-white/80 uppercase tracking-widest font-medium">October 27, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </section>

  <!-- Recap of Previous Edition Section -->
  <section class="py-24 bg-gradient-to-b from-muted/30 via-background to-muted/20 border-t border-border/40 relative overflow-hidden">
    <div class="absolute -top-40 right-1/4 size-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 left-1/4 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="container mx-auto px-4 relative z-10">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" class="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-amber-500/40 text-amber-500 bg-amber-500/10">
          <Trophy class="size-3.5 mr-2" />
          Legacy of Excellence
        </Badge>
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          Recap of Previous Edition
        </h2>
        <p class="text-lg text-muted-foreground font-medium">
          A retrospective look at the distinguished keynote speakers, prestigious corporate sponsors, and celebrated industry winners from our past editions.
        </p>
      </div>

      <!-- 3 Slideshow Boxes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        
        <!-- Box 1: Previous Speakers -->
        <div 
          class="rounded-3xl border-2 border-border/70 bg-card p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 relative group overflow-hidden"
          onmouseenter={() => (isSpeakerPaused = true)}
          onmouseleave={() => (isSpeakerPaused = false)}
          role="region"
          aria-label="Previous Speakers Slideshow"
        >
          <div class="space-y-6">
            <!-- Box Header -->
            <div class="flex items-center justify-between pb-4 border-b border-border/60">
              <div class="flex items-center gap-3">
                <div class="size-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Mic class="size-5" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-foreground">Previous Speakers</h3>
                  <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Thought Leaders</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous Speaker"
                  onclick={() => (speakerIndex = (speakerIndex - 1 + previousSpeakers.length) % previousSpeakers.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronLeft class="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next Speaker"
                  onclick={() => (speakerIndex = (speakerIndex + 1) % previousSpeakers.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronRight class="size-4" />
                </button>
              </div>
            </div>

            <!-- Slideshow Content -->
            {#if currentSpeaker}
              <div class="space-y-5 transition-all duration-500">
                <!-- Speaker Photo & Badge -->
                <div class="relative rounded-2xl overflow-hidden aspect-4/3 bg-muted/60 border border-border/60 shadow-inner group-hover:border-amber-500/30 transition-colors">
                  <img
                    src={currentSpeaker.image}
                    alt={currentSpeaker.name}
                    class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <Badge class="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider w-fit mb-1.5">
                      {currentSpeaker.badge}
                    </Badge>
                    <h4 class="text-lg font-extrabold tracking-tight leading-snug text-white">
                      {currentSpeaker.name}
                    </h4>
                    <p class="text-xs text-amber-200/90 font-semibold line-clamp-1">
                      {currentSpeaker.role}
                    </p>
                  </div>
                </div>

                <!-- Organization & Topic Details -->
                <div class="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <div class="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Building2 class="size-3.5 text-primary shrink-0" />
                    <span class="line-clamp-1">{currentSpeaker.org}</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs text-muted-foreground font-medium pt-1 border-t border-border/30">
                    <Sparkles class="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span class="line-clamp-2 leading-relaxed">{currentSpeaker.topic}</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Slide Controls & Indicator Footer -->
          <div class="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              {#each previousSpeakers as _, i}
                <button
                  type="button"
                  aria-label={`Go to speaker slide ${i + 1}`}
                  onclick={() => (speakerIndex = i)}
                  class={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    speakerIndex === i ? "w-6 bg-amber-500" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                ></button>
              {/each}
            </div>
            <span class="text-[11px] font-bold text-muted-foreground">
              {speakerIndex + 1} / {previousSpeakers.length}
            </span>
          </div>
        </div>

        <!-- Box 2: Previous Sponsors -->
        <div 
          class="rounded-3xl border-2 border-border/70 bg-card p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 relative group overflow-hidden"
          onmouseenter={() => (isSponsorPaused = true)}
          onmouseleave={() => (isSponsorPaused = false)}
          role="region"
          aria-label="Previous Sponsors Slideshow"
        >
          <div class="space-y-6">
            <!-- Box Header -->
            <div class="flex items-center justify-between pb-4 border-b border-border/60">
              <div class="flex items-center gap-3">
                <div class="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <Handshake class="size-5" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-foreground">Previous Sponsors</h3>
                  <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Corporate Partners</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous Sponsor"
                  onclick={() => (sponsorIndex = (sponsorIndex - 1 + previousSponsors.length) % previousSponsors.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronLeft class="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next Sponsor"
                  onclick={() => (sponsorIndex = (sponsorIndex + 1) % previousSponsors.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronRight class="size-4" />
                </button>
              </div>
            </div>

            <!-- Slideshow Content -->
            {#if currentSponsor}
              <div class="space-y-5 transition-all duration-500">
                <!-- Sponsor Logo Showcase -->
                <div class="relative rounded-2xl overflow-hidden aspect-4/3 bg-card border-2 border-border/60 flex items-center justify-center p-8 shadow-inner group-hover:border-blue-500/30 transition-colors">
                  <div class="absolute top-3 right-3">
                    <Badge class="bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                      {currentSponsor.category}
                    </Badge>
                  </div>
                  <img
                    src={currentSponsor.logo}
                    alt={currentSponsor.name}
                    class="max-h-24 w-auto max-w-[80%] object-contain filter drop-shadow-md transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div class="absolute bottom-3 left-3">
                    <Badge variant="outline" class="text-[9px] font-semibold uppercase tracking-wider bg-background/80 backdrop-blur-sm">
                      {currentSponsor.sector}
                    </Badge>
                  </div>
                </div>

                <!-- Sponsor Name & Impact Details -->
                <div class="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <div class="flex items-center justify-between">
                    <h4 class="text-base font-extrabold text-foreground">
                      {currentSponsor.name}
                    </h4>
                    <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {currentSponsor.badge}
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground font-medium leading-relaxed">
                    {currentSponsor.desc}
                  </p>
                </div>
              </div>
            {/if}
          </div>

          <!-- Slide Controls & Indicator Footer -->
          <div class="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              {#each previousSponsors as _, i}
                <button
                  type="button"
                  aria-label={`Go to sponsor slide ${i + 1}`}
                  onclick={() => (sponsorIndex = i)}
                  class={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    sponsorIndex === i ? "w-6 bg-blue-500" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                ></button>
              {/each}
            </div>
            <a href="/awards/sponsorship" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Become a Sponsor
              <ArrowUpRight class="size-3.5" />
            </a>
          </div>
        </div>

        <!-- Box 3: Previous Winners -->
        <div 
          class="rounded-3xl border-2 border-border/70 bg-card p-6 lg:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 relative group overflow-hidden"
          onmouseenter={() => (isWinnerPaused = true)}
          onmouseleave={() => (isWinnerPaused = false)}
          role="region"
          aria-label="Previous Winners Slideshow"
        >
          <div class="space-y-6">
            <!-- Box Header -->
            <div class="flex items-center justify-between pb-4 border-b border-border/60">
              <div class="flex items-center gap-3">
                <div class="size-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Award class="size-5" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-foreground">Previous Winners</h3>
                  <p class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Hall of Fame</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous Winner"
                  onclick={() => (winnerIndex = (winnerIndex - 1 + previousWinners.length) % previousWinners.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronLeft class="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next Winner"
                  onclick={() => (winnerIndex = (winnerIndex + 1) % previousWinners.length)}
                  class="size-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronRight class="size-4" />
                </button>
              </div>
            </div>

            <!-- Slideshow Content -->
            {#if currentWinner}
              <div class="space-y-5 transition-all duration-500">
                <!-- Winner Portrait & Golden Badge -->
                <div class="relative rounded-2xl overflow-hidden aspect-4/3 bg-muted/60 border border-border/60 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                  <img
                    src={currentWinner.image}
                    alt={currentWinner.name}
                    class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <div class="flex items-center gap-2 mb-1.5">
                      <Badge class="bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
                        {currentWinner.awardType}
                      </Badge>
                      <Badge variant="outline" class="border-white/30 text-white font-bold text-[9px]">
                        {currentWinner.year} Edition
                      </Badge>
                    </div>
                    <h4 class="text-lg font-extrabold tracking-tight leading-snug text-white">
                      {currentWinner.name}
                    </h4>
                    <p class="text-xs text-emerald-200/90 font-semibold line-clamp-1">
                      {currentWinner.org}
                    </p>
                  </div>
                </div>

                <!-- Winner Achievement Details -->
                <div class="space-y-2 p-3.5 rounded-xl bg-muted/30 border border-border/40">
                  <div class="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Trophy class="size-3.5 text-amber-500 shrink-0" />
                    <span class="line-clamp-1">{currentWinner.awardType}</span>
                  </div>
                  <p class="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                    {currentWinner.desc}
                  </p>
                </div>
              </div>
            {/if}
          </div>

          <!-- Slide Controls & Indicator Footer -->
          <div class="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              {#each previousWinners as _, i}
                <button
                  type="button"
                  aria-label={`Go to winner slide ${i + 1}`}
                  onclick={() => (winnerIndex = i)}
                  class={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    winnerIndex === i ? "w-6 bg-emerald-500" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                ></button>
              {/each}
            </div>
            <a href="/awards/winners" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All Winners
              <ArrowUpRight class="size-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Final CTA Section -->
  <section class="py-24 bg-muted/30 border-t border-border/40">
    <div class="container mx-auto px-4">
      <div class="rounded-3xl bg-primary shadow-2xl p-12 lg:p-20 text-center relative overflow-hidden text-primary-foreground">
        <div class="absolute -right-20 -top-20 size-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -bottom-20 size-80 bg-white/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 max-w-3xl mx-auto space-y-6">
          <Badge class="bg-amber-500 text-slate-950 font-bold px-4 py-1 text-xs uppercase tracking-widest">
            7th Edition • October 27, 2026
          </Badge>
          <h2 class="text-3xl lg:text-5xl font-bold tracking-tight">
            Be Part of Africa's Premier Tech Leadership Night
          </h2>
          <p class="text-xl text-primary-foreground/90 font-medium leading-relaxed">
            Join 1,000+ CIOs, C-Suite executives, and innovators for a night of recognition, networking, and celebration.
          </p>
          <div class="pt-6">
            <Button
              href="https://rsvp.app-wt.com.ng/the-cio-c-suite-awards-africa-2026"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
              class="rounded-xl shadow-xl font-extrabold px-10 h-14 text-base gap-3"
            >
              <Ticket class="size-5" />
              Get your Ticket
              <ArrowRight class="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 35s linear infinite;
  }

  .animate-marquee:hover {
    animation-play-state: paused;
  }
</style>
