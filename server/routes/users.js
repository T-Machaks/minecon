import { ScanCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { crudRouter } from '../lib/crudRouter.js';

const TABLE = 'minecon_users';

function sanitize(user) {
  if (!user) return null;
  const { password_hash, totp_secret, ...rest } = user;
  return rest;
}

export default crudRouter(TABLE, {
  defaults: () => ({ role: 'attendee', status: 'active' }),
  extraRoutes(r) {
    // /by-email MUST be registered before /:id so Express matches it first.
    r.get('/by-email', async (req, res) => {
      try {
        const email = req.query.email?.toLowerCase();
        if (!email) return res.status(400).json({ error: 'email required' });
        const result = await ddb.send(new QueryCommand({
          TableName: TABLE,
          IndexName: 'email-index',
          KeyConditionExpression: 'email = :e',
          ExpressionAttributeValues: { ':e': email },
          Limit: 1,
        }));
        res.json(sanitize(result.Items?.[0] ?? null));
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Override GET / — strip password_hash and totp_secret from every row.
    r.get('/', async (req, res) => {
      try {
        const { sortBy } = req.query;
        const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
        let items = (result.Items || []).map(sanitize);
        if (sortBy) {
          const desc = sortBy.startsWith('-');
          const field = desc ? sortBy.slice(1) : sortBy;
          items.sort((a, b) => {
            const av = a[field] ?? '';
            const bv = b[field] ?? '';
            return desc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
          });
        }
        res.json(items);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Override GET /:id (registered after /by-email so that path takes priority).
    r.get('/:id', async (req, res) => {
      try {
        const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id: req.params.id } }));
        if (!result.Item) return res.status(404).json({ error: 'Not found' });
        res.json(sanitize(result.Item));
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Override PUT /:id — reject attempts to write sensitive fields, sanitize response.
    r.put('/:id', async (req, res) => {
      try {
        const { password_hash: _ph, totp_secret: _ts, id: _id, ...body } = req.body;
        const entries = Object.entries(body);
        if (!entries.length) return res.status(400).json({ error: 'No fields to update' });
        const names = {};
        const values = {};
        const sets = entries.map(([k, v], i) => {
          names[`#f${i}`] = k;
          values[`:v${i}`] = v;
          return `#f${i} = :v${i}`;
        });
        const result = await ddb.send(new UpdateCommand({
          TableName: TABLE,
          Key: { id: req.params.id },
          UpdateExpression: `SET ${sets.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: 'ALL_NEW',
        }));
        res.json(sanitize(result.Attributes));
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
});
