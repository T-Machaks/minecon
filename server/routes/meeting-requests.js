import { crudRouter } from '../lib/crudRouter.js';

export default crudRouter('minecon_meeting_requests', {
  defaults: () => ({ status: 'Pending' }),
  gsiFields: { exhibitor_id: 'exhibitor-index' },
});
