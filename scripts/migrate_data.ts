import postgres from 'postgres';

const SRC_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";
const DST_URL = "postgresql://admin:0ayM5DhiIn0Z2kNMVBM0@13.140.153.234:5001/cio";

async function runMigration() {
  const src = postgres(SRC_URL, { max: 10, idle_timeout: 20 });
  const dst = postgres(DST_URL, { max: 10, idle_timeout: 20 });

  try {
    console.log("=== STARTING MIGRATION ===");
    console.log("Fetching table list from source...");
    const tablesRes = await src`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tables = tablesRes.map(t => t.table_name);
    console.log(`Found ${tables.length} tables to migrate.`);

    console.log("\n=== COMPARING & ALIGNING SCHEMAS ===");
    // Get all columns from source and destination
    const srcCols = await src`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public';
    `;
    const dstCols = await dst`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public';
    `;

    // Map columns by table
    const srcColsMap: Record<string, typeof srcCols> = {};
    const dstColsMap: Record<string, string[]> = {};

    srcCols.forEach(c => {
      if (!srcColsMap[c.table_name]) srcColsMap[c.table_name] = [];
      srcColsMap[c.table_name].push(c);
    });

    dstCols.forEach(c => {
      if (!dstColsMap[c.table_name]) dstColsMap[c.table_name] = [];
      dstColsMap[c.table_name].push(c.column_name);
    });

    for (const table of tables) {
      const sCols = srcColsMap[table] || [];
      const dCols = dstColsMap[table] || [];

      const missingCols = sCols.filter(sc => !dCols.includes(sc.column_name));

      if (missingCols.length > 0) {
        console.log(`Table [${table}] has missing columns in destination. Aligning...`);
        for (const col of missingCols) {
          console.log(`- Adding missing column [${col.column_name}] of type [${col.data_type}] to table [${table}] in destination...`);
          
          let alterQuery = `ALTER TABLE "${table}" ADD COLUMN "${col.column_name}" ${col.data_type}`;
          
          // Add default value if present in source and it's not a sequence nextval
          if (col.column_default && !col.column_default.startsWith('nextval')) {
            alterQuery += ` DEFAULT ${col.column_default}`;
          }
          
          await dst.unsafe(alterQuery);
          console.log(`  Successfully added column [${col.column_name}]`);
        }
      }
    }

    console.log("\n=== DISABLING TRIGGERS ON DESTINATION ===");
    for (const table of tables) {
      try {
        await dst.unsafe(`ALTER TABLE "${table}" DISABLE TRIGGER ALL;`);
        console.log(`- Disabled triggers for [${table}]`);
      } catch (err: any) {
        console.error(`Warning: Failed to disable triggers on [${table}]:`, err.message);
      }
    }

    console.log("\n=== TRANSFERRING DATA ===");
    for (const table of tables) {
      console.log(`Processing table [${table}]...`);
      
      // 1. Clear any existing data in destination table
      await dst.unsafe(`DELETE FROM "${table}";`);
      console.log(`- Cleared existing data in [${table}]`);

      // 2. Fetch data from source
      const rows = await src.unsafe(`SELECT * FROM "${table}";`);
      console.log(`- Fetched ${rows.length} rows from source.`);

      if (rows.length > 0) {
        // Chunk inserts to avoid query parameter limit / memory issues
        const CHUNK_SIZE = 500;
        for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
          const chunk = rows.slice(i, i + CHUNK_SIZE);
          
          // Use postgres.js bulk insert syntax: sql`INSERT INTO table ${sql(chunk)}`
          await dst`INSERT INTO ${dst(table)} ${dst(chunk)}`;
        }
        console.log(`- Successfully inserted ${rows.length} rows into destination.`);
      } else {
        console.log(`- Table is empty, skipping insert.`);
      }
    }

    console.log("\n=== RE-ENABLING TRIGGERS ON DESTINATION ===");
    for (const table of tables) {
      try {
        await dst.unsafe(`ALTER TABLE "${table}" ENABLE TRIGGER ALL;`);
        console.log(`- Re-enabled triggers for [${table}]`);
      } catch (err: any) {
        console.error(`Warning: Failed to enable triggers on [${table}]:`, err.message);
      }
    }

    console.log("\n=== SYNCING SEQUENCE VALUES ===");
    // Find all columns with serial/identity sequences
    const seqColumns = await dst`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND column_default LIKE 'nextval%'
    `;
    
    for (const col of seqColumns) {
      const { table_name, column_name } = col;
      console.log(`- Syncing sequence for table [${table_name}], column [${column_name}]...`);
      try {
        // Find the sequence name associated with the column
        const seqRes = await dst.unsafe(`
          SELECT pg_get_serial_sequence('"${table_name}"', '${column_name}') AS seq_name;
        `);
        const seqName = seqRes[0]?.seq_name;
        
        if (seqName) {
          await dst.unsafe(`
            SELECT pg_catalog.setval('${seqName}', COALESCE(MAX("${column_name}"), 1)) FROM "${table_name}";
          `);
          console.log(`  Successfully reset sequence [${seqName}]`);
        } else {
          console.log(`  No sequence found for ${table_name}.${column_name}`);
        }
      } catch (err: any) {
        console.error(`Warning: Failed to sync sequence for ${table_name}.${column_name}:`, err.message);
      }
    }

    console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");

  } catch (error) {
    console.error("\n!!! MIGRATION FAILED !!!", error);
    
    // Attempt recovery of triggers just in case
    console.log("\nAttempting to re-enable triggers on all destination tables due to failure...");
    try {
      const tablesRes = await dst`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
      `;
      for (const t of tablesRes) {
        await dst.unsafe(`ALTER TABLE "${t.table_name}" ENABLE TRIGGER ALL;`).catch(() => {});
      }
      console.log("Triggers enabled successfully during cleanup.");
    } catch (cleanupErr) {
      console.error("Failed to restore triggers during cleanup:", cleanupErr);
    }
  } finally {
    await src.end();
    await dst.end();
  }
}

runMigration();
