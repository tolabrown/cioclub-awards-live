import postgres from 'postgres';

const SRC_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";
const DST_URL = "postgresql://admin:0ayM5DhiIn0Z2kNMVBM0@13.140.153.234:5001/cio";

async function compare() {
  const src = postgres(SRC_URL, { idle_timeout: 5 });
  const dst = postgres(DST_URL, { idle_timeout: 5 });

  try {
    console.log("=== COMPARING COLUMNS IN ALL TABLES ===");
    
    const srcCols = await src`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `;
    
    const dstCols = await dst`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `;

    // Group columns by table
    const srcMap: Record<string, { col: string; type: string }[]> = {};
    const dstMap: Record<string, { col: string; type: string }[]> = {};

    srcCols.forEach(c => {
      if (!srcMap[c.table_name]) srcMap[c.table_name] = [];
      srcMap[c.table_name].push({ col: c.column_name, type: c.data_type });
    });

    dstCols.forEach(c => {
      if (!dstMap[c.table_name]) dstMap[c.table_name] = [];
      dstMap[c.table_name].push({ col: c.column_name, type: c.data_type });
    });

    const tables = Object.keys(srcMap);
    let mismatchesFound = false;

    for (const table of tables) {
      const srcTableCols = srcMap[table] || [];
      const dstTableCols = dstMap[table] || [];

      const srcColNames = srcTableCols.map(c => c.col);
      const dstColNames = dstTableCols.map(c => c.col);

      // Columns in src but not dst
      const missingInDst = srcColNames.filter(c => !dstColNames.includes(c));
      // Columns in dst but not src
      const missingInSrc = dstColNames.filter(c => !srcColNames.includes(c));

      if (missingInDst.length > 0 || missingInSrc.length > 0) {
        mismatchesFound = true;
        console.log(`Mismatch in Table [${table}]:`);
        if (missingInDst.length > 0) {
          console.log(`  - Missing in Destination: ${missingInDst.join(', ')}`);
        }
        if (missingInSrc.length > 0) {
          console.log(`  - Extra in Destination (Not in Source): ${missingInSrc.join(', ')}`);
        }
      }

      // Check type mismatches for common columns
      for (const col of srcTableCols) {
        const dstCol = dstTableCols.find(c => c.col === col.col);
        if (dstCol && dstCol.type !== col.type) {
          mismatchesFound = true;
          console.log(`Type mismatch in Table [${table}], Column [${col.col}]: Source has [${col.type}], Destination has [${dstCol.type}]`);
        }
      }
    }

    if (!mismatchesFound) {
      console.log("No mismatches found between source and destination column structures!");
    }

  } catch (err) {
    console.error("Error comparing:", err);
  } finally {
    await src.end();
    await dst.end();
  }
}

compare();
