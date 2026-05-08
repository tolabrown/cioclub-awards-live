import { db } from './src/lib/db';
import { awardWinner } from './src/lib/db/schema';
import { desc } from 'drizzle-orm';

async function checkLatestYear() {
  const latestWinner = await db.query.awardWinner.findFirst({
    orderBy: [desc(awardWinner.year)]
  });
  console.log('Latest Winner Year:', latestWinner?.year);

  const allYears = await db.query.awardWinner.findMany({
    columns: { year: true },
    distinct: true,
  });
  console.log('All available years:', allYears.map(y => y.year));

  process.exit(0);
}

checkLatestYear();
