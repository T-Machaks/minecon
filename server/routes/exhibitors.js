import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_exhibitors', {
  defaults: () => ({ featured: false }),
  extraRoutes(r) {
    // GET /api/exhibitors/demo-list — active exhibitors for demo login dropdown
    r.get('/demo-list', async (req, res) => {
      try {
        const result = await ddb.send(new ScanCommand({
          TableName: 'minecon_exhibitors',
          FilterExpression: '#s = :s',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':s': 'active' },
          ProjectionExpression: 'id, company_name, logo_url, user_id, tier',
        }));
        const items = (result.Items || []).sort((a, b) =>
          (a.company_name || '').localeCompare(b.company_name || '')
        );
        res.json(items);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
});
