import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  await sql`
    UPDATE file 
    SET url = '/ladies_in_tech_1920x1080.webp'
    WHERE id = '25e36834-1f92-4aaa-8e5e-90a692391052'
  `;
  console.log('Updated image_url');
  
  await sql`
    UPDATE file 
    SET url = '/ladies_in_tech_1920x720.webp'
    WHERE id = '7d085d18-c617-433c-8d3c-ccc751cc8003'
  `;
  console.log('Updated cover_image_url');
  
  process.exit(0);
}

main().catch(console.error);
