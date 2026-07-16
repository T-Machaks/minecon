/**
 * Fixes the Nicknel Zimbabwe demo stand:
 *  - Renames "Nicknel Zimbabwe" → "Nicnel Zimbabwe"
 *  - Copies logo_url from any existing "nicnel" exhibitor that has one
 * Run on server: node scripts/patch-nicnel.js
 */
import 'dotenv/config';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';

const TABLE = 'minecon_exhibitors';

const { Items: all = [] } = await ddb.send(new ScanCommand({ TableName: TABLE }));

// Find all exhibitors whose name contains "nicnel" (case-insensitive)
const nicnelRecords = all.filter(e => e.name?.toLowerCase().includes('nicnel'));
console.log(`Found ${nicnelRecords.length} record(s) containing "nicnel":`);
nicnelRecords.forEach(e => console.log(`  [${e.tier}] ${e.name} — logo: ${e.logo_url || '(none)'}`));

// The demo stand to fix: Diamond tier, name contains "nicknel"
const demo = all.find(e => e.name?.toLowerCase().includes('nicknel'));
if (!demo) {
  console.log('\n⚠  No "Nicknel" record found — nothing to patch.');
  process.exit(0);
}

// Find a logo from any other nicnel record (prefer one with a real URL)
const logoSource = nicnelRecords.find(e => e.id !== demo.id && e.logo_url);
const logoUrl = logoSource?.logo_url ?? demo.logo_url ?? '';

console.log(`\nPatching: "${demo.name}" (id: ${demo.id})`);
console.log(`  New name : Nicnel Zimbabwe`);
console.log(`  Logo URL : ${logoUrl || '(unchanged)'}`);

const updateExpr = logoUrl
  ? 'SET #n = :name, logo_url = :logo, company_name = :name'
  : 'SET #n = :name, company_name = :name';

const exprValues = logoUrl
  ? { ':name': 'Nicnel Zimbabwe', ':logo': logoUrl }
  : { ':name': 'Nicnel Zimbabwe' };

await ddb.send(new UpdateCommand({
  TableName: TABLE,
  Key: { id: demo.id },
  UpdateExpression: updateExpr,
  ExpressionAttributeNames: { '#n': 'name' },
  ExpressionAttributeValues: exprValues,
}));

// Also fix the user account if linked
if (demo.user_id) {
  const USER_TABLE = 'minecon_users';
  await ddb.send(new UpdateCommand({
    TableName: USER_TABLE,
    Key: { id: demo.user_id },
    UpdateExpression: 'SET full_name = :n, company = :n',
    ExpressionAttributeValues: { ':n': 'Nicnel Zimbabwe' },
  }));
  console.log(`  User account updated too (id: ${demo.user_id})`);
}

console.log('\n✓ Done.');
