import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_job_listings', {
  gsiFields: { exhibitor_id: 'exhibitor_id-index' },
  defaults: () => ({ status: 'Open', created_date: new Date().toISOString() }),
});
