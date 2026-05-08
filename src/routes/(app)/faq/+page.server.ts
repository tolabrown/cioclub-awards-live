import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    faqs: [
      {
        question: "Who Can Attend?",
        answer: "The CIO & C-Suite Conference & Awards Africa is exclusively designed for senior technology and business leaders, including CIOs, CTOs, CEOs, and other C-Suite executives. It’s a valuable event for IT directors, technology innovators, and digital transformation specialists."
      },
      {
        question: "How do I register to attend?",
        answer: "You can register directly through our platform once registration re-opens for the 2025 season. Details will be shared on our website and communication channels."
      },
      {
        question: "Are the Awards Open for Nominations?",
        answer: "Submission opens March of each year and closes in August of the same year. Updated timelines will be shared on our website and communication channels."
      },
      {
        question: `Where will the ${new Date().getFullYear()} edition take place?`,
        answer: "The 2025 Conference and Awards will be hosted in The Civic Center, Lagos, Nigeria bringing together leaders from across the continent."
      },
      {
        question: "How can my company become a sponsor or exhibitor?",
        answer: "Partnership opportunities are available across Platinum, Gold, Silver, Media, and Exhibitor categories. Interested organizations can reach out to Racheal at racheal@edniesalconsulting.com."
      },
      {
        question: "Will there be opportunities for networking?",
        answer: "Yes. The Conference is designed to maximize networking opportunities through dedicated sessions, exhibitions, and social events where leaders can connect and collaborate."
      },
      {
        question: "Will the event be streamed online?",
        answer: "Yes. A virtual attendance option will be available for participants unable to join physically. Details would be communicated in due time."
      }
    ]
  };
};
