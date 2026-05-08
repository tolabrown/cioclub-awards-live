const postgres = require('postgres');
const sql = postgres('postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio');
sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'award_winner'`.then(res => {
  console.log('COLUMNS:', res.map(r => r.column_name).join(', '));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
