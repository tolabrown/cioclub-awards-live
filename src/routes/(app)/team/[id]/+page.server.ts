import { db } from '$lib/db';
import { trustee } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const member = await db.query.trustee.findFirst({
    where: eq(trustee.id, id),
    with: {
      image: true
    }
  });

  if (!member) {
    throw error(404, 'Member not found');
  }

  // Structure profile for the frontend
  const profile = {
    id: member.id,
    name: member.name,
    role: member.role || member.position,
    image: member.image?.url || "/hero-bg.webp",
    bio: member.bio ? member.bio.split('\n').filter(p => p.trim()) : ["No biography available."],
    shortRole: member.position || "Executive Council",
    stats: [
      { label: "Experience", value: "Expert Leader" },
      { label: "Role", value: (member.role || member.position).split(',')[0] }
    ],
    expertise: [
      "Digital Transformation",
      "Strategy",
      "Leadership"
    ],
    socials: {
      linkedin: member.linkedinUrl || "#",
      twitter: "#" // Twitter not in schema yet
    }
  };

  return {
    member: profile
  };
};
