/**
 * Run once to create DynamoDB tables.
 * Usage: node server/scripts/create-tables.js
 */
import 'dotenv/config';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'af-south-1' });

async function ensureTable(def) {
  try {
    await client.send(new DescribeTableCommand({ TableName: def.TableName }));
    console.log(`✓ ${def.TableName} already exists`);
    return;
  } catch (e) {
    if (e.name !== 'ResourceNotFoundException') throw e;
  }
  await client.send(new CreateTableCommand(def));
  console.log(`✓ Created ${def.TableName}`);
}

// ── Original tables ──────────────────────────────────────────────────────────
await ensureTable({
  TableName: 'minecon_exhibitor_applications',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',    AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

// ── Marketplace tables ───────────────────────────────────────────────────────
await ensureTable({
  TableName: 'minecon_job_listings',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',           AttributeType: 'S' },
    { AttributeName: 'exhibitor_id', AttributeType: 'S' },
    { AttributeName: 'created_date', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'exhibitor_id-index',
      KeySchema: [
        { AttributeName: 'exhibitor_id', KeyType: 'HASH' },
        { AttributeName: 'created_date', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

await ensureTable({
  TableName: 'minecon_job_applications',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',           AttributeType: 'S' },
    { AttributeName: 'job_id',       AttributeType: 'S' },
    { AttributeName: 'created_date', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'job_id-index',
      KeySchema: [
        { AttributeName: 'job_id',       KeyType: 'HASH' },
        { AttributeName: 'created_date', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

await ensureTable({
  TableName: 'minecon_tender_listings',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',           AttributeType: 'S' },
    { AttributeName: 'exhibitor_id', AttributeType: 'S' },
    { AttributeName: 'created_date', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'exhibitor_id-index',
      KeySchema: [
        { AttributeName: 'exhibitor_id', KeyType: 'HASH' },
        { AttributeName: 'created_date', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

await ensureTable({
  TableName: 'minecon_auctions',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',         AttributeType: 'S' },
    { AttributeName: 'status',     AttributeType: 'S' },
    { AttributeName: 'start_date', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'status-index',
      KeySchema: [
        { AttributeName: 'status',     KeyType: 'HASH' },
        { AttributeName: 'start_date', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

await ensureTable({
  TableName: 'minecon_enquiries',
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    { AttributeName: 'id',           AttributeType: 'S' },
    { AttributeName: 'exhibitor_id', AttributeType: 'S' },
    { AttributeName: 'created_date', AttributeType: 'S' },
  ],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'exhibitor_id-index',
      KeySchema: [
        { AttributeName: 'exhibitor_id', KeyType: 'HASH' },
        { AttributeName: 'created_date', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
});

console.log('\nAll done.');
