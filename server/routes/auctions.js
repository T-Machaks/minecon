import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { crudRouter } from '../lib/crudRouter.js';

const TABLE = 'minecon_auctions';

export default crudRouter(TABLE, {
  gsiFields: { status: 'status-index' },
  defaults: () => ({ status: 'Upcoming', created_date: new Date().toISOString() }),

  extraRoutes(r) {
    // POST /api/auctions/:id/lots/:lotNumber/bid
    r.post('/:id/lots/:lotNumber/bid', async (req, res) => {
      try {
        const { id, lotNumber } = req.params;
        const { bid_amount, bidder_name, bidder_email } = req.body;

        if (!bid_amount || !bidder_name || !bidder_email) {
          return res.status(400).json({ error: 'bid_amount, bidder_name and bidder_email are required.' });
        }

        const amount = Number(bid_amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return res.status(400).json({ error: 'bid_amount must be a positive number.' });
        }

        const { Item: auction } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { id } }));
        if (!auction) return res.status(404).json({ error: 'Auction not found.' });
        if (auction.status !== 'Live') return res.status(400).json({ error: 'This auction is not currently live.' });

        const lots = Array.isArray(auction.featured_lots) ? [...auction.featured_lots] : [];
        const lotIdx = lots.findIndex(l => String(l.lot_number) === String(lotNumber));
        if (lotIdx === -1) return res.status(404).json({ error: 'Lot not found.' });

        const lot = lots[lotIdx];
        if (lot.status !== 'Open') return res.status(400).json({ error: 'This lot is not open for bidding.' });

        const currentBid = Number(lot.current_bid) || 0;
        const increment  = Number(lot.bid_increment) || 500;
        const starting   = Number(lot.starting_bid)  || 0;
        const minBid     = currentBid > 0 ? currentBid + increment : starting;

        if (amount < minBid) {
          return res.status(400).json({ error: `Minimum bid is USD ${minBid.toLocaleString()}.` });
        }

        lots[lotIdx] = {
          ...lot,
          current_bid: amount,
          bid_count: (Number(lot.bid_count) || 0) + 1,
          last_bid_at: new Date().toISOString(),
          last_bidder: bidder_name,
        };

        await ddb.send(new UpdateCommand({
          TableName: TABLE,
          Key: { id },
          UpdateExpression: 'SET featured_lots = :lots',
          ExpressionAttributeValues: { ':lots': lots },
        }));

        res.json({ ok: true, lot: lots[lotIdx] });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  },
});
