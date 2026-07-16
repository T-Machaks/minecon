import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_auctions', {
  gsiFields: { status: 'status-index' },
  defaults: () => ({ status: 'Upcoming', created_date: new Date().toISOString() }),
});
