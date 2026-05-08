import { getPageContent } from '$lib/db/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const content = await getPageContent('/about', {
    hero: {
      title: "Driving Africa's Digital Revolution",
      subtitle: "Established 2021",
      description: "The CIO & C-Suite Club Africa is the premier non-profit organization dedicated to the professional growth and Success of technology leaders across the continent."
    },
    mission: {
      title: "Our Mission",
      description: "To empower African IT leaders through world-class research, advocacy, and collaborative platforms that drive continental digital excellence and sustainable technological growth."
    },
    vision: {
      title: "Our Vision",
      description: "To be the definitive catalyst for Africa's transformation into a global digital powerhouse led by insightful, ethical, and strategic technology executives who shape the future."
    },
    coreValues: [
      {
        title: "Excellence",
        description: "We strive for the highest standards in everything we do, from strategic planning to event execution.",
        iconName: "Shield",
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Innovation",
        description: "Continuously evolving and embracing disruptive technologies to stay ahead in the tech landscape.",
        iconName: "Lightbulb",
        color: "text-accent-gold",
        bgColor: "bg-accent-gold/10",
      },
      {
        title: "Collaboration",
        description: "Building strong, cross-continental networks across Africa's diverse technology ecosystem.",
        iconName: "Users",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
      },
      {
        title: "Integrity",
        description: "Maintaining transparency and ethical leadership in all our continental engagements.",
        iconName: "Scale",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
      }
    ],
    objectives: [
      {
        title: "Knowledge Exchange",
        description: "Fostering cross-border collaboration and experience sharing among IT executives through dedicated platforms.",
        iconName: "Presentation",
      },
      {
        title: "Policy Advocacy",
        description: "Engaging with regulators and governments to shape tech-friendly policies that drive digital growth.",
        iconName: "Handshake",
      },
      {
        title: "Capacity Building",
        description: "Supporting the development of the next generation of African tech leaders through mentorship.",
        iconName: "Zap",
      }
    ]
  });

  return {
    content
  };
};
