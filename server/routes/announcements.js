import { GetCommand, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { crudRouter } from '../lib/crudRouter.js';
import { generateId } from '../lib/idgen.js';

const TABLE = 'minecon_announcements';

// Mirrors boothTiers.js sponsoredPostCredits — keep in sync if tiers change.
const SPONSORED_CREDITS = { Diamond: 3, Gold: 1, Chrome: 0, Copper: 0 };

export default crudRouter(TABLE, {
  defaults: () => ({ type: 'General', pinned: false }),
  extraRoutes(r) {
    // POST / — intercepts before crudRouter's generic POST to enforce quota on sponsored posts.
    r.post('/', async (req, res) => {
      try {
        const body = req.body;

        if (body.sponsored && body.exhibitor_id) {
          const exResult = await ddb.send(new GetCommand({
            TableName: 'minecon_exhibitors',
            Key: { id: body.exhibitor_id },
          }));
          const exhibitor = exResult.Item;
          if (!exhibitor) return res.status(404).json({ error: 'Exhibitor not found.' });

          const credits = SPONSORED_CREDITS[exhibitor.tier] ?? 0;
          if (credits === 0) {
            return res.status(403).json({
              error: `${exhibitor.tier || 'Your'} tier does not include sponsored posts.`,
              quota: 0,
              used: 0,
            });
          }

          const scan = await ddb.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: 'exhibitor_id = :eid AND sponsored = :t',
            ExpressionAttributeValues: { ':eid': body.exhibitor_id, ':t': true },
          }));
          const used = (scan.Items || []).length;

          if (used >= credits) {
            return res.status(403).json({
              error: `Sponsored post quota reached (${credits} for ${exhibitor.tier} tier).`,
              quota: credits,
              used,
            });
          }
        }

        const item = {
          id: generateId(),
          created_date: new Date().toISOString(),
          type: 'General',
          pinned: false,
          ...body,
        };
        await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
        res.status(201).json(item);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
});
