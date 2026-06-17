import { Router } from 'express';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { crudRouter } from '../lib/crudRouter.js';

const TABLE = 'minecon_registrations';

export default crudRouter(TABLE, {
  defaults: () => ({
    role_type: 'Attendee',
    ticket_type: 'General Admission',
    badge_category: 'Visitor',
    status: 'Pending',
    otp_verified: false,
    day1: true,
    day2: false,
    day3: false,
    token: crypto.randomUUID(),
    checked_in: false,
    check_in_time: null,
  }),
  extraRoutes(r) {
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
        res.json(result.Items?.[0] ?? null);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
});
