import postgres from 'postgres';

const DST_URL = "postgresql://admin:0ayM5DhiIn0Z2kNMVBM0@13.140.153.234:5001/cio";

async function main() {
  const sql = postgres(DST_URL, { connect_timeout: 5 });
  try {
    const eventsResult = await sql`
      SELECT e.title, e.description, e.date, e.location, e.status, 
             f1.url as cover_image_url, f2.url as image_url
      FROM event e
      LEFT JOIN file f1 ON e.cover_image_id = f1.id
      LEFT JOIN file f2 ON e.image_id = f2.id
      WHERE e.date >= NOW() 
      ORDER BY e.date ASC 
      LIMIT 1
    `;
    console.log("Upcoming Event with Images:", JSON.stringify(eventsResult, null, 2));
  } catch (err: any) {
    console.error("Error:", err.message || err);
  } finally {
    await sql.end();
  }
}

main().catch(console.error);
