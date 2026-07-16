import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_enquiries', {
  gsiFields: { exhibitor_id: 'exhibitor_id-index' },
  defaults: () => ({ status: 'New', created_date: new Date().toISOString() }),
});
