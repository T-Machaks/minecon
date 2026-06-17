import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_virtual_enquiries', {
  defaults: () => ({ status: 'New' }),
  gsiFields: { exhibitor_id: 'exhibitor-index' },
});
