import { db } from '$lib/db';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export type NominationPeriodStatus = 'not_set' | 'upcoming' | 'active' | 'closed';

export type NominationPeriod = {
  startDate: string | null;
  endDate: string | null;
  status: NominationPeriodStatus;
};

export async function getNominationPeriod(): Promise<NominationPeriod> {
  const content = await db.query.pageContent.findFirst({
    where: eq(pageContent.path, '/awards')
  });

  if (!content) return { startDate: null, endDate: null, status: 'not_set' };

  const data = JSON.parse(content.data);
  const period = data.nominationPeriod;

  if (!period?.startDate || !period?.endDate) {
    return { startDate: null, endDate: null, status: 'not_set' };
  }

  const now = new Date();
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  let status: NominationPeriodStatus = 'not_set';
  if (now < start) status = 'upcoming';
  else if (now >= start && now <= end) status = 'active';
  else status = 'closed';

  return { startDate: period.startDate, endDate: period.endDate, status };
}
