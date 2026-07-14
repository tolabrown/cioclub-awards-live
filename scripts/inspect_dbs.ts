import postgres from 'postgres';

const SRC_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";
const DST_URL = "postgresql://admin:0ayM5DhiIn0Z2kNMVBM0@13.140.153.234:5001/cio";

async function inspect() {
  const src = postgres(SRC_URL, { idle_timeout: 5 });
  const dst = postgres(DST_URL, { idle_timeout: 5 });

  try {
    console.log("=== CONNECTING ===");
    
    // Fetch tables from source
    const srcTables = await src`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    // Fetch tables from destination
    const dstTables = await dst`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const srcTableNames = srcTables.map(t => t.table_name);
    const dstTableNames = dstTables.map(t => t.table_name);

    console.log(`Source Tables (${srcTableNames.length}):`, srcTableNames.join(', '));
    console.log(`Destination Tables (${dstTableNames.length}):`, dstTableNames.join(', '));

    console.log("\n=== ROW COUNTS & DETAILS ===");
    for (const tableName of srcTableNames) {
      // Get row count
      const countRes = await src`SELECT COUNT(*)::integer FROM ${src(tableName)}`;
      const rowCount = countRes[0].count;

      // Check if table exists in destination
      const existsInDst = dstTableNames.includes(tableName);
      
      console.log(`- Table [${tableName}]: ${rowCount} rows (Exists in destination: ${existsInDst ? 'YES' : 'NO'})`);
    }

  } catch (err) {
    console.error("Error inspecting databases:", err);
  } finally {
    await src.end();
    await dst.end();
  }
}

inspect();
